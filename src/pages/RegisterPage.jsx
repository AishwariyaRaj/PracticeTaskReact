import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import LoadingState from '../components/LoadingState'
import Logo from '../components/Logo'
import { useAuth } from '../context/AuthContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

const initialForm = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
}

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.toLowerCase().endsWith('.com')
}

export default function RegisterPage() {
  useDocumentTitle('Register')
  const { register, isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, loading, navigate])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    setSuccess(null)

    if (!validateEmail(form.email)) {
      setError('invalid email')
      setSubmitting(false)
      return
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      setSubmitting(false)
      return
    }

    try {
      const { confirmPassword, ...payload } = form
      await register(payload)
      setSuccess('Account created. You are now signed in.')
      navigate('/dashboard', { replace: true })
    } catch (registerError) {
      const serverMessage = registerError?.response?.data?.message
      const networkMessage = registerError?.message
      setError(serverMessage ?? networkMessage ?? 'Unable to create the account right now.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <LoadingState label="Preparing registration" />
  }

  return (
    <section className="auth-screen auth-screen--register">
      <div className="auth-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '24px' }}>
          <Logo size={24} />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem', color: 'var(--text)', letterSpacing: '-0.02em' }}>NetPulse NOC</span>
        </div>
        <div className="auth-eyebrow">New Operator</div>
        <h1>Create your account</h1>
        <p className="auth-subtitle">Register to access the authenticated dashboard</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label className="form-label">Name</label>
            <input className="form-input" type="text" name="name" value={form.name} onChange={handleChange} placeholder="Alex Morgan" required />
          </div>
          <div className="form-field">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" name="email" value={form.email} onChange={handleChange} placeholder="alex@netpulse.local" required />
          </div>
          <div className="form-field">
            <label className="form-label">Password</label>
            <div className="password-field">
              <input className="form-input" type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} placeholder="Create a strong password" required />
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
              <input className="form-input" type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Confirm your password" required />
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
          {success ? <div className="form-alert form-alert--success">{success}</div> : null}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 4 }} disabled={submitting}>
            {submitting ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <div className="auth-links">
          <Link to="/login">Back to login</Link>
        </div>
      </div>
    </section>
  )
}
