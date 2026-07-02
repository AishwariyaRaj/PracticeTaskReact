import api from './api'

export async function sendClusterAlert(payload) {
  const response = await api.post('/cluster-alert', payload)
  return response.data
}
