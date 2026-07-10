import { useState } from 'react'
import { Link } from 'react-router-dom'
import Logo from '../components/Logo'
import { useAuth } from '../context/AuthContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.toLowerCase().endsWith('.com')
}

export default function ForgotPasswordPage() {
  useDocumentTitle('Forgot Password')
  const { forgotPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setMessage(null)
    setError(null)

    if (!validateEmail(email)) {
      setError('invalid email')
      setLoading(false)
      return
    }

    try {
      const response = await forgotPassword({ email })
      setMessage(response.message)
    } catch (requestError) {
      setError(requestError.response?.data?.message ?? 'Unable to send the reset email right now.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="auth-screen">
      <div className="auth-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '24px' }}>
          <Logo size={24} />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem', color: 'var(--text)', letterSpacing: '-0.02em' }}>NetPulse NOC</span>
        </div>
        <div className="auth-eyebrow">Account Recovery</div>
        <h1>Reset your password</h1>
        <p className="auth-subtitle">We will send a password reset email with a secure link if the account exists.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="operator@netpulse.local" required />
          </div>

          {error ? <div className="form-alert form-alert--error">{error}</div> : null}
          {message ? <div className="form-alert form-alert--success">{message}</div> : null}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 4 }} disabled={loading}>
            {loading ? 'Sending link...' : 'Send reset email'}
          </button>
        </form>

        <div className="auth-links">
          <Link to="/login">Back to login</Link>
          <Link to="/register">Create an account</Link>
        </div>
      </div>
    </section>
  )
}
