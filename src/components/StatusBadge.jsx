export default function StatusBadge({ status }) {
  const map = {
    Active: 'active',
    Maintenance: 'maintenance',
    Inactive: 'inactive',
    Offline: 'offline',
  }
  const cls = map[status] ?? 'offline'
  return <span className={`status-badge status-badge--${cls}`}>{status}</span>
}
