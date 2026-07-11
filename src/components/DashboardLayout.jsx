import { useState, useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'

const BREADCRUMB_MAP = {
  '/dashboard': [],
  '/dashboard/switches': [],
  '/dashboard/charts': [],
}

export default function DashboardLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const location = useLocation()
  const navigate = useNavigate()
  const breadcrumbs = BREADCRUMB_MAP[location.pathname] ?? []

  useEffect(() => {
    if (location.pathname !== '/dashboard/switches') {
      setSearchValue('')
    }
  }, [location.pathname])

  const handleSearchChange = (value) => {
    setSearchValue(value)
    if (value && location.pathname !== '/dashboard/switches') {
      navigate('/dashboard/switches')
    }
  }

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
        <Header
          breadcrumbs={breadcrumbs}
          onHamburger={handleHamburger}
          searchValue={searchValue}
          onSearchChange={handleSearchChange}
        />
        <main className="noc-content">
          <Outlet context={{ searchValue, setSearchValue }} />
        </main>
      </div>
    </div>
  )
}
