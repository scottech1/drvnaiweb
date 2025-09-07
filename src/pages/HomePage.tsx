import React, { useEffect, useState } from 'react'
import { Download, Car, Wrench, Zap, MessageCircle } from 'lucide-react'

const APP_STORE_URLS = {
  ios: 'https://apps.apple.com/app/drvn-ai/id6748619728',
  android: 'https://play.google.com/store/apps/details?id=com.sgesdevllc.drvnai'
}

const DEEP_LINKS = {
  universal: 'https://mobile.drvnai.app/',
  custom: 'drvnai://'
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

function detectAppInstallation(): Promise<{ isInstalled: boolean; method?: string }> {
  return new Promise((resolve) => {
    console.log('🔍 Detecting app installation...')
    
    // Track if app opens (user leaves page)
    let appOpened = false
    let detectionMethod = ''
    
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('✅ App detected via visibilitychange')
        appOpened = true
        detectionMethod = 'visibilitychange'
      }
    }
    
    const handleBlur = () => {
      console.log('✅ App detected via blur')
      appOpened = true
      detectionMethod = 'blur'
    }
    
    const handleFocus = () => {
      // If page regains focus quickly, app probably didn't open
      setTimeout(() => {
        if (!appOpened) {
          console.log('❌ Page regained focus - app likely not installed')
        }
      }, 100)
    }
    
    // Add event listeners for app detection
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleBlur)
    window.addEventListener('focus', handleFocus)
    
    // Try multiple deep link approaches
    try {
      console.log('🚀 Trying custom scheme:', DEEP_LINKS.custom)
      
      // Method 1: Try custom scheme
      const iframe = document.createElement('iframe')
      iframe.style.display = 'none'
      iframe.src = DEEP_LINKS.custom
      document.body.appendChild(iframe)
      
      // Method 2: Try universal link after short delay
      setTimeout(() => {
        if (!appOpened) {
          console.log('🚀 Trying universal link:', DEEP_LINKS.universal)
          window.location.href = DEEP_LINKS.universal
        }
      }, 500)
      
      // Clean up iframe
      setTimeout(() => {
        if (iframe.parentNode) {
          iframe.parentNode.removeChild(iframe)
        }
      }, 1000)
      
    } catch (error) {
      console.log('❌ Deep link attempt failed:', error)
    }
    
    // Final detection timeout
    setTimeout(() => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('focus', handleFocus)
      
      if (appOpened) {
        console.log(`✅ App is installed (detected via ${detectionMethod})`)
        resolve({ isInstalled: true, method: detectionMethod })
      } else {
        console.log('❌ App is not installed or failed to open')
        resolve({ isInstalled: false })
      }
    }, 3000)
  })
}

export default function HomePage() {
  const [platform, setPlatform] = useState<'ios' | 'android' | 'web'>('web')
  const [loading, setLoading] = useState(false)
  const [appInstalled, setAppInstalled] = useState<boolean | null>(null)
  const [buttonText, setButtonText] = useState('Check App...')

  useEffect(() => {
    const detectedPlatform = detectPlatform()
    setPlatform(detectedPlatform)
    
    // Only check for app installation on mobile platforms
    if (detectedPlatform !== 'web') {
      checkAppInstallation()
    } else {
      setAppInstalled(false)
      setButtonText('Download App')
    }
  }, [])

  const checkAppInstallation = async () => {
    try {
      setLoading(true)
      setButtonText('Checking app...')
      
      const result = await detectAppInstallation()
      
      setAppInstalled(result.isInstalled)
      
      if (result.isInstalled) {
        setButtonText('Open Drvn AI App')
      } else {
        setButtonText(platform === 'ios' ? 'Download from App Store' : 'Download from Google Play')
      }
    } catch (error) {
      console.error('Error checking app installation:', error)
      setAppInstalled(false)
      setButtonText('Download App')
    } finally {
      setLoading(false)
    }
  }

  const getAppStoreUrl = () => {
    return APP_STORE_URLS[platform] || APP_STORE_URLS.ios
  }

  const handleButtonClick = async () => {
    if (loading) return
    
    setLoading(true)
    
    if (appInstalled === true) {
      // App is installed - try to open it
      console.log('📱 App is installed, attempting to open...')
      setButtonText('Opening app...')
      
      try {
        // Try to open the app
        const result = await detectAppInstallation()
        
        if (!result.isInstalled) {
          // App failed to open, maybe it was uninstalled
          console.log('🔄 App failed to open, redirecting to store...')
          setButtonText('Redirecting to store...')
          setTimeout(() => {
            window.open(getAppStoreUrl(), '_blank')
          }, 500)
        }
      } catch (error) {
        console.error('Error opening app:', error)
        window.open(getAppStoreUrl(), '_blank')
      }
    } else {
      // App is not installed - go to store
      console.log('📦 App not installed, redirecting to store...')
      setButtonText('Opening store...')
      
      setTimeout(() => {
        window.open(getAppStoreUrl(), '_blank')
      }, 500)
    }

    // Reset loading after delay
    setTimeout(() => {
      setLoading(false)
      if (appInstalled === true) {
        setButtonText('Open Drvn AI App')
      } else {
        setButtonText(platform === 'ios' ? 'Download from App Store' : 'Download from Google Play')
      }
    }, 2000)
  }

  const handleDownloadClick = async () => {
    if (loading) return
    if (platform !== 'web') {
      setPlatform(detectPlatform())
    }
  }

  const getStatusMessage = () => {
    if (loading) return 'Checking for app installation...'
    if (appInstalled === true) return 'App detected on your device'
    if (appInstalled === false) return 'App not found - download to get started'
    return 'Checking app status...'
  }

  const getButtonIcon = () => {
    if (appInstalled === true) {
      return <Car size={20} style={{ marginRight: '8px', display: 'inline' }} />
    } else {
      return <Download size={20} style={{ marginRight: '8px', display: 'inline' }} />
    }
  }

  return (
    <div className="container">
      <div className="app-icon">
        <img src="/assets/app-icon.png" alt="Drvn AI" />
      </div>
      
      <h1 className="title">Drvn AI</h1>
      <p className="subtitle">
        {getStatusMessage()}
      </p>
      
      <button 
        onClick={handleButtonClick} 
        className="primary-button"
        disabled={loading}
      >
        {getButtonIcon()}
        {buttonText}
      </button>
      
      {appInstalled === false && (
        <p className="subtitle" style={{ marginTop: '16px', fontSize: '14px' }}>
          Track your vehicles, maintenance, and modifications with AI-powered insights.
        </p>
      )}
      
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