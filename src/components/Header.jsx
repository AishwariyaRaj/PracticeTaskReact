import { useState, useEffect, useRef } from 'react'
import { Search, Bell, Menu, Sun, Moon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Link } from 'react-router-dom'
import { getNotifications, markAllAsRead, clearNotifications } from '../utils/notifications'

function formatTime(isoString) {
  try {
    const date = new Date(isoString)
    const secs = Math.floor((Date.now() - date.getTime()) / 1000)
    if (secs < 60) return 'Just now'
    const mins = Math.floor(secs / 60)
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    return date.toLocaleDateString()
  } catch (e) {
    return ''
  }
}

export default function Header({ breadcrumbs = [], onHamburger }) {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  const bellRef = useRef(null)
  const profileRef = useRef(null)

  const initials = user?.name?.charAt(0)?.toUpperCase() ?? 'U'

  const loadNotifications = () => {
    getNotifications().then((items) => {
      setNotifications(items || [])
    }).catch(() => {})
  }

  useEffect(() => {
    loadNotifications()
    
    // Poll the backend for live notifications every 5 seconds
    const pollInterval = setInterval(loadNotifications, 5000)

    const handleNewNotification = () => {
      loadNotifications()
    }
    window.addEventListener('netpulse-new-notification', handleNewNotification)
    
    return () => {
      clearInterval(pollInterval)
      window.removeEventListener('netpulse-new-notification', handleNewNotification)
    }
  }, [])

  useEffect(() => {
    function handleClickOutside(event) {
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  const handleClear = (e) => {
    e.stopPropagation()
    clearNotifications()
  }

  const toggleNotifications = () => {
    setShowNotifications(prev => !prev)
    if (!showNotifications) {
      // Mark read after opening
      setTimeout(markAllAsRead, 500)
    }
  }

  return (
    <header className="noc-topbar">
      <button className="topbar-hamburger" onClick={onHamburger} aria-label="Open menu">
        <Menu size={18} />
      </button>

      {/* Breadcrumb */}
      <nav className="topbar-breadcrumb">
        <Link to="/dashboard">Home</Link>
        {breadcrumbs.map((b, i) => (
          <span key={i}>
            <span style={{ margin: '0 4px', opacity: 0.4 }}>/</span>
            <span>{b}</span>
          </span>
        ))}
      </nav>

      {/* Search */}
      <div className="topbar-search">
        <span className="topbar-search__icon"><Search size={15} /></span>
        <input type="search" placeholder="Search..." aria-label="Global search" />
      </div>

      {/* Actions */}
      <div className="topbar-actions">
        {/* Theme Toggle */}
        <button
          className="topbar-theme-toggle"
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Notifications */}
        <div className="topbar-bell-wrapper" ref={bellRef}>
          <button className="topbar-bell" onClick={toggleNotifications} aria-label="Notifications">

            <Bell size={17} />
            {unreadCount > 0 && <span className="topbar-bell__badge" />}
          </button>

          {showNotifications && (
            <div className="dropdown-menu">
              <div className="dropdown-header">
                <span className="dropdown-header__title">Notifications ({unreadCount} new)</span>
                {notifications.length > 0 && (
                  <button className="dropdown-header__clear" onClick={handleClear}>Clear all</button>
                )}
              </div>
              <div className="dropdown-list">
                {notifications.length > 0 ? (
                  notifications.map(item => (
                    <div key={item.id} className={`dropdown-item ${!item.read ? 'unread' : ''}`}>
                      <span className="dropdown-item__title">{item.title}</span>
                      <span className="dropdown-item__message">{item.message}</span>
                      <span className="dropdown-item__time">{formatTime(item.time)}</span>
                    </div>
                  ))
                ) : (
                  <div className="dropdown-empty">No new alerts or messages.</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="topbar-user-wrapper" ref={profileRef}>
          <div className="topbar-user" onClick={() => setShowProfile(prev => !prev)}>
            <div className="topbar-avatar">{initials}</div>
            <span className="topbar-username">{user?.name ?? 'Operator'}</span>
          </div>

          {showProfile && (
            <div className="dropdown-menu dropdown-menu--profile">
              <div className="profile-card">
                <div className="profile-avatar-large">{initials}</div>
                <div className="profile-info">
                  <span className="profile-name">{user?.name ?? 'Operator'}</span>
                  <span className="profile-email">{user?.email ?? 'operator@netpulse.com'}</span>
                  <span className="profile-meta">Role: NOC Admin</span>
                </div>
                <div className="profile-actions">
                  <button className="profile-logout-btn" onClick={logout}>
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
