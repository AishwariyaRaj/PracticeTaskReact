import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

export default function GuestLayout() {
  const { theme } = useTheme()

  useEffect(() => {
    const root = document.documentElement
    // Force light theme on mount
    root.classList.remove('dark')
    root.setAttribute('data-theme', 'light')

    return () => {
      // Restore user's actual theme when leaving guest pages
      const savedTheme = localStorage.getItem('netpulse_theme') || 'light'
      if (savedTheme === 'dark') {
        root.classList.add('dark')
        root.setAttribute('data-theme', 'dark')
      } else {
        root.classList.remove('dark')
        root.setAttribute('data-theme', 'light')
      }
    }
  }, [theme])

  return <Outlet />
}
