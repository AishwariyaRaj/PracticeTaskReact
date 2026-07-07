import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Network, Activity, Wrench, XCircle, ArrowRight, ShieldAlert, BookOpen, HelpCircle, Info, Settings } from 'lucide-react'
import DashboardCard from '../components/DashboardCard'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import api from '../services/api'

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
    Promise.all([
      api.get('/switches/list').then(res => res.data.items ?? []),
      api.get('/chart-data').then(res => res.data.items ?? [])
    ])
      .then(([sw, ch]) => { if (mounted) { setSwitches(sw); setChartData(ch) } })
      .catch(() => { if (mounted) toast.error('Load failed', 'Could not load dashboard data.') })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  const metrics = useMemo(() => {
    const active = switches.filter(s => s.status === 'Active').length
    const maint = switches.filter(s => s.status === 'Maintenance').length
    const inactive = switches.filter(s => s.status === 'Inactive').length
    return [
      { title: 'Total Switches', value: String(switches.length), detail: 'Total switch inventory', icon: Network, tone: 'blue' },
      { title: 'Active Switches', value: String(active), detail: 'Currently online & operational', icon: Activity, tone: 'green' },
      { title: 'Maintenance', value: String(maint), detail: 'Requires attention', icon: Wrench, tone: 'orange' },
      { title: 'Inactive Switches', value: String(inactive), detail: 'Currently offline & disabled', icon: XCircle, tone: 'red' },
    ]
  }, [switches, chartData])

  const handleAlert = async () => {
    setAlertState('sending')
    try {
      await api.post('/cluster-alert', { recipientEmail: user?.email, severity: 'High', message: 'Simulated cluster issue.' })
      setAlertState('sent')
      toast.success('Alert sent', 'Cluster alert email dispatched successfully.')
      window.dispatchEvent(new Event('netpulse-new-notification'))
    } catch {
      setAlertState('failed')
      toast.error('Alert failed', 'Unable to send the cluster alert right now.')
    }
  }

  if (loading) {
    return (
      <div className="page-stack">
        <div className="noc-card"><div className="noc-card__body"><div className="skeleton skeleton-line" style={{ width: '40%' }} /><div className="skeleton skeleton-line" style={{ width: '60%' }} /></div></div>
        <div className="dash-grid">{[1, 2, 3, 4].map(i => <div key={i} className="noc-card"><div className="noc-card__body"><div className="skeleton skeleton-line" /></div></div>)}</div>
      </div>
    )
  }

  return (
    <div className="page-stack">
      {/* Friendly Welcome & System Simulation Panel */}
      <div className="hero-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'stretch' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div className="hero-eyebrow">Welcome back, {user?.name ?? 'Operator'}</div>
            <h2 style={{ margin: 0, fontSize: '1.8rem' }}>Operations Overview</h2>
            <p style={{ margin: '4px 0 0', opacity: 0.85 }}>Track network inventory, chart telemetry, and automated alerts from one workspace.</p>
          </div>

          <div className="alert-simulation-box" style={{ background: 'rgba(255,255,255,0.08)', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ maxWidth: '280px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <ShieldAlert size={14} /> Alert Test Console
              </span>
              <p style={{ fontSize: '0.78rem', margin: '4px 0 0', lineHeight: 1.3, opacity: 0.9 }}>Simulate a critical cluster warning. A notification email will be sent directly to your registered spam.</p>
            </div>
            <button
              className="btn btn-primary"
              onClick={handleAlert}
              disabled={alertState === 'sending'}
              style={{ padding: '8px 16px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
            >
              {alertState === 'sending' ? 'Sending...' : '⚡ Simulate Alert'}
            </button>
          </div>
        </div>
      </div>

      {/* Newcomer Onboarding Guide */}
      <div className="noc-card" style={{ borderLeft: '4px solid var(--primary)' }}>
        <div className="noc-card__header" style={{ padding: '18px 24px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={18} className="text-primary" />
            <div className="noc-card__title">Platform Quick Start Guide</div>
          </div>
        </div>
        <div className="noc-card__body" style={{ padding: '14px 24px 20px' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 16px', lineHeight: 1.5 }}>
            Welcome to <strong>NetPulse NOC</strong>. This is an enterprise-grade Network Operations Center administration console. Here is how you can get started and explore:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>

            <div style={{ background: 'var(--bg-soft)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text)' }}>
                <span style={{ background: 'var(--primary-light)', color: 'var(--primary)', width: '20px', height: '20px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, textAlign: 'center', flexShrink: 0 }}>1</span>
                Monitor Statuses
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '6px 0 0', lineHeight: 1.4 }}>
                Review live metric counts below. Track how many hardware nodes are online, under maintenance, or offline.
              </p>
            </div>

            <div style={{ background: 'var(--bg-soft)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text)' }}>
                  <span style={{ background: 'var(--primary-light)', color: 'var(--primary)', width: '20px', height: '20px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, textAlign: 'center', flexShrink: 0 }}>2</span>
                  Inventory Management
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '6px 0 0', lineHeight: 1.4 }}>
                  Add new network hardware, search by models/IPs, edit details, or remove switches from the active pool.
                </p>
              </div>
              <Link to="/dashboard/switches" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)', marginTop: '10px', textDecoration: 'none' }}>
                Open Switch Management <ArrowRight size={14} />
              </Link>
            </div>

            <div style={{ background: 'var(--bg-soft)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text)' }}>
                  <span style={{ background: 'var(--primary-light)', color: 'var(--primary)', width: '20px', height: '20px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, textAlign: 'center', flexShrink: 0 }}>3</span>
                  Telemetry Analytics
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '6px 0 0', lineHeight: 1.4 }}>
                  Interact with real-time charts plotting rolling network medians, mins, and maxes. Double-click points to view raw logs.
                </p>
              </div>
              <Link to="/dashboard/charts" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)', marginTop: '10px', textDecoration: 'none' }}>
                Inspect Live Charts <ArrowRight size={14} />
              </Link>
            </div>

          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="dash-grid">
        {metrics.map(m => <DashboardCard key={m.title} {...m} />)}
      </div>

      {/* NOC Help Center & Operational Guidelines */}
      <div className="noc-card" style={{ borderLeft: '4px solid var(--warning)' }}>
        <div className="noc-card__header" style={{ padding: '18px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HelpCircle size={18} className="text-warning" />
            <div className="noc-card__title">NOC Help Center & Operational Guidelines</div>
          </div>
        </div>
        <div className="noc-card__body" style={{ padding: '14px 24px 24px' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0 0 16px', lineHeight: 1.5 }}>
            Manage the network switches and monitor health status across the cluster with these guidelines:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>

            <div style={{ background: 'var(--bg-soft)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text)', marginBottom: '8px' }}>
                <Info size={16} className="text-primary" />
                Understanding Status Indicators
              </div>
              <ul style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, paddingLeft: '20px', lineHeight: 1.6 }}>
                <li><strong>Active:</strong> The switch is fully online, routing packets, and reporting green telemetry.</li>
                <li><strong>Maintenance:</strong> The hardware is undergoing a rolling upgrade or scheduled physical routing checks.</li>
                <li><strong>Inactive:</strong> The switch is offline or decommissioned, requiring immediate operator diagnostic check.</li>
              </ul>
            </div>

            <div style={{ background: 'var(--bg-soft)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text)', marginBottom: '8px' }}>
                <Settings size={16} className="text-primary" />
                Frequently Checked Procedures
              </div>
              <ul style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, paddingLeft: '20px', lineHeight: 1.6 }}>
                <li><strong>Adding Switches:</strong> Navigate to <Link to="/dashboard/switches" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Switch Mgmt</Link>, click <em>Register Switch</em>, specify model/IP, and click save.</li>
                <li><strong>Analyzing Charts:</strong> Go to <Link to="/dashboard/charts" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Chart Analytics</Link> to inspect max, median, and min rolling signals.</li>
                <li><strong>Simulating Alerts:</strong> Dispatch high-severity cluster warnings to your email inbox via the <em>Alert Test Console</em> button above.</li>
              </ul>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
