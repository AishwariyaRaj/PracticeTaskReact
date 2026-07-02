import { useEffect, useMemo, useState } from 'react'
import { Network, Activity, Wrench, TrendingUp } from 'lucide-react'
import DashboardCard from '../components/DashboardCard'
import StatusBadge from '../components/StatusBadge'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { fetchChartData } from '../services/chartService'
import { fetchSwitches } from '../services/switchService'
import { sendClusterAlert } from '../services/alertService'

export default function DashboardPage() {
  useDocumentTitle('Dashboard')
  const { user } = useAuth()
  const toast = useToast()
  const [switches, setSwitches] = useState([])
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)
  const [alertState, setAlertState] = useState('idle')

  useEffect(() => {
    let mounted = true
    Promise.all([fetchSwitches(), fetchChartData()])
      .then(([sw, ch]) => { if (mounted) { setSwitches(sw); setChartData(ch) } })
      .catch(() => { if (mounted) toast.error('Load failed', 'Could not load dashboard data.') })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  const metrics = useMemo(() => {
    const active = switches.filter(s => s.status === 'Active').length
    const maint = switches.filter(s => s.status === 'Maintenance').length
    const last = chartData.at(-1)
    return [
      { title: 'Total Switches', value: String(switches.length), detail: 'Redis-backed inventory', icon: Network, tone: 'blue' },
      { title: 'Active Switches', value: String(active), detail: 'Currently online', icon: Activity, tone: 'green' },
      { title: 'Maintenance', value: String(maint), detail: 'Needs attention', icon: Wrench, tone: 'orange' },
      { title: 'Latest Median', value: last ? `${last.median}` : '–', detail: last ? new Date(last.timestamp).toLocaleString() : 'No data', icon: TrendingUp, tone: 'purple' },
    ]
  }, [switches, chartData])

  const handleAlert = async () => {
    setAlertState('sending')
    try {
      await sendClusterAlert({ recipientEmail: user?.email, severity: 'High', message: 'Simulated cluster issue.' })
      setAlertState('sent')
      toast.success('Alert sent', 'Cluster alert email dispatched successfully.')
    } catch {
      setAlertState('failed')
      toast.error('Alert failed', 'Unable to send the cluster alert right now.')
    }
  }

  if (loading) {
    return (
      <div className="page-stack">
        <div className="noc-card"><div className="noc-card__body"><div className="skeleton skeleton-line" style={{ width: '40%' }} /><div className="skeleton skeleton-line" style={{ width: '60%' }} /></div></div>
        <div className="dash-grid">{[1,2,3,4].map(i => <div key={i} className="noc-card"><div className="noc-card__body"><div className="skeleton skeleton-line" /></div></div>)}</div>
      </div>
    )
  }

  return (
    <div className="page-stack">
      {/* Hero */}
      <div className="hero-panel">
        <div>
          <div className="hero-eyebrow">Welcome back, {user?.name ?? 'Operator'}</div>
          <h2>Operations Overview</h2>
          <p>Track network inventory, chart telemetry, and automated alerts from one workspace.</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleAlert}
          disabled={alertState === 'sending'}
        >
          {alertState === 'sending' ? 'Sending...' : '⚡ Simulate Cluster Alert'}
        </button>
      </div>

      {/* Metric Cards */}
      <div className="dash-grid">
        {metrics.map(m => <DashboardCard key={m.title} {...m} />)}
      </div>

      {/* Switch Preview */}
      <div className="noc-card">
        <div className="noc-card__header">
          <div>
            <div className="noc-card__title">Switch Readiness</div>
            <div className="noc-card__sub">Recent state pulled from Redis on every load</div>
          </div>
        </div>
        <div className="noc-card__body">
          <table className="mini-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                <th style={{ textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', padding: '0 0 10px' }}>Model</th>
                <th style={{ textAlign: 'right', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', padding: '0 0 10px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {switches.slice(0, 5).map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 0', fontSize: '0.875rem', color: 'var(--text)' }}>{item.model}</td>
                  <td style={{ padding: '12px 0', textAlign: 'right' }}><StatusBadge status={item.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
