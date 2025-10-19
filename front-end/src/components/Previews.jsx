import React, { useState, useEffect, useMemo } from "react";
import { useDropzone } from "react-dropzone";

export function Previews() {
  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);

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

      const res = await fetch("http://localhost:5000/analyze-image", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Flask server error");
      }

      setResponse(data.gemini_response?.text || "No response from Gemini.");
    } catch (err) {
      console.error("Upload error:", err);
      setResponse("⚠️ Error uploading to Flask backend");
    } finally {
      setProcessing(false);
    }
  }

  useEffect(() => {
    return () => {
      if (file?.preview) URL.revokeObjectURL(file.preview);
    };
  }, [file]);

  return (
    <section className="container mx-auto px-6 py-10">
      {/* Upload box */}
      <div
        {...getRootProps()}
        className={`flex flex-col items-center justify-center p-24 border-2 border-dashed rounded-md transition-colors duration-200 cursor-pointer bg-gray-50 hover:bg-gray-100 ${borderColor}`}
      >
        <input {...getInputProps()} />
        <p className="text-gray-500 text-center text-xl">
          Click or drag & drop an image to upload
        </p>
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

          {/* Processing status */}
          <div className="flex flex-col justify-center items-center">
            <h1 className="text-4xl font-bold rainbow-text">Processing...</h1>
          </div>
        </div>
      )}
    </section>
  );
}
