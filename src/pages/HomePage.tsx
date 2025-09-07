import React, { useEffect, useState } from 'react'
import { Download, Car, Wrench, Zap, MessageCircle } from 'lucide-react'

const APP_STORE_URLS = {
  ios: 'https://apps.apple.com/app/id6748619728',
  android: 'https://play.google.com/store/apps/details?id=com.sgesdevllc.drvnai'
}

const DEEP_LINK_URLS = {
  ios: 'drvnai://',
  android: 'drvnai://'
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

function tryDeepLink(platform: 'ios' | 'android' | 'web'): Promise<boolean> {
  return new Promise((resolve) => {
    if (platform === 'web') {
      resolve(false)
      return
    }

    const deepLinkUrl = DEEP_LINK_URLS[platform]
    console.log('Trying deep link:', deepLinkUrl)
    
    // Track if user leaves the page (app opened)
    let appOpened = false
    
    const handleVisibilityChange = () => {
      if (document.hidden) {
        appOpened = true
        resolve(true)
      }
    }
    
    const handleBlur = () => {
      appOpened = true
      resolve(true)
    }
    
    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleBlur)
    
    // Try to open the app
    try {
      window.location.href = deepLinkUrl
    } catch (error) {
      console.log('Deep link failed:', error)
    }
    
    // Set timeout to detect if app didn't open
    setTimeout(() => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleBlur)
      
      if (!appOpened) {
        console.log('Deep link failed - app not installed or not working')
        resolve(false)
      }
    }, 2500)
  })
}
export default function HomePage() {
  const [platform, setPlatform] = useState<'ios' | 'android' | 'web'>('web')
  const [loading, setLoading] = useState(false)

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
    if (loading) return
    
    setLoading(true)
    console.log('Download clicked for platform:', platform)
    
    try {
      // First try to open the app if it's mobile
      if (platform !== 'web') {
        console.log('Trying to open app first...')
        const appOpened = await tryDeepLink(platform)
        
        if (appOpened) {
          console.log('App opened successfully')
          setLoading(false)
          return
        }
        
        console.log('App not installed or failed to open, redirecting to store...')
      }
      
      // App didn't open or it's web platform, go to store
      const storeUrl = APP_STORE_URLS[platform] || APP_STORE_URLS.ios
      console.log('Navigating to store:', storeUrl)
      
      // Use direct navigation - most reliable
      window.location.href = storeUrl
      
    } catch (error) {
      console.error('Navigation error:', error)
      // Fallback to direct store navigation
      const storeUrl = APP_STORE_URLS[platform] || APP_STORE_URLS.ios
      window.location.href = storeUrl
    } finally {
      // Reset loading after a delay
      setTimeout(() => setLoading(false), 2000)
    }
  }

  const getButtonText = () => {
    if (loading) return 'Opening...'
    
    switch (platform) {
      case 'ios':
        return 'Download from App Store'
      case 'android':
        return 'Download from Google Play'
      default:
        return 'Download App'
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
      
      <button 
        onClick={handleDownloadClick} 
        className="primary-button"
        disabled={loading}
      >
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