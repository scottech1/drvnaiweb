import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Download, Car } from 'lucide-react'

const APP_STORE_URLS = {
  ios: 'https://apps.apple.com/us/app/drvnai/id6748619728',
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
    
    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleBlur)
    
    // Try to open the app using multiple methods
    try {
      console.log('🚀 Trying custom scheme:', DEEP_LINKS.custom)
      
      // Method 1: Try custom scheme via iframe (less intrusive)
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
    
    // Detection timeout
    setTimeout(() => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleBlur)
      
      if (appOpened) {
        console.log(`✅ App is installed (detected via ${detectionMethod})`)
        resolve({ isInstalled: true, method: detectionMethod })
      } else {
        console.log('❌ App is not installed')
        resolve({ isInstalled: false })
      }
    }, 2500)
  })
}

export default function SharePage() {
  const { token } = useParams<{ token: string }>()
  const [platform, setPlatform] = useState<'ios' | 'android' | 'web'>('web')
  const [loading, setLoading] = useState(false)
  const [appInstalled, setAppInstalled] = useState<boolean | null>(null)
  const [buttonText, setButtonText] = useState('Check App...')
  const [statusMessage, setStatusMessage] = useState('Checking if Drvn AI is installed...')

  useEffect(() => {
    const detectedPlatform = detectPlatform()
    setPlatform(detectedPlatform)
    
    // Only check for app installation on mobile platforms
    if (detectedPlatform !== 'web') {
      checkAppInstallation()
    } else {
      setAppInstalled(false)
      setButtonText('Download App')
      setStatusMessage('Download Drvn AI to view shared vehicle details')
    }
  }, [])

  const checkAppInstallation = async () => {
    try {
      setLoading(true)
      setButtonText('Checking app...')
      setStatusMessage('Detecting if Drvn AI is installed on your device...')
      
      const result = await detectAppInstallation()
      
      setAppInstalled(result.isInstalled)
      
      if (result.isInstalled) {
        setButtonText('Open Shared Vehicle')
        setStatusMessage('Great! Drvn AI is installed. Open the app to view the shared vehicle.')
      } else {
        setButtonText(platform === 'ios' ? 'Download from App Store' : 'Download from Google Play')
        setStatusMessage('Drvn AI is not installed. Download the app to view shared vehicle details.')
      }
    } catch (error) {
      console.error('Error checking app installation:', error)
      setAppInstalled(false)
      setButtonText('Download App')
      setStatusMessage('Download Drvn AI to view shared vehicle details')
    } finally {
      setLoading(false)
    }
  }

  const handleButtonClick = async () => {
    if (loading) return
    
    setLoading(true)
    
    if (appInstalled === true && token) {
      // App is installed - try to open the specific share
      console.log('📱 Opening shared vehicle in app...')
      setButtonText('Opening app...')
      
      try {
        // Try to open the specific share link
        const shareLink = `${DEEP_LINKS.universal}share/${token}`
        console.log('🔗 Opening share link:', shareLink)
        
        window.location.href = shareLink
        
        // Fallback to custom scheme if universal link doesn't work
        setTimeout(() => {
          const customShareLink = `drvnai://share/${token}`
          console.log('🔗 Fallback to custom scheme:', customShareLink)
          window.location.href = customShareLink
        }, 1000)
        
      } catch (error) {
        console.error('Error opening share link:', error)
        // Fallback to app store
        window.open(APP_STORE_URLS[platform] || APP_STORE_URLS.ios, '_blank')
      }
    } else {
      // App is not installed - go to store
      console.log('📦 Redirecting to app store...')
      setButtonText('Opening store...')
      
      window.open(APP_STORE_URLS[platform] || APP_STORE_URLS.ios, '_blank')
    }
    
    // Reset loading state
    setTimeout(() => {
      setLoading(false)
      if (appInstalled === true) {
        setButtonText('Open Shared Vehicle')
      } else {
        setButtonText(platform === 'ios' ? 'Download from App Store' : 'Download from Google Play')
      }
    }, 2000)
  }

  const getButtonIcon = () => {
    if (appInstalled === true) {
      return <Car size={20} style={{ marginRight: '8px', display: 'inline' }} />
    } else {
      return <Download size={20} style={{ marginRight: '8px', display: 'inline' }} />
    }
  }

  const getButtonStyle = () => {
    if (appInstalled === true) {
      return {
        background: 'linear-gradient(135deg, #28a745, #20c997)',
        boxShadow: '0 4px 12px rgba(40, 167, 69, 0.3)'
      }
    }
    return {}
  }

  useEffect(() => {
    // Check for password reset link and redirect
    const hash = window.location.hash
    if (hash.includes('type=recovery') && hash.includes('access_token=')) {
      console.log('Password reset link detected, redirecting with fragments...')
      window.location.href = '/reset-password' + hash
      return
    }
  }, [])

  return (
    <div className="container">
      <div className="app-icon">
        <img src="/assets/app-icon.png" alt="Drvn AI" />
        {appInstalled === true && (
          <div style={{
            position: 'absolute',
            top: '-8px',
            right: '-8px',
            width: '32px',
            height: '32px',
            borderRadius: '16px',
            background: '#28a745',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '3px solid white',
            fontSize: '16px'
          }}>
            ✓
          </div>
        )}
      </div>
      
      <h1 className="title">Vehicle Shared on Drvn AI</h1>
      <p className="subtitle">
        {statusMessage}
      </p>
      
      <button 
        onClick={handleButtonClick} 
        className="primary-button"
        disabled={loading}
        style={getButtonStyle()}
      >
        {getButtonIcon()}
        {buttonText}
      </button>
      
      {appInstalled === true && (
        <div className="app-detected">
          <p style={{ 
            color: '#28a745', 
            fontSize: '14px', 
            marginTop: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '16px' }}>✅</span>
            App detected on your device
          </p>
        </div>
      )}
      
      {appInstalled === false && (
        <div className="download-info">
          <p style={{ 
            color: '#666', 
            fontSize: '14px', 
            marginTop: '16px',
            lineHeight: '1.5'
          }}>
            Download Drvn AI to view complete vehicle details including modifications, service history, and performance data.
          </p>
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