import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const addToast = useCallback((type, title, message) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, type, title, message }])
    setTimeout(() => dismiss(id), 3500)
    return id
  }, [dismiss])

  const toast = {
    success: (title, message) => addToast('success', title, message),
    error: (title, message) => addToast('error', title, message),
    info: (title, message) => addToast('info', title, message),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastList toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

function ToastList({ toasts, onDismiss }) {
  if (!toasts.length) return null
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onDismiss }) {
  const icons = { success: '✓', error: '✕', info: 'i' }
  return (
    <div className={`toast toast--${toast.type}`}>
      <div className="toast__icon">{icons[toast.type]}</div>
      <div className="toast__text">
        <div className="toast__title">{toast.title}</div>
        {toast.message && <div className="toast__msg">{toast.message}</div>}
      </div>
      <button className="toast__close" onClick={() => onDismiss(toast.id)}>✕</button>
    </div>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
