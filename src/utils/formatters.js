export function formatDateTime(value) {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function formatStatusClass(status) {
  return `status-pill status-pill--${String(status).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
}

export function normalizeText(value) {
  return String(value ?? '').trim().toLowerCase()
}
