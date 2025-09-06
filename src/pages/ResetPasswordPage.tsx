import React, { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Lock, Eye, EyeOff, CheckCircle, AlertTriangle, ArrowLeft } from 'lucide-react'

const SUPABASE_URL = 'https://itcneajyfqnfrujzqccu.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0Y25lYWp5ZnFuZnJ1anpxY2N1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTU0MzE4NzQsImV4cCI6MjAzMTAwNzg3NH0.YQJWg8rJocJpUJhd7QGLbLQBOqtJGhZJhxJVhJhJVhJ'

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [initializing, setInitializing] = useState(true)
  const [supabase, setSupabase] = useState<any>(null)

  useEffect(() => {
    console.log('ResetPasswordPage mounted')
    console.log('Current URL:', window.location.href)
    console.log('Hash:', window.location.hash)
    
    // Small delay to ensure hash is available
    setTimeout(() => {
      initializeSupabase()
    }, 100)
  }, [])

  const parseUrlFragments = () => {
    const hash = window.location.hash.substring(1)
    const params = new URLSearchParams(hash)
    
    return {
      accessToken: params.get('access_token'),
      refreshToken: params.get('refresh_token'),
      expiresAt: params.get('expires_at'),
      type: params.get('type')
    }
  }

  const initializeSupabase = async () => {
    try {
      console.log('Initializing Supabase...')
      const fragments = parseUrlFragments()
      console.log('Parsed fragments:', fragments)
      
      if (!fragments.accessToken || fragments.type !== 'recovery') {
        console.error('Invalid fragments:', { 
          hasAccessToken: !!fragments.accessToken, 
          type: fragments.type 
        })
        throw new Error('Invalid or missing reset token')
      }

      const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
      
      // Set the session with the tokens from URL
      const { data, error } = await client.auth.setSession({
        access_token: fragments.accessToken,
        refresh_token: fragments.refreshToken || ''
      })
      
      if (error) {
        console.error('Session error:', error)
        throw error
      }
      
      console.log('Session set successfully')
      
      setSupabase(client)
      setInitializing(false)
    } catch (err: any) {
      console.error('Error initializing:', err)
      setError(err.message || 'Invalid or expired reset link')
      setInitializing(false)
    }
  }

  const validatePassword = (password: string) => {
    return {
      length: password.length >= 6,
      match: password === confirmPassword && password.length > 0
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!supabase) {
      setError('Session not initialized')
      return
    }

    const validation = validatePassword(newPassword)
    
    if (!validation.length) {
      setError('Password must be at least 6 characters long')
      return
    }
    
    if (!validation.match) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })
      
      if (error) throw error
      
      setSuccess(true)
      
      // Redirect after 3 seconds
      setTimeout(() => {
        window.location.href = '/'
      }, 3000)
      
    } catch (err: any) {
      setError(err.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  const requirements = validatePassword(newPassword)

  if (initializing) {
    return (
      <div className="container">
        <div className="app-icon">
          <img src="/assets/app-icon.png" alt="Drvn AI" />
        </div>
        <div className="app-icon">
          <img src="/assets/app-icon.png" alt="Drvn AI" />
        </div>
        <h1 className="title">Verifying Reset Link</h1>
        <p className="subtitle">Please wait while we verify your reset link...</p>
        <div className="loading show">
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #f3f3f3', 
            borderTop: '4px solid #235DCF', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (error && !supabase) {
    return (
      <div className="container">
        <div className="app-icon">
          <img src="/assets/app-icon.png" alt="Drvn AI" />
          <div style={{
            position: 'absolute',
            bottom: '-4px',
            right: '-4px',
            width: '32px',
            height: '32px',
            borderRadius: '16px',
            backgroundColor: '#dc3545',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '3px solid white'
          }}>
            <AlertTriangle size={16} color="white" />
          </div>
        </div>
        <h1 className="title">Reset Link Invalid</h1>
        <p className="subtitle">
          This reset link is invalid or has expired. Please request a new password reset from the app.
        </p>
        <div className="error show">
          <AlertTriangle size={20} style={{ marginRight: '8px', display: 'inline' }} />
          {error}
        </div>
        <a href="/" className="back-link">
          <ArrowLeft size={16} style={{ marginRight: '8px', display: 'inline' }} />
          Back to Home
        </a>
      </div>
    )
  }

  if (success) {
    return (
      <div className="container">
        <div className="app-icon">
          <img src="/assets/app-icon.png" alt="Drvn AI" />
          <div style={{
            position: 'absolute',
            bottom: '-4px',
            right: '-4px',
            width: '32px',
            height: '32px',
            borderRadius: '16px',
            backgroundColor: '#28a745',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '3px solid white'
          }}>
            <CheckCircle size={16} color="white" />
          </div>
        </div>
        <h1 className="title">Password Reset Successful!</h1>
        <p className="subtitle">
          Your password has been updated. You can now sign in with your new password.
        </p>
        <div className="success-message show">
          <CheckCircle size={20} style={{ marginRight: '8px', display: 'inline' }} />
          Success! Redirecting to home page in 3 seconds...
        </div>
        <a href="/" className="back-link">
          <ArrowLeft size={16} style={{ marginRight: '8px', display: 'inline' }} />
          Go to Home Now
        </a>
      </div>
    )
  }

  return (
    <div className="container">
      <a href="/" className="back-link" style={{ 
        position: 'absolute', 
        top: '20px', 
        left: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: '12px',
        textDecoration: 'none',
        color: '#235DCF',
        fontWeight: '500',
        fontSize: '14px'
      }}>
        <ArrowLeft size={16} />
        Back to Home
      </a>
      
      <div className="app-icon">
        <img src="/assets/app-icon.png" alt="Drvn AI" />
        <div style={{
          position: 'absolute',
          bottom: '-4px',
          right: '-4px',
          width: '32px',
          height: '32px',
          borderRadius: '16px',
          backgroundColor: '#235DCF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '3px solid white'
        }}>
          <Lock size={16} color="white" />
        </div>
      </div>
      
      <h1 className="title">Reset Your Password</h1>
      <p className="subtitle">
        Enter your new password below to complete the reset process.
      </p>

      {error && (
        <div className="error show">
          <AlertTriangle size={20} style={{ marginRight: '8px', display: 'inline' }} />
          {error}
        </div>
      )}

      <div className="password-requirements">
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: '12px',
          color: '#235DCF',
          fontWeight: '600'
        }}>
          <Lock size={16} style={{ marginRight: '8px' }} />
          Password Requirements
        </div>
        <div className={`requirement ${requirements.length ? 'valid' : ''}`}>
          <span className="requirement-icon">
            {requirements.length ? '✓' : '•'}
          </span>
          At least 6 characters long
        </div>
        <div className={`requirement ${requirements.match ? 'valid' : ''}`}>
          <span className="requirement-icon">
            {requirements.match ? '✓' : '•'}
          </span>
          Passwords match
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="newPassword">New Password</label>
            <Lock size={16} style={{ marginRight: '8px', display: 'inline' }} />
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              id="newPassword"
              className="form-input"
              placeholder="Enter your new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              style={{
                paddingRight: '50px'
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#969696',
                padding: '8px',
                borderRadius: '4px',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
            <Lock size={16} style={{ marginRight: '8px', display: 'inline' }} />
          <div style={{ position: 'relative' }}>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              className="form-input"
              placeholder="Confirm your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={{
                paddingRight: '50px'
              }}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#969696',
                padding: '8px',
                borderRadius: '4px',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <button 
          type="submit" 
          className="primary-button"
          disabled={loading || !requirements.length || !requirements.match}
          style={{
            opacity: (loading || !requirements.length || !requirements.match) ? 0.6 : 1,
            cursor: (loading || !requirements.length || !requirements.match) ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? (
            <>
              <div style={{ 
                width: '16px', 
                height: '16px', 
                border: '2px solid rgba(255,255,255,0.3)', 
                borderTop: '2px solid white', 
                borderRadius: '50%', 
                animation: 'spin 1s linear infinite',
                marginRight: '8px',
                display: 'inline-block'
              }}></div>
              Resetting Password...
            </>
          ) : (
            <>
              <Lock size={20} style={{ marginRight: '8px', display: 'inline' }} />
              Reset Password
            </>
          )}
        </button>
      </form>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}