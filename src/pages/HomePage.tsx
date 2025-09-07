import React, { useEffect, useState } from 'react'
import { Download, Car, Wrench, Zap, MessageCircle } from 'lucide-react'

const APP_STORE_URLS = {
  ios: 'https://apps.apple.com/in/app/drvnai/id6748619728',
  android: 'https://play.google.com/store/apps/details?id=com.sgesdevllc.drvnai'
}

function detectPlatform() {
  const userAgent = navigator.userAgent || (navigator as any).vendor || (window as any).opera
  
  if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
    return 'ios'
  }
  
  if (/android/i.test(userAgent)) {
    return 'android'
  }
  
  return 'web'
}

export default function HomePage() {
  const [platform, setPlatform] = useState<'ios' | 'android' | 'web'>('web')
  const [isNavigating, setIsNavigating] = useState(false)

  useEffect(() => {
    // Check for password reset link and redirect
    const hash = window.location.hash
    if (hash.includes('type=recovery') && hash.includes('access_token=')) {
      console.log('Password reset link detected, redirecting with fragments...')
      window.location.href = '/reset-password' + hash
      return
    }

    setPlatform(detectPlatform())
  }, [])

  const handleDownloadClick = async () => {
    setIsNavigating(true)
    
    try {
      // For Safari on iOS, use a more direct approach
      if (platform === 'ios') {
        // Create a temporary anchor element for better Safari compatibility
        const link = document.createElement('a')
        link.href = APP_STORE_URLS.ios
        link.target = '_blank'
        link.rel = 'noopener noreferrer'
        
        // Add to DOM temporarily
        document.body.appendChild(link)
        
        // Trigger click
        link.click()
        
        // Clean up
        document.body.removeChild(link)
        
        // Fallback: try window.open after a short delay
        setTimeout(() => {
          window.open(APP_STORE_URLS.ios, '_blank', 'noopener,noreferrer')
        }, 100)
        
        // Additional fallback: direct window location
        setTimeout(() => {
          window.location.href = APP_STORE_URLS.ios
        }, 500)
      } else {
        // For Android and other platforms
        const storeUrl = APP_STORE_URLS[platform]
        if (storeUrl) {
          window.open(storeUrl, '_blank', 'noopener,noreferrer')
        }
      }
    } catch (error) {
      console.error('Navigation error:', error)
      // Final fallback
      window.location.href = APP_STORE_URLS[platform]
    } finally {
      setTimeout(() => setIsNavigating(false), 2000)
    }
  }

  const getButtonText = () => {
    if (isNavigating) return 'Opening App Store...'
    
    switch (platform) {
      case 'ios':
        return 'Download from App Store'
      case 'android':
        return 'Download from Google Play'
      default:
        return 'Download Drvn AI'
    }
  }

  return (
    <div className="container">
      <div className="app-icon">
        <img src="/assets/app-icon.png" alt="Drvn AI" />
      </div>
      
      <h1 className="title">Drvn AI</h1>
      <p className="subtitle">
        Track your vehicles, maintenance, and modifications with AI-powered insights.
      </p>
      
      <button onClick={handleDownloadClick} className="primary-button">
        <Download size={20} style={{ marginRight: '8px', display: 'inline' }} />
        {getButtonText()}
      </button>
      
      <div className="features">
        <div className="feature">
          <Car className="feature-icon" size={24} />
          <span className="feature-text">Track multiple vehicles</span>
        </div>
        <div className="feature">
          <Wrench className="feature-icon" size={24} />
          <span className="feature-text">Maintenance reminders</span>
        </div>
        <div className="feature">
          <Zap className="feature-icon" size={24} />
          <span className="feature-text">Performance tracking</span>
        </div>
        <div className="feature">
          <MessageCircle className="feature-icon" size={24} />
          <span className="feature-text">AI mechanic assistant</span>
        </div>
      </div>
    </div>
  )
}