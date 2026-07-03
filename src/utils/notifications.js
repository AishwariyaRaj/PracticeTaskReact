import api from '../services/api'

export async function getNotifications() {
  try {
    const response = await api.get('/notifications')
    return response.data.items ?? []
  } catch (error) {
    console.error('[Notifications] Failed to fetch notifications:', error)
    return []
  }
}

export async function addNotification(title, message) {
  try {
    const response = await api.post('/notifications', { title, message })
    window.dispatchEvent(new Event('netpulse-new-notification'))
    return response.data.item
  } catch (error) {
    console.error('[Notifications] Failed to create notification:', error)
  }
}

export async function markAllAsRead() {
  try {
    await api.post('/notifications/read-all')
    window.dispatchEvent(new Event('netpulse-new-notification'))
  } catch (error) {
    console.error('[Notifications] Failed to mark read:', error)
  }
}

export async function clearNotifications() {
  try {
    await api.delete('/notifications')
    window.dispatchEvent(new Event('netpulse-new-notification'))
  } catch (error) {
    console.error('[Notifications] Failed to clear:', error)
  }
}
