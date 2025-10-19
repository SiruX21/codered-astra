import React, { useState, useEffect, useMemo, useRef } from "react";
import { useDropzone } from "react-dropzone";

export function Previews() {
  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [fursonaName, setFursonaName] = useState(null);
  const [fursonaDescription, setFursonaDescription] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const { getRootProps, getInputProps, isFocused, isDragAccept, isDragReject } =
    useDropzone({
      disabled: processing,
      multiple: false,
      maxFiles: 1,
      accept: { "image/*": [] },
      onDrop: async (acceptedFiles) => {
        const selected = acceptedFiles[0];
        if (!selected) return;

        // Revoke previous preview to avoid memory leaks
        if (file?.preview) URL.revokeObjectURL(file.preview);

        const newFile = Object.assign(selected, {
          preview: URL.createObjectURL(selected),
        });
        setFile(newFile);
        setProcessing(true);

        await uploadToBackend(newFile);
      },
    });

  // 🌀 Border color logic
  const borderColor = useMemo(() => {
    if (isDragAccept) return "border-green-400";
    if (isDragReject) return "border-red-400";
    if (isFocused) return "border-blue-400";
    return "border-gray-300";
  }, [isFocused, isDragAccept, isDragReject]);

  async function uploadToBackend(file) {
    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("https://apifursona.siru.dev/analyze-image", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Flask server error");
      }

      // Extract fursona name and description from response
      setFursonaName(data.gemini_response?.fursona_name || "unknown");
      setFursonaDescription(data.gemini_response?.fursona_description || "A unique match!");
    } catch (err) {
      console.error("Upload error:", err);
      setFursonaName("error");
      setFursonaDescription("⚠️ Error uploading to Flask backend");
    } finally {
      setProcessing(false);
    }
  }

  // 📷 Camera functions
  async function startCamera() {
    try {
      console.log('📷 Requesting camera access...');
      
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Your browser doesn't support camera access. Please use a modern browser like Chrome, Firefox, or Safari.");
        return;
      }

      // Check current permission state first
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const permissionStatus = await navigator.permissions.query({ name: 'camera' });
          console.log('📹 Camera permission status:', permissionStatus.state);
          
          if (permissionStatus.state === 'denied') {
            alert('Camera access is blocked. Please enable it in your browser settings.');
            return;
          }
        } catch (err) {
          console.log('Permission API not fully supported, continuing anyway...');
        }
      }

      // Show camera UI immediately
      setShowCamera(true);

      // Request camera with basic constraints - longer timeout
      const mediaStream = await Promise.race([
        navigator.mediaDevices.getUserMedia({ 
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Camera timeout - taking too long to start')), 10000)
        )
      ]);
      
      console.log('✅ Camera access granted!');
      console.log('📹 Video tracks:', mediaStream.getVideoTracks());
      setStream(mediaStream);
      
      // Wait for video element to be available and set stream
      setTimeout(() => {
        if (videoRef.current && mediaStream) {
          videoRef.current.srcObject = mediaStream;
          
          // Add event listener to confirm video is playing
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play().then(() => {
              console.log('✅ Video stream connected and playing');
            }).catch(err => {
              console.error('Error playing video:', err);
            });
          };
        }
      }, 100);
    } catch (err) {
      console.error("Camera error:", err);
      setShowCamera(false); // Close modal on error
      
      let errorMessage = "Failed to access camera. ";
      
      if (err.message && err.message.includes('timeout')) {
        errorMessage += "Camera is taking too long to start. Try closing other apps that might be using the camera.";
      } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage += "Please allow camera access in your browser settings.";
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage += "No camera found on this device.";
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMessage += "Camera is already in use by another application.";
      } else if (err.name === 'OverconstrainedError') {
        errorMessage += "Camera doesn't meet requirements.";
      } else if (err.name === 'AbortError') {
        errorMessage += "Camera initialization was aborted. Please try again.";
      } else {
        errorMessage += err.message || "Unknown error occurred.";
      }
      
      alert(errorMessage);
    }
  }

  function stopCamera() {
    console.log('🛑 Stopping camera...');
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        console.log('Stopped track:', track.kind);
      });
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
  }

  function capturePhoto() {
    if (!videoRef.current || !canvasRef.current) {
      console.error('Video or canvas ref not available');
      return;
    }

    const video = videoRef.current;
    
    // Check if video is ready
    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      alert('Camera is still loading. Please wait a moment and try again.');
      return;
    }
    
    const canvas = canvasRef.current;
    
    console.log('📸 Capturing photo...');
    console.log('Video dimensions:', video.videoWidth, 'x', video.videoHeight);
    
    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    
    console.log('✅ Photo captured, converting to file...');
    
    // Convert canvas to blob
    canvas.toBlob(async (blob) => {
      if (!blob) {
        alert('Failed to capture photo. Please try again.');
        return;
      }
      
      const capturedFile = new File([blob], "camera-capture.jpg", { 
        type: "image/jpeg" 
      });
      
      console.log('✅ File created:', capturedFile.size, 'bytes');
      
      const newFile = Object.assign(capturedFile, {
        preview: URL.createObjectURL(capturedFile),
      });
      
      setFile(newFile);
      setProcessing(true);
      stopCamera();
      
      await uploadToBackend(newFile);
    }, 'image/jpeg', 0.95);
  }

  useEffect(() => {
    return () => {
      if (file?.preview) URL.revokeObjectURL(file.preview);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [file, stream]);

  return (
    <section className="container mx-auto px-6 py-10">
      {/* Camera Modal - Seamless overlay */}
      {showCamera && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black bg-opacity-30">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-3xl w-full animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">📷 Take a Photo</h2>
              <button
                onClick={stopCamera}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="relative bg-black rounded-xl overflow-hidden shadow-inner mb-6">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline
                muted
                className="w-full h-auto max-h-[60vh] object-contain"
                onLoadedMetadata={() => console.log('Video loaded')}
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={capturePhoto}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
              >
                <span className="text-xl">📸</span>
                <span className="ml-2">Capture Photo</span>
              </button>
              <button
                onClick={stopCamera}
                className="px-8 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-4 rounded-xl transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload box with camera button */}
      <div className="space-y-4">
        <div
          {...getRootProps()}
          className={`flex flex-col items-center justify-center p-24 border-2 border-dashed rounded-md transition-colors duration-200 cursor-pointer bg-gray-50 hover:bg-gray-100 ${borderColor}`}
        >
          <input {...getInputProps()} />
          <p className="text-gray-500 text-center text-xl">
            Click or drag & drop an image to upload
          </p>
        </div>

        {/* Camera button */}
        <div className="flex justify-center">
          <button
            onClick={startCamera}
            disabled={processing}
            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-md"
          >
            📷 Use Camera
          </button>
        </div>
      </div>

      {/* Preview section */}
      {file && (
        <div className="flex flex-col md:flex-row items-center justify-between mt-10 gap-8">
          {/* Image preview */}
          <div className="flex justify-center">
            <img
              src={file.preview}
              alt="preview"
              className="max-h-[600px] rounded-md shadow-md object-contain border border-gray-200"
            />
          </div>

          {/* Arrow symbol */}
          <img
            src="/symbols/arrow.png"
            alt="arrow"
            className="w-16 h-16 md:w-24 md:h-24 opacity-70"
          />

          {/* Response display */}
          <div className="flex flex-col justify-center items-center max-w-md">
            {processing ? (
              <h1 className="text-4xl font-bold rainbow-text">Processing...</h1>
            ) : fursonaName ? (
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 text-center">Your Fursona:</h2>
                <img 
                  src={`/${fursonaName.trim().toLowerCase()}.PNG`} 
                  alt={fursonaName}
                  className="w-full max-w-sm rounded-lg shadow-md"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/placeholder.png'; // fallback image
                  }}
                />
                <p className="text-gray-700 text-center mt-4 text-xl font-semibold capitalize">{fursonaName}</p>
                {fursonaDescription && (
                  <div className="mt-4 p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                    <p className="text-gray-700 text-center text-base leading-relaxed">
                      {fursonaDescription}
                    </p>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </section>
  );
}
