import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export default function ResetPasswordPage() {
  useDocumentTitle('Reset Password')
  const { resetPassword } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const email = searchParams.get('email') ?? ''
  const token = searchParams.get('token') ?? ''

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      setLoading(false)
      return
    }

    try {
      const response = await resetPassword({ email, token, password })
      setMessage(response.message)
      setTimeout(() => navigate('/login', { replace: true }), 1200)
    } catch (resetError) {
      setError(resetError.response?.data?.message ?? 'Unable to reset the password right now.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="auth-screen">
      <div className="auth-card">
        <div className="auth-eyebrow">Set New Credentials</div>
        <h1>Choose a new password</h1>
        <p className="auth-subtitle">Use the email link from the reset request to complete the password change.</p>

        {email && token ? null : <div className="form-alert form-alert--error">The reset link is incomplete. Request a new one from the login screen.</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" value={email} readOnly />
          </div>
          <div className="form-field">
            <label className="form-label">New password</label>
            <div className="password-field">
              <input className="form-input" type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter a new password" required />
              <button
                type="button"
                className="password-eye-button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div className="form-field">
            <label className="form-label">Confirm password</label>
            <div className="password-field">
              <input className="form-input" type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Confirm the new password" required />
              <button
                type="button"
                className="password-eye-button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error ? <div className="form-alert form-alert--error">{error}</div> : null}
          {message ? <div className="form-alert form-alert--success">{message}</div> : null}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 4 }} disabled={loading || !email || !token}>
            {loading ? 'Saving password...' : 'Reset password'}
          </button>
        </form>

        <div className="auth-links">
          <Link to="/login">Back to login</Link>
        </div>
      </div>
    </section>
  )
}
