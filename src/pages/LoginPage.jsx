import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import LoadingState from '../components/LoadingState'
import Logo from '../components/Logo'
import { useAuth } from '../context/AuthContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

const initialForm = {
  email: '',
  password: '',
}

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.toLowerCase().endsWith('.com')
}

export default function LoginPage() {
  useDocumentTitle('Login')
  const { login, isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [showPassword, setShowPassword] = useState(false)

  const from = location.state?.from?.pathname ?? '/dashboard'

  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate(from === '/' ? '/dashboard' : from, { replace: true })
    }
  }, [from, isAuthenticated, loading, navigate])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    if (!validateEmail(form.email)) {
      setError('invalid email')
      setSubmitting(false)
      return
    }

    try {
      await login(form)
      navigate(from === '/' ? '/dashboard' : from, { replace: true })
    } catch (loginError) {
      setError(loginError.response?.data?.message ?? 'Unable to sign in right now.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  if (loading) {
    return <LoadingState label="Preparing sign in" />
  }

  return (
    <section className="auth-screen">
      <div className="auth-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '24px' }}>
          <Logo size={24} />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem', color: 'var(--text)', letterSpacing: '-0.02em' }}>NetPulse NOC</span>
        </div>
        <div className="auth-eyebrow">Secure Access</div>
        <h1>Sign in to Dashboard</h1>
        <p className="auth-subtitle">Manage switches, charts, and alerts from a single operational console.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" name="email" value={form.email} onChange={handleChange} placeholder="operator@netpulse.local" required />
          </div>
          <div className="form-field">
            <label className="form-label">Password</label>
            <div className="password-field">
              <input className="form-input" type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} placeholder="Enter your password" required />
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

          {error ? <div className="form-alert form-alert--error">{error}</div> : null}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 4 }} disabled={submitting}>
            {submitting ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <div className="auth-links">
          <Link to="/forgot-password">Forgot password?</Link>
          <Link to="/register">Create an account</Link>
        </div>
      </div>
    </section>
  )
}
