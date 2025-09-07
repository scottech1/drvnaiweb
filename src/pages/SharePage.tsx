import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Download, Car } from 'lucide-react'

const APP_STORE_URLS = {
  ios: 'https://itunes.apple.com/app/id6748619728?mt=8',
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

export default function SharePage() {
  const { token } = useParams<{ token: string }>()
  const [platform, setPlatform] = useState<'ios' | 'android' | 'web'>('web')
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState('')

  useEffect(() => {
    setPlatform(detectPlatform())
  }, [])

  const tryUniversalLink = async (shareToken: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const universalLink = `https://mobile.drvnai.app/share/${shareToken}`
      const deepLink = `drvnai://share/${shareToken}`
      console.log('Attempting universal link:', universalLink)
      console.log('Attempting deep link:', deepLink)
      
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
      
      // Try deep link first, then universal link
      try {
        window.location.href = deepLink
        
        // Fallback to universal link after short delay
        setTimeout(() => {
          if (!appOpened) {
            window.location.href = universalLink
          }
        }, 1000)
      } catch (error) {
        console.log('Deep link failed, trying universal link:', error)
        window.location.href = universalLink
      }
      
      // Set a timeout to detect if the app opened
      const timeout = setTimeout(() => {
        document.removeEventListener('visibilitychange', handleVisibilityChange)
        window.removeEventListener('blur', handleBlur)
        resolve(false) // Universal link failed
      }, 2500)
    })
  }

  const startCountdown = () => {
    let seconds = 3
    
    const updateCountdown = () => {
      if (seconds > 0) {
        setCountdown(`Redirecting to app store in ${seconds} seconds...`)
        seconds--
        setTimeout(updateCountdown, 1000)
      } else {
        // Simple, reliable navigation
        const storeUrl = APP_STORE_URLS[platform] || APP_STORE_URLS.ios
        console.log('Countdown finished, navigating to:', storeUrl)
        window.location.href = storeUrl
      }
    }
    
    updateCountdown()
  }

  const handleDownloadClick = async () => {    
    if (platform !== 'web' && token) {
      setLoading(true)
      
      try {
        const deepLinkWorked = await tryUniversalLink(token)
        
        if (!deepLinkWorked) {
          setLoading(false)
          // Start countdown before navigating to app store
          startCountdown()
          return
        }
      } catch (error) {
        console.error('Error during deep link:', error)
        setLoading(false)
        startCountdown()
        return
      }
    } else {
      startCountdown()
    }
  }

  const navigateToAppStore = () => {
    console.log('Navigating to app store for platform:', platform)
    
    const storeUrl = APP_STORE_URLS[platform] || APP_STORE_URLS.ios
    console.log('Direct navigation to:', storeUrl)
    
    // Use window.location.href for most reliable navigation
    window.location.href = storeUrl
  }

  const getButtonText = () => {
    if (loading) return 'Opening app...'
    
    switch (platform) {
      case 'ios':
        return 'Open in App Store'
      case 'android':
        return 'Open in Google Play'
      default:
        return 'Download App'
    }
  }

  return (
    <div className="container">
      <div className="app-icon">
        <img src="/assets/app-icon.png" alt="Drvn AI" />
      </div>
      
      <h1 className="title">Vehicle Shared on Drvn AI</h1>
      <p className="subtitle">
        Someone has shared their vehicle with you! Download Drvn AI to view the complete details.
      </p>
      
      <button 
        onClick={handleDownloadClick} 
        className="primary-button"
        disabled={loading}
      >
        <Download size={20} style={{ marginRight: '8px', display: 'inline' }} />
        {getButtonText()}
      </button>
      
      {loading && (
        <div className="loading show">
          Attempting to open app...
        </div>
      )}
      
      {countdown && (
        <div className="countdown">
          {countdown}
        </div>
      )}

      <div className="features">
        <div className="feature">
          <Car className="feature-icon" size={24} />
          <span className="feature-text">Track multiple vehicles</span>
        </div>
        <div className="feature">
          <span className="feature-icon">🔧</span>
          <span className="feature-text">Maintenance reminders</span>
        </div>
        <div className="feature">
          <span className="feature-icon">⚡</span>
          <span className="feature-text">Performance tracking</span>
        </div>
        <div className="feature">
          <span className="feature-icon">🤖</span>
          <span className="feature-text">AI mechanic assistant</span>
        </div>
      </div>
    </div>
  )
}