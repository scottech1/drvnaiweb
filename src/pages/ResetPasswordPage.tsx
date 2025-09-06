import React, { useState, useEffect } from 'react'
import { Lock, Eye, EyeOff, CheckCircle, AlertTriangle, ArrowLeft } from 'lucide-react'

const SUPABASE_URL = 'https://itcneajyfqnfrujzqccu.supabase.co'

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [initializing, setInitializing] = useState(true)
  const [resetToken, setResetToken] = useState<string | null>(null)

  useEffect(() => {
    console.log('ResetPasswordPage mounted')
    console.log('Current URL:', window.location.href)
    console.log('Search params:', window.location.search)
    console.log('Hash:', window.location.hash)
    
    // Check for token in URL parameters (custom system)
    const urlParams = new URLSearchParams(window.location.search)
    const tokenFromParams = urlParams.get('token')
    
    // Check for token in hash fragments (Supabase system)
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const tokenFromHash = hashParams.get('access_token')
    const typeFromHash = hashParams.get('type')
    
    console.log('Token from params:', tokenFromParams ? tokenFromParams.substring(0, 8) + '...' : 'none')
    console.log('Token from hash:', tokenFromHash ? tokenFromHash.substring(0, 8) + '...' : 'none')
    console.log('Type from hash:', typeFromHash)
    
    if (tokenFromParams) {
      // Custom token system
      setResetToken(tokenFromParams)
      setInitializing(false)
      console.log('Using custom token system')
    } else if (tokenFromHash && typeFromHash === 'recovery') {
      // Supabase token system
      setResetToken(tokenFromHash)
      setInitializing(false)
      console.log('Using Supabase token system')
    } else {
      // No valid token found
      setError('Invalid or missing reset token. Please request a new password reset.')
      setInitializing(false)
      console.log('No valid token found')
    }
  }, [])

  const validatePassword = (password: string) => {
    return {
      length: password.length >= 6,
      match: password === confirmPassword && password.length > 0
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!resetToken) {
      setError('No reset token available')
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
      console.log('Attempting password reset with token:', resetToken.substring(0, 8) + '...')
      
      // Try custom token system first
      let response = await fetch(`${SUPABASE_URL}/functions/v1/reset-password-with-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: resetToken,
          newPassword: newPassword
        }),
      })

      let result = await response.json()
      
      if (!response.ok && response.status === 404) {
        // Custom system not available, try Supabase auth system
        console.log('Custom system not available, trying Supabase auth...')
        
        // Import Supabase client dynamically
        const { createClient } = await import('https://cdn.skypack.dev/@supabase/supabase-js@2')
        const supabase = createClient(SUPABASE_URL, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0Y25lYWp5ZnFuZnJ1anpxY2N1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTU0MzE4NzQsImV4cCI6MjAzMTAwNzg3NH0.YQJWg8rJocJpUJhd7QGLbLQBOqtJGhZJhxJVhJhJVhJ')
        
        // Set session with the token
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: resetToken,
          refresh_token: resetToken // Use same token as fallback
        })
        
        if (sessionError) throw sessionError
        
        // Update password
        const { error: updateError } = await supabase.auth.updateUser({
          password: newPassword
        })
        
        if (updateError) throw updateError
        
        result = { success: true }
      } else if (!response.ok) {
        throw new Error(result.error || 'Failed to reset password')
      }
      
      if (result.success) {
        setSuccess(true)
        
        // Redirect after 3 seconds
        setTimeout(() => {
          window.location.href = '/'
        }, 3000)
      } else {
        throw new Error(result.error || 'Failed to reset password')
      }
      
    } catch (err: any) {
      console.error('Password reset error:', err)
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
      </div>
    )
  }

  if (error && !resetToken) {
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
      <a href="/" className="back-link-top">
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
          <label className="form-label" htmlFor="newPassword">
            <Lock size={16} style={{ marginRight: '8px', display: 'inline' }} />
            New Password
          </label>
          <div className="input-container">
            <input
              type={showPassword ? 'text' : 'password'}
              id="newPassword"
              className="form-input"
              placeholder="Enter your new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="password-toggle"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="confirmPassword">
            <Lock size={16} style={{ marginRight: '8px', display: 'inline' }} />
            Confirm Password
          </label>
          <div className="input-container">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              className="form-input"
              placeholder="Confirm your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="password-toggle"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <button 
          type="submit" 
          className="primary-button"
          disabled={loading || !requirements.length || !requirements.match}
        >
          {loading ? (
            <>
              <div className="loading-spinner"></div>
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
    </div>
  )
}