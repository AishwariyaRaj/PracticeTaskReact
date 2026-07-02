import api from './api'

export async function register(payload) {
  const response = await api.post('/register', payload)
  return response.data
}

export async function login(payload) {
  const response = await api.post('/login', payload)
  return response.data
}

export async function forgotPassword(payload) {
  const response = await api.post('/forgot-password', payload)
  return response.data
}

export async function resetPassword(payload) {
  const response = await api.post('/reset-password', payload)
  return response.data
}
