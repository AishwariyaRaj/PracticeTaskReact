import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import LoadingState from '../components/LoadingState'
import { useAuth } from '../context/AuthContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

const initialForm = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
}

export default function RegisterPage() {
  useDocumentTitle('Register')
  const { register, isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [showPasswords, setShowPasswords] = useState(false)

  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate('/', { replace: true })
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

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      setSubmitting(false)
      return
    }

    try {
      const { confirmPassword, ...payload } = form
      await register(payload)
      setSuccess('Account created. You are now signed in.')
      navigate('/', { replace: true })
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
        <div className="auth-eyebrow">New Operator</div>
        <h1>Create your account</h1>
        <p className="auth-subtitle">Register to access the authenticated dashboard and Redis-backed management tools.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label className="form-label">Name</label>
            <input className="form-input" type="text" name="name" value={form.name} onChange={handleChange} placeholder="Alex Morgan" required />
          </div>
          <div className="form-field">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" name="email" value={form.email} onChange={handleChange} placeholder="alex@highre.local" required />
          </div>
          <div className="form-field">
            <label className="form-label">Password</label>
            <div className="password-field">
              <input className="form-input" type={showPasswords ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} placeholder="Create a strong password" required />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPasswords((current) => !current)}
                aria-label={showPasswords ? 'Hide password' : 'Show password'}
              >
                {showPasswords ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          <div className="form-field">
            <label className="form-label">Confirm password</label>
            <div className="password-field">
              <input className="form-input" type={showPasswords ? 'text' : 'password'} name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Confirm your password" required />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPasswords((current) => !current)}
                aria-label={showPasswords ? 'Hide password' : 'Show password'}
              >
                {showPasswords ? 'Hide' : 'Show'}
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
