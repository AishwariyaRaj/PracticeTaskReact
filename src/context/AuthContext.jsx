import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import * as authService from '../services/authService'

const AuthContext = createContext(undefined)
const USER_STORAGE_KEY = 'netpulse_user'
const TOKEN_STORAGE_KEY = 'netpulse_token'

function readStoredAuth() {
  const storedUser = localStorage.getItem(USER_STORAGE_KEY)
  const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY)

  if (!storedUser || !storedToken) {
    return {
      user: null,
      token: null,
      isAuthenticated: false,
    }
  }

  try {
    return {
      user: JSON.parse(storedUser),
      token: storedToken,
      isAuthenticated: true,
    }
  } catch {
    return {
      user: null,
      token: null,
      isAuthenticated: false,
    }
  }
}

function persistAuth({ user, token }) {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
  localStorage.setItem(TOKEN_STORAGE_KEY, token)
}

function clearAuthStorage() {
  localStorage.removeItem(USER_STORAGE_KEY)
  localStorage.removeItem(TOKEN_STORAGE_KEY)
}

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({
    user: null,
    token: null,
    isAuthenticated: false,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setAuthState(readStoredAuth())
    setLoading(false)
  }, [])

  useEffect(() => {
    const handleExpiry = () => {
      clearAuthStorage()
      setAuthState({ user: null, token: null, isAuthenticated: false })
    }

    window.addEventListener('netpulse:auth-expired', handleExpiry)
    return () => window.removeEventListener('netpulse:auth-expired', handleExpiry)
  }, [])

  const authenticate = useCallback(({ user, token }) => {
    persistAuth({ user, token })
    setAuthState({ user, token, isAuthenticated: true })
    return { user, token }
  }, [])

  const login = useCallback(async (credentials) => {
    const data = await authService.login(credentials)
    return authenticate(data)
  }, [authenticate])

  const register = useCallback(async (payload) => {
    const data = await authService.register(payload)
    return authenticate(data)
  }, [authenticate])

  const logout = useCallback(() => {
    clearAuthStorage()
    setAuthState({ user: null, token: null, isAuthenticated: false })
  }, [])

  const forgotPassword = useCallback((payload) => authService.forgotPassword(payload), [])
  const resetPassword = useCallback((payload) => authService.resetPassword(payload), [])

  const value = useMemo(
    () => ({
      user: authState.user,
      token: authState.token,
      isAuthenticated: authState.isAuthenticated,
      loading,
      login,
      register,
      logout,
      forgotPassword,
      resetPassword,
    }),
    [authState.isAuthenticated, authState.token, authState.user, forgotPassword, login, loading, logout, register, resetPassword]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
