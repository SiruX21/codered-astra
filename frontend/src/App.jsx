import { useState, useRef } from 'react'
import { useAuth } from './context/AuthContext'
import api from './services/api'
import Auth from './components/Auth'
import Subscription from './components/Subscription'

function App() {
  const { user, subscription, logout, refreshSubscription, isAuthenticated } = useAuth()
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [showSubscription, setShowSubscription] = useState(false)
  const fileInputRef = useRef(null)

  if (!isAuthenticated) {
    return <Auth />
  }

  if (showSubscription) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                🎨 Fursona Generator
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-gray-600 text-sm">{user?.email}</span>
                <button 
                  onClick={() => setShowSubscription(false)} 
                  className="px-4 py-2 border-2 border-primary-500 text-primary-500 rounded-lg font-bold hover:bg-primary-500 hover:text-white transition-all"
                >
                  Home
                </button>
                <button 
                  onClick={logout} 
                  className="px-4 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition-all"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>
        <Subscription />
      </div>
    )
  }

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

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleGenerate = async () => {
    if (!image) return

    // Check subscription limit
    if (subscription && subscription.generations_used >= subscription.generations_limit) {
      setError('Generation limit reached! Please upgrade your plan.')
      setShowSubscription(true)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Convert image to base64
      const reader = new FileReader()
      reader.onloadend = async () => {
        try {
          const data = await api.generateFursona(reader.result)
          setResult(data.description)
          // Refresh subscription to update usage
          await refreshSubscription()
        } catch (err) {
          if (err.message.includes('Generation limit reached')) {
            setError('Generation limit reached! Please upgrade your plan.')
            setShowSubscription(true)
          } else {
            setError(err.message || 'Failed to generate fursona')
          }
          console.error(err)
        } finally {
          setLoading(false)
        }
      }
      reader.readAsDataURL(image)
    } catch (err) {
      setError('Failed to process image')
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent mb-2">
                🎨 Fursona Generator
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">Upload an image and let AI create your unique fursona!</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-gray-600 text-sm">{user?.email}</span>
              {subscription && (
                <div className="bg-primary-50 px-4 py-2 rounded-full flex items-center gap-2">
                  <span className="font-bold text-primary-500 uppercase text-xs">{subscription.plan_type}</span>
                  <span className="text-gray-600 text-xs">
                    {subscription.generations_used}/{subscription.generations_limit === 999999 ? '∞' : subscription.generations_limit}
                  </span>
                </div>
              )}
              <button 
                onClick={() => setShowSubscription(true)} 
                className="px-4 py-2 border-2 border-primary-500 text-primary-500 rounded-lg font-bold hover:bg-primary-500 hover:text-white transition-all"
              >
                Plans
              </button>
              <button 
                onClick={logout} 
                className="px-4 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 flex flex-col items-center gap-8">
        {!preview ? (
          <div
            className={`w-full min-h-[400px] border-3 border-dashed rounded-[20px] flex items-center justify-center cursor-pointer transition-all ${
              isDragging 
                ? 'border-secondary-500 bg-primary-100 scale-105' 
                : 'border-primary-500 bg-primary-50 hover:border-secondary-500 hover:bg-primary-100 hover:scale-[1.02]'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="text-center p-8">
              <div className="text-7xl mb-4 animate-float">📸</div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Drop your image here</h2>
              <p className="text-lg text-gray-600 mb-4">or click to browse</p>
              <p className="text-sm text-gray-500">Supports: JPG, PNG, GIF, WebP</p>
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
          <div className="w-full flex flex-col items-center gap-8">
            <div className="relative w-full max-w-2xl rounded-[20px] overflow-hidden shadow-2xl">
              <img src={preview} alt="Uploaded preview" className="w-full h-auto block" />
              <button 
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 hover:bg-red-500 text-gray-800 hover:text-white text-xl flex items-center justify-center shadow-lg transition-all hover:rotate-90"
                onClick={handleReset}
              >
                ✕
              </button>
            </div>

            {!result && (
              <button
                className="px-12 py-4 text-xl font-bold rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                onClick={handleGenerate}
                disabled={loading}
              >
                {loading ? '✨ Generating...' : '🎨 Generate Fursona'}
              </button>
            )}

            {result && (
              <div className="w-full animate-fadeIn">
                <h2 className="text-3xl font-semibold text-center mb-4 text-gray-800">Your Fursona:</h2>
                <div className="bg-primary-50 rounded-[15px] p-8 whitespace-pre-wrap leading-relaxed text-gray-800 shadow-md">
                  {result}
                </div>
                <div className="flex gap-4 justify-center mt-8 flex-wrap">
                  <button 
                    className="px-8 py-3 text-lg font-bold rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    onClick={handleGenerate} 
                    disabled={loading}
                  >
                    {loading ? '✨ Regenerating...' : '🔄 Regenerate'}
                  </button>
                  <button 
                    className="px-8 py-3 text-lg font-bold rounded-full border-2 border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white transition-all"
                    onClick={handleReset}
                  >
                    🆕 New Image
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-500 text-white px-8 py-4 rounded-lg text-lg text-center animate-shake shadow-lg">
            ⚠️ {error}
          </div>
        )}
      </main>

      <footer className="text-center py-8 text-gray-500">
        <p className="mb-2">💡 Tip: Upload photos of pets, yourself, or anything for inspiration!</p>
        {subscription && subscription.plan_type === 'free' && (
          <p className="text-primary-500">
            Running low on generations?{' '}
            <button 
              onClick={() => setShowSubscription(true)} 
              className="underline font-bold hover:text-secondary-500 transition-colors"
            >
              Upgrade your plan
            </button>
          </p>
        )}
      </footer>
    </div>
  )
}

export default App
