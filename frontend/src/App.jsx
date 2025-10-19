import { useState, useRef } from 'react'
import api from './services/api'
import './App.css'

function App() {
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFileInput = (e) => {
    const files = e.target.files
    if (files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFile = (file) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file')
      return
    }

    setImage(file)
    setError(null)
    setResult(null)

    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleGenerate = async () => {
    if (!image) return

    setLoading(true)
    setError(null)

    try {
      const reader = new FileReader()
      reader.onloadend = async () => {
        try {
          const data = await api.generateFursona(reader.result)
          setResult(data.description)
        } catch (err) {
          setError(err.message)
        } finally {
          setLoading(false)
        }
      }
      reader.readAsDataURL(image)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  const handleReset = () => {
    setImage(null)
    setPreview(null)
    setResult(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100">
      <header className="bg-white/80 backdrop-blur-sm shadow-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-4xl sm:text-5xl font-bold text-center bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
            🎨 Fursona Generator
          </h1>
          <p className="text-center text-gray-600 mt-2">Upload an image and let AI create your fursona!</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 md:p-12">
          {!preview ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-4 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all
                ${isDragging 
                  ? 'border-purple-500 bg-purple-50 scale-105' 
                  : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
                }`}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="text-6xl">📸</div>
                <p className="text-xl font-bold text-gray-700">Drop an image here</p>
                <p className="text-gray-500">or click to browse</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="relative">
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="w-full max-h-96 object-contain rounded-xl shadow-lg"
                />
                <button
                  onClick={handleReset}
                  className="absolute top-4 right-4 bg-red-500 text-white p-3 rounded-full hover:bg-red-600 transition-all shadow-lg"
                >
                  ✕
                </button>
              </div>

              {!result && !loading && (
                <button
                  onClick={handleGenerate}
                  className="w-full py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white text-lg font-bold rounded-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
                >
                  ✨ Generate Fursona
                </button>
              )}

              {loading && (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600"></div>
                  <p className="mt-4 text-gray-600 font-semibold">Creating your fursona...</p>
                </div>
              )}

              {error && (
                <div className="bg-red-100 border-2 border-red-400 text-red-700 px-6 py-4 rounded-xl">
                  <p className="font-bold">❌ Error</p>
                  <p>{error}</p>
                </div>
              )}

              {result && (
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6">
                  <h2 className="text-2xl font-bold text-purple-900 mb-4 flex items-center gap-2">
                    <span>🎉</span>
                    <span>Your Fursona</span>
                  </h2>
                  <div className="prose prose-purple max-w-none">
                    <pre className="whitespace-pre-wrap text-gray-800 font-sans">{result}</pre>
                  </div>
                  <button
                    onClick={handleReset}
                    className="mt-6 w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:shadow-xl transition-all"
                  >
                    🔄 Generate Another
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="text-center py-8 text-gray-600">
        <p>Made with 💜 by AI | Powered by Gemini</p>
      </footer>
    </div>
  )
}

export default App
