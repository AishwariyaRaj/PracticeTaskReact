import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import LoadingState from '../components/LoadingState'
import { useAuth } from '../context/AuthContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

const initialForm = {
  email: '',
  password: '',
}

export default function LoginPage() {
  useDocumentTitle('Login')
  const { login, isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

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
            <input className="form-input" type="password" name="password" value={form.password} onChange={handleChange} placeholder="Enter your password" required />
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
