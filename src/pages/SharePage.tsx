import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Download, Car } from 'lucide-react'

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

export default function SharePage() {
  const { token } = useParams<{ token: string }>()
  const [platform, setPlatform] = useState<'ios' | 'android' | 'web'>('web')
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState('')

  useEffect(() => {
    setPlatform(detectPlatform())
  }, [])

  const tryUniversalLink = async (shareToken: string): Promise<boolean> => {
    alert('universal link')
    return new Promise((resolve) => {
      const universalLink = `https://mobile.drvnai.app/share/${shareToken}`
      console.log('Attempting universal link:', universalLink)
       alert('universal link inside')
      // Create a hidden iframe to trigger the universal link
      const iframe = document.createElement('iframe')
      iframe.style.display = 'none'
      iframe.src = universalLink
      document.body.appendChild(iframe)
      
      // Also try direct window location as fallback
      window.location.href = universalLink
       alert('universal link inside 2')
      
      // Clean up iframe after attempt
      setTimeout(() => {
        if (iframe.parentNode) {
          iframe.parentNode.removeChild(iframe)
        }
      }, 1000)
      
      // Set a timeout to detect if the app opened
      const timeout = setTimeout(() => {
        resolve(false) // Universal link failed
      }, 2500)
      
      // If the page becomes hidden, the app likely opened
      const handleVisibilityChange = () => {
        alert('VISIBILiTY')
        if (document.hidden) {
          clearTimeout(timeout)
          document.removeEventListener('visibilitychange', handleVisibilityChange)
          resolve(true) // App opened successfully
        }
      }
      
      document.addEventListener('visibilitychange', handleVisibilityChange)
      
      // For iOS, also listen for pagehide event
      const handlePageHide = () => {
        clearTimeout(timeout)
        window.removeEventListener('pagehide', handlePageHide)
        resolve(true)
      }
      
      window.addEventListener('pagehide', handlePageHide)
    })
  }

 const startCountdown = () => {
  let seconds = 3

  alert(seconds);
  const updateCountdown = () => {
    if (seconds > 0) {
      setCountdown(`Redirecting to ${platform === 'ios' ? 'App Store' : 'Google Play'} in ${seconds} seconds...`)
      seconds--
      setTimeout(updateCountdown, 1000)
    } else {
     
      const storeUrl =  APP_STORE_URLS.ios
       alert(storeUrl);
      window.location.href = storeUrl
    }
  }

  updateCountdown()
}

const handleDownloadClick = async () => {
  alert(platform)
  alert(token)
  if (platform !== 'web' && token) {
    setLoading(true)

    try {
      const deepLinkWorked = await tryUniversalLink(token)
      alert(deepLinkWorked);
      if (!deepLinkWorked) {
        setLoading(false)
        startCountdown() // will redirect after countdown
        return
      }
    } catch (error) {
      console.error('Error during deep link:', error)
      setLoading(false)
      startCountdown()
      return
    }
  }

  // Fallback if platform detection failed
  const storeUrl =  APP_STORE_URLS.ios
  window.location.href = storeUrl
}

  const getButtonText = () => {
    if (loading) return 'Opening app...'
    
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
      
      <h1 className="title">Vehicle Shared on Drvn AI</h1>
      <p className="subtitle">
        Someone has shared their vehicle with you! Download Drvn AI to view the complete details.
      </p>
      
      <button 
        onClick={() =>handleDownloadClick()} 
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