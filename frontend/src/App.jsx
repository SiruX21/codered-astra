import { useState, useRef } from 'react'
import { useAuth } from './context/AuthContext'
import api from './services/api'
import Auth from './components/Auth'
import Subscription from './components/Subscription'
import './App.css'

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
      <div className="app">
        <header className="header">
          <div className="header-content">
            <h1>🎨 Fursona Generator</h1>
            <div className="user-menu">
              <span>{user?.email}</span>
              <button onClick={() => setShowSubscription(false)} className="nav-button">
                Home
              </button>
              <button onClick={logout} className="logout-button">
                Logout
              </button>
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
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div>
            <h1>🎨 Fursona Generator</h1>
            <p>Upload an image and let AI create your unique fursona!</p>
          </div>
          <div className="user-menu">
            <span className="user-email">{user?.email}</span>
            {subscription && (
              <div className="subscription-badge">
                <span className="plan-name">{subscription.plan_type}</span>
                <span className="usage">
                  {subscription.generations_used}/{subscription.generations_limit === 999999 ? '∞' : subscription.generations_limit}
                </span>
              </div>
            )}
            <button onClick={() => setShowSubscription(true)} className="nav-button">
              Plans
            </button>
            <button onClick={logout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="main-content">
        {!preview ? (
          <div
            className={`dropzone ${isDragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="dropzone-content">
              <div className="upload-icon">📸</div>
              <h2>Drop your image here</h2>
              <p>or click to browse</p>
              <p className="file-types">Supports: JPG, PNG, GIF, WebP</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              style={{ display: 'none' }}
            />
          </div>
        ) : (
          <div className="preview-section">
            <div className="image-preview">
              <img src={preview} alt="Uploaded preview" />
              <button className="reset-btn" onClick={handleReset}>
                ✕
              </button>
            </div>

            {!result && (
              <button
                className="generate-btn"
                onClick={handleGenerate}
                disabled={loading}
              >
                {loading ? '✨ Generating...' : '🎨 Generate Fursona'}
              </button>
            )}

            {result && (
              <div className="result-section">
                <h2>Your Fursona:</h2>
                <div className="result-content">
                  {result}
                </div>
                <div className="action-buttons">
                  <button className="generate-btn" onClick={handleGenerate} disabled={loading}>
                    {loading ? '✨ Regenerating...' : '🔄 Regenerate'}
                  </button>
                  <button className="secondary-btn" onClick={handleReset}>
                    🆕 New Image
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}
      </main>

      <footer className="footer">
        <p>💡 Tip: Upload photos of pets, yourself, or anything for inspiration!</p>
        {subscription && subscription.plan_type === 'free' && (
          <p className="upgrade-hint">
            Running low on generations? <button onClick={() => setShowSubscription(true)} className="upgrade-link">Upgrade your plan</button>
          </p>
        )}
      </footer>
    </div>
  )
}

export default App
