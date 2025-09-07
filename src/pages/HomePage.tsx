import React, { useEffect, useState } from 'react'
import { Download, Car, Wrench, Zap, MessageCircle } from 'lucide-react'

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

/**
 * Detect if app is installed
 * Uses hidden iframe with custom scheme
 * Resolves true if the app takes focus, false otherwise
 */
function detectAppInstallation(): Promise<{ isInstalled: boolean }> {
  return new Promise((resolve) => {
    let appOpened = false

    const handleVisibilityChange = () => {
      if (document.hidden) {
        appOpened = true
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    const iframe = document.createElement('iframe')
    iframe.style.display = 'none'
    iframe.src = DEEP_LINKS.custom
    document.body.appendChild(iframe)

    setTimeout(() => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe)

      if (appOpened) {
        resolve({ isInstalled: true })
      } else {
        resolve({ isInstalled: false })
      }
    }, 1500)
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

  const handleButtonClick = () => {
    if (loading) return

    if (appInstalled === true) {
      // App installed → open via universal link
      setButtonText('Opening app...')
      window.location.href = DEEP_LINKS.universal
    } else {
      // Not installed → redirect to store
      setButtonText('Opening store...')
      window.open(getAppStoreUrl(), '_blank')
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
