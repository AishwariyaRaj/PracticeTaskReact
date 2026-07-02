import api from './api'

export async function fetchSwitches() {
  const response = await api.get('/switches')
  return response.data.items ?? []
}

export async function createSwitch(payload) {
  const response = await api.post('/switches', payload)
  return response.data.item
}

export async function updateSwitch(id, payload) {
  const response = await api.put(`/switches/${id}`, payload)
  return response.data.item
}

export async function deleteSwitch(id) {
  const response = await api.delete(`/switches/${id}`)
  return response.data
}
