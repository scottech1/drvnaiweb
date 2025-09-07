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
  if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) return 'ios'
  if (/android/i.test(userAgent)) return 'android'
  return 'web'
}

export default function HomePage() {
  const [platform, setPlatform] = useState<'ios' | 'android' | 'web'>('web')
  const [buttonText, setButtonText] = useState('Download App')

  useEffect(() => {
    const detectedPlatform = detectPlatform()
    setPlatform(detectedPlatform)
    setButtonText(detectedPlatform === 'ios' ? 'Open in App / App Store' 
      : detectedPlatform === 'android' ? 'Open in App / Play Store' 
      : 'Download App')
  }, [])

  const getAppStoreUrl = () => {
    return APP_STORE_URLS[platform] || APP_STORE_URLS.ios
  }

  const handleButtonClick = () => {
    if (platform === 'ios' || platform === 'android') {
      // Try opening universal link (if app installed → app opens, if not → store)
      window.location.href = DEEP_LINKS.universal
    } else {
      // Web → just open store link
      window.open(getAppStoreUrl(), '_blank')
    }
  }

  const getButtonIcon = () => {
    return <Download size={20} style={{ marginRight: '8px', display: 'inline' }} />
  }

  return (
    <div className="container">
      <div className="app-icon">
        <img src="/assets/app-icon.png" alt="Drvn AI" />
      </div>
      
      <h1 className="title">Drvn AI</h1>
      <p className="subtitle">Track your vehicles, maintenance, and modifications with AI-powered insights.</p>
      
      <button 
        onClick={handleButtonClick} 
        className="primary-button"
      >
        {getButtonIcon()}
        {buttonText}
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
