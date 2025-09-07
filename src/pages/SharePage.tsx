import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { Download, Car } from "lucide-react"

const APP_STORE_URLS = {
  ios: "https://apps.apple.com/in/app/drvnai/id6748619728",
  android: "https://play.google.com/store/apps/details?id=com.sgesdevllc.drvnai",
}

function detectPlatform(): "ios" | "android" | "web" {
  const userAgent = navigator.userAgent || (navigator as any).vendor || (window as any).opera

  if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
    return "ios"
  }
  if (/android/i.test(userAgent)) {
    return "android"
  }
  return "web"
}

export default function SharePage() {
  const { token } = useParams<{ token: string }>()
  const [platform, setPlatform] = useState<"ios" | "android" | "web">("web")
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState("")

  useEffect(() => {
    setPlatform(detectPlatform())
  }, [])

  const startCountdown = (storeUrl: string) => {
    let seconds = 3

    const updateCountdown = () => {
      if (seconds > 0) {
        setCountdown(`Redirecting in ${seconds} seconds...`)
        seconds--
        setTimeout(updateCountdown, 1000)
      } else {
        window.location.href = storeUrl
      }
    }

    updateCountdown()
  }

  const handleDownloadClick = () => {
    const universalLink = token
      ? `https://mobile.drvnai.app/share/${token}`
      : "https://mobile.drvnai.app"

    if (platform === "ios") {
      // On iOS Safari → let Universal Links handle it
      window.location.href = universalLink
      // If app not installed, this page (SharePage) will still be shown.
      return
    }

    if (platform === "android") {
      // On Android → try deep link, then fallback after timeout
      setLoading(true)
      window.location.href = universalLink
      setTimeout(() => {
        setLoading(false)
        const storeUrl = APP_STORE_URLS.android
        startCountdown(storeUrl)
      }, 2000)
      return
    }

    // On desktop → just show both store options
    setCountdown("Please choose your platform below to download the app.")
  }

  const getButtonText = () => {
    alert()
    if (loading) return "Opening app..."
    switch (platform) {
      case "ios":
            alert('ios')
        return "Open in Drvn AI App"
      case "android":
        return "Open in Drvn AI App"
      default:
        return "Download Drvn AI"
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
        <Download size={20} style={{ marginRight: "8px", display: "inline" }} />
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

      {/* Desktop fallback UI */}
      {platform === "web" && (
        <div className="store-links">
          <a
            className="store-button"
            href={APP_STORE_URLS.ios}
            target="_blank"
            rel="noopener noreferrer"
          >
            Download on App Store
          </a>
          <a
            className="store-button"
            href={APP_STORE_URLS.android}
            target="_blank"
            rel="noopener noreferrer"
          >
            Get it on Google Play
          </a>
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
