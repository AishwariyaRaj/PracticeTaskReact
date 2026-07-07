import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { Eye, EyeOff, User, Lock, Settings, Key, Copy, Check } from 'lucide-react'
import api from '../services/api'

export default function ProfilePage() {
  useDocumentTitle('Operator Profile')
  const { user, updateProfile } = useAuth()
  const { theme, toggleTheme } = useTheme()

  // Profile fields state
  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [profileMessage, setProfileMessage] = useState(null)
  const [profileError, setProfileError] = useState(null)
  const [profileSubmitting, setProfileSubmitting] = useState(false)

  // Password fields state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordMessage, setPasswordMessage] = useState(null)
  const [passwordError, setPasswordError] = useState(null)
  const [passwordSubmitting, setPasswordSubmitting] = useState(false)

  // Password toggles
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Preference fields state
  const [refreshInterval, setRefreshInterval] = useState('30')
  const [enableAlerts, setEnableAlerts] = useState(true)
  const [prefMessage, setPrefMessage] = useState(null)

  // Copy API key state
  const [copied, setCopied] = useState(false)
  const mockApiKey = 'np_live_4a8d9b23f8c0e1d2c3b4a5f6e7d8c9b0'

  useEffect(() => {
    if (user) {
      setName(user.name)
      setEmail(user.email)
    }
  }, [user])

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setProfileMessage(null)
    setProfileError(null)
    setProfileSubmitting(true)

    if (!name.trim() || !email.trim()) {
      setProfileError('Name and email are required.')
      setProfileSubmitting(false)
      return
    }

    if (!email.toLowerCase().endsWith('.com') || !email.includes('@')) {
      setProfileError('invalid email')
      setProfileSubmitting(false)
      return
    }

    try {
      const res = await api.put('/update-profile', { name, email })
      updateProfile({ user: res.data.user, token: res.data.token })
      setProfileMessage('Profile details updated successfully.')
    } catch (err) {
      setProfileError(err.response?.data?.message ?? 'Could not update profile information.')
    } finally {
      setProfileSubmitting(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPasswordMessage(null)
    setPasswordError(null)
    setPasswordSubmitting(true)

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All password fields are required.')
      setPasswordSubmitting(false)
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.')
      setPasswordSubmitting(false)
      return
    }

    try {
      const res = await api.put('/change-password', { currentPassword, newPassword })
      setPasswordMessage(res.data.message ?? 'Password changed successfully.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setPasswordError(err.response?.data?.message ?? 'Could not update password.')
    } finally {
      setPasswordSubmitting(false)
    }
  }

  const handleSavePreferences = (e) => {
    e.preventDefault()
    setPrefMessage('Preferences saved successfully.')
    setTimeout(() => setPrefMessage(null), 3000)
  }

  const handleCopyKey = () => {
    navigator.clipboard.writeText(mockApiKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const initials = user?.name?.charAt(0)?.toUpperCase() ?? 'U'

  return (
    <div className="page-stack">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-eyebrow">User Settings</div>
          <h2>Operator Profile</h2>
          <p>Configure account credentials, dashboard settings, and API authentication.</p>
        </div>
      </div>

      <div className="chart-grid">
        {/* Left Column: Profile Info & Preferences */}
        <div className="page-stack">
          {/* Profile Info */}
          <div className="noc-card">
            <div className="noc-card__header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <User size={18} style={{ color: 'var(--primary)' }} />
                <div>
                  <div className="noc-card__title">Profile Information</div>
                  <div className="noc-card__sub">Update your account details and contact email</div>
                </div>
              </div>
            </div>
            <div className="noc-card__body">
              <form onSubmit={handleUpdateProfile} className="page-stack">
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                  <div className="profile-avatar-large" style={{ width: '60px', height: '60px', fontSize: '1.5rem' }}>{initials}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '1.05rem', color: 'var(--text)' }}>{user?.name}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Role: NOC Administrator</div>
                  </div>
                </div>

                {profileError && <div className="form-alert form-alert--error">{profileError}</div>}
                {profileMessage && <div className="form-alert form-alert--success">{profileMessage}</div>}

                <div className="form-group">
                  <label htmlFor="prof-name">Full Name</label>
                  <input
                    id="prof-name"
                    type="text"
                    className="form-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={profileSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="prof-email">Email Address</label>
                  <input
                    id="prof-email"
                    type="text"
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={profileSubmitting}
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }} disabled={profileSubmitting}>
                  Save Changes
                </button>
              </form>
            </div>
          </div>

          {/* Preferences */}
          <div className="noc-card">
            <div className="noc-card__header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Settings size={18} style={{ color: 'var(--primary)' }} />
                <div>
                  <div className="noc-card__title">Dashboard Preferences</div>
                  <div className="noc-card__sub">Configure visual behavior and telemetry intervals</div>
                </div>
              </div>
            </div>
            <div className="noc-card__body">
              <form onSubmit={handleSavePreferences} className="page-stack">
                {prefMessage && <div className="form-alert form-alert--success">{prefMessage}</div>}

                <div className="form-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <label style={{ margin: 0 }}>Console Theme</label>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Toggle light or dark theme mode</span>
                  </div>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={toggleTheme}>
                    Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
                  </button>
                </div>

                <div className="form-group">
                  <label htmlFor="pref-refresh">Auto-Refresh Interval</label>
                  <select
                    id="pref-refresh"
                    className="form-select"
                    value={refreshInterval}
                    onChange={(e) => setRefreshInterval(e.target.value)}
                  >
                    <option value="10">10 Seconds (Fast)</option>
                    <option value="30">30 Seconds (Default)</option>
                    <option value="60">60 Seconds</option>
                    <option value="0">Manual Refresh Only</option>
                  </select>
                </div>

                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    id="pref-alerts"
                    type="checkbox"
                    checked={enableAlerts}
                    onChange={(e) => setEnableAlerts(e.target.checked)}
                    style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                  />
                  <label htmlFor="pref-alerts" style={{ margin: 0, cursor: 'pointer' }}>Enable System Push Notifications</label>
                </div>

                <button type="submit" className="btn btn-ghost" style={{ alignSelf: 'flex-start' }}>
                  Save Preferences
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Right Column: Password Change & API keys */}
        <div className="page-stack">
          {/* Change Password */}
          <div className="noc-card">
            <div className="noc-card__header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Lock size={18} style={{ color: 'var(--primary)' }} />
                <div>
                  <div className="noc-card__title">Security Settings</div>
                  <div className="noc-card__sub">Update your account authentication password</div>
                </div>
              </div>
            </div>
            <div className="noc-card__body">
              <form onSubmit={handleChangePassword} className="page-stack">
                {passwordError && <div className="form-alert form-alert--error">{passwordError}</div>}
                {passwordMessage && <div className="form-alert form-alert--success">{passwordMessage}</div>}

                <div className="form-group">
                  <label htmlFor="pass-curr">Current Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="pass-curr"
                      type={showCurrentPassword ? 'text' : 'password'}
                      className="form-input"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      disabled={passwordSubmitting}
                      style={{ paddingRight: '40px' }}
                    />
                    <button
                      type="button"
                      className="password-eye-button"
                      onClick={() => setShowCurrentPassword(p => !p)}
                      tabIndex="-1"
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="pass-new">New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="pass-new"
                      type={showNewPassword ? 'text' : 'password'}
                      className="form-input"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={passwordSubmitting}
                      style={{ paddingRight: '40px' }}
                    />
                    <button
                      type="button"
                      className="password-eye-button"
                      onClick={() => setShowNewPassword(p => !p)}
                      tabIndex="-1"
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="pass-confirm">Confirm New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="pass-confirm"
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="form-input"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={passwordSubmitting}
                      style={{ paddingRight: '40px' }}
                    />
                    <button
                      type="button"
                      className="password-eye-button"
                      onClick={() => setShowConfirmPassword(p => !p)}
                      tabIndex="-1"
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }} disabled={passwordSubmitting}>
                  Update Password
                </button>
              </form>
            </div>
          </div>

          {/* API Access */}
          <div className="noc-card">
            <div className="noc-card__header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Key size={18} style={{ color: 'var(--primary)' }} />
                <div>
                  <div className="noc-card__title">CLI & API Integration</div>
                  <div className="noc-card__sub">Authenticate external monitoring agents</div>
                </div>
              </div>
            </div>
            <div className="noc-card__body">
              <div className="page-stack">
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Use this token to query switches or post alert telemetry logs into NetPulse via API:
                </div>

                <div 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    background: 'var(--bg-soft)',
                    border: '1px solid var(--border)',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    fontSize: '0.85rem'
                  }}
                >
                  <span style={{ wordBreak: 'break-all', color: 'var(--text)' }}>{mockApiKey}</span>
                  <button 
                    type="button" 
                    className="btn btn-icon btn-ghost" 
                    style={{ padding: '6px', marginLeft: '8px' }}
                    onClick={handleCopyKey}
                    title="Copy API key"
                  >
                    {copied ? <Check size={14} style={{ color: 'var(--success)' }} /> : <Copy size={14} />}
                  </button>
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Do not share this key. If compromised, contact the system administrator to regenerate.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
