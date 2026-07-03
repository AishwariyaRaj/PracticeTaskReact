import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Network, BarChart3, LogOut, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/dashboard/switches', label: 'Switch Mgmt', icon: Network },
  { to: '/dashboard/charts', label: 'Chart Analytics', icon: BarChart3 },
]

export default function Sidebar({ isCollapsed, mobileOpen, onToggle, onCloseMobile }) {
  const { logout } = useAuth()
  const CollapseIcon = isCollapsed ? ChevronRight : ChevronLeft

  return (
    <aside className={`noc-sidebar${isCollapsed ? ' collapsed' : ''}${mobileOpen ? ' mobile-open' : ''}`}>
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-brand__mark">N</div>
        {!isCollapsed && (
          <div className="sidebar-brand__text">
            <span className="sidebar-brand__name">NetPulse NOC</span>
            <span className="sidebar-brand__sub">Operations Center</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
              end={to === '/dashboard'}
            onClick={onCloseMobile}
            title={isCollapsed ? label : undefined}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            <span className="sidebar-link__icon"><Icon size={18} /></span>
            <span className="sidebar-link__label">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="sidebar-bottom">
        <button
          className="sidebar-logout"
          onClick={logout}
          title={isCollapsed ? 'Logout' : undefined}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
        <button className="sidebar-toggle-btn" onClick={onToggle} title="Toggle sidebar">
          <CollapseIcon size={18} />
        </button>
      </div>
    </aside>
  )
}
