import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'

const BREADCRUMB_MAP = {
  '/': [],
  '/switches': ['Switch Management'],
  '/charts': ['Chart Analytics'],
}

export default function DashboardLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const breadcrumbs = BREADCRUMB_MAP[location.pathname] ?? []

  const handleToggle = () => setIsCollapsed(v => !v)
  const handleHamburger = () => setMobileOpen(v => !v)
  const handleCloseMobile = () => setMobileOpen(false)

  return (
    <div className="noc-shell">
      <Sidebar
        isCollapsed={isCollapsed}
        mobileOpen={mobileOpen}
        onToggle={handleToggle}
        onCloseMobile={handleCloseMobile}
      />
      {mobileOpen && (
        <div className="sidebar-backdrop" onClick={handleCloseMobile} />
      )}
      <div className="noc-main">
        <Header breadcrumbs={breadcrumbs} onHamburger={handleHamburger} />
        <main className="noc-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
