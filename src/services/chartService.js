import api from './api'

export async function fetchChartData() {
  const response = await api.get('/chart-data')
  return response.data.items ?? []
}
