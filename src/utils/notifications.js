export function getNotifications() {
  const stored = localStorage.getItem('netpulse:notifications')
  if (!stored) {
    const defaults = [
      {
        id: '1',
        title: 'Welcome Onboard',
        message: 'Your NetPulse Operator account has been initialized.',
        time: new Date().toISOString(),
        read: false
      },
      {
        id: '2',
        title: 'Database Connected',
        message: 'Successfully connected to Redis database cluster.',
        time: new Date(Date.now() - 60 * 1000 * 2).toISOString(),
        read: true
      }
    ]
    localStorage.setItem('netpulse:notifications', JSON.stringify(defaults))
    return defaults
  }
  return JSON.parse(stored)
}

export function addNotification(title, message) {
  const list = getNotifications()
  list.unshift({
    id: String(Date.now()),
    title,
    message,
    time: new Date().toISOString(),
    read: false
  })
  localStorage.setItem('netpulse:notifications', JSON.stringify(list))
  window.dispatchEvent(new Event('netpulse-new-notification'))
}

export function markAllAsRead() {
  const list = getNotifications().map(item => ({ ...item, read: true }))
  localStorage.setItem('netpulse:notifications', JSON.stringify(list))
  window.dispatchEvent(new Event('netpulse-new-notification'))
}

export function clearNotifications() {
  localStorage.setItem('netpulse:notifications', JSON.stringify([]))
  window.dispatchEvent(new Event('netpulse-new-notification'))
}
