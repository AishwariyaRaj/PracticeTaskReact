import { Search, Bell, Menu } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

export default function Header({ breadcrumbs = [], onHamburger }) {
  const { user } = useAuth()
  const initials = user?.name?.charAt(0)?.toUpperCase() ?? 'U'

  return (
    <header className="noc-topbar">
      <button className="topbar-hamburger" onClick={onHamburger} aria-label="Open menu">
        <Menu size={18} />
      </button>

      {/* Breadcrumb */}
      <nav className="topbar-breadcrumb">
        <Link to="/">Home</Link>
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
        <button className="topbar-bell" aria-label="Notifications">
          <Bell size={17} />
          <span className="topbar-bell__badge" />
        </button>
        <div className="topbar-user">
          <div className="topbar-avatar">{initials}</div>
          <span className="topbar-username">{user?.name ?? 'Operator'}</span>
        </div>
      </div>
    </header>
  )
}
