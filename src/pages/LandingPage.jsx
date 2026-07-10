import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Activity, ArrowRight, CheckCircle, Mail, Network, ShieldCheck, Terminal, Heart } from 'lucide-react'
import Footer from '../components/Footer'
import Logo from '../components/Logo'
import { useAuth } from '../context/AuthContext'

const features = [
  {
    icon: Network,
    title: 'Switch Inventory',
    description: 'Register, edit, search, and track switch hardware with persistent Redis storage logs.',
  },
  {
    icon: Activity,
    title: 'Telemetry Charts',
    description: 'Track Min, Median, and Max metrics over a rolling window. Double-click points to inspect details.',
  },
  {
    icon: Mail,
    title: 'Email Dispatch',
    description: 'Automated mail flows for user signups, secure password resets, and critical cluster warnings.',
  },
  {
    icon: ShieldCheck,
    title: 'NOC Guard Auth',
    description: 'Strict JWT session verification with automatic cookie clearing on unauthorized requests.',
  },
]

const stats = [
  { label: 'Secure Routes', value: '4 Active' },
  { label: 'Latency Node', value: '12ms avg' },
  { label: 'Stack base', value: 'React + Express' },
  { label: 'Storage Engine', value: 'Redis DB' },
]

const terminalLogs = [
  'SYS: Booting NetPulse NOC systems...',
  'DB: Contacting Redis cluster at redis://127.0.0.1:6379',
  'DB: Redis store active. Seeding inventory keys...',
  'MAIL: SMTP transporter verified successfully.',
  'MONITOR: Auto-scanning 14 cluster switch racks...',
  'MONITOR: Switch SW-1001 status [ACTIVE]',
  'MONITOR: Switch SW-1002 status [MAINTENANCE]',
  'SYS: All telemetry lines operational [100%]',
  'MONITOR: Fetching hourly chart metrics...',
  'SYS: SECURE JWT Guard listening on port 5000.',
]

export default function LandingPage() {
  const { isAuthenticated, loading } = useAuth()
  const [logs, setLogs] = useState([])
  const [logIndex, setLogIndex] = useState(0)
  const [pingRate, setPingRate] = useState(12)

  // Simulate terminal logs printing
  useEffect(() => {
    if (logIndex < terminalLogs.length) {
      const timeout = setTimeout(() => {
        setLogs((prev) => [...prev, terminalLogs[logIndex]])
        setLogIndex((prev) => prev + 1)
      }, 1000 + Math.random() * 800)
      return () => clearTimeout(timeout)
    } else {
      // Loop logs or show idle pinging
      const timeout = setTimeout(() => {
        setLogs((prev) => {
          const next = [...prev]
          if (next.length > 8) next.shift() // scroll up
          next.push(`MONITOR: Ping check completed in ${pingRate}ms. status [OK]`)
          return next
        })
        setPingRate(Math.floor(10 + Math.random() * 6))
      }, 3000)
      return () => clearTimeout(timeout)
    }
  }, [logIndex, pingRate])

  return (
    <div className="landing-shell">
      {/* Sticky Premium Header */}
      <header className="landing-header">
        <div className="landing-header__wrapper">
          <Link to="/" className="landing-header__brand">
            <span className="landing-header__logo" style={{ background: 'none', boxShadow: 'none' }}>
              <Logo size={20} />
            </span>
            <span className="landing-header__name">NetPulse NOC</span>
            <span className="landing-header__status-pulse"></span>
          </Link>
          <nav className="landing-header__actions">
            {loading ? (
              <span className="landing-header__loading-text">Connecting...</span>
            ) : isAuthenticated ? (
              <Link to="/dashboard" className="btn btn-primary landing-header__btn">
                Go to Dashboard <ArrowRight size={14} />
              </Link>
            ) : (
              <>
                <Link to="/login" className="landing-header__link">Sign In</Link>
                <Link to="/register" className="btn btn-primary landing-header__btn">Get Started</Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-hero__content">
          <span className="landing-badge">
            <span className="landing-badge__indicator"></span>
            Operational Center Active
          </span>
          <h1>Visualizing networks, controlling switches.</h1>
          <p>
            NetPulse Dashboard provides a high-fidelity workspace for network administrators.
            Inspect cluster health, run instant switch state updates, and dispatch emergency alert protocols from a single command deck.
          </p>

          <div className="landing-actions">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn btn-primary landing-cta">
                Access Dashboard Console <ArrowRight size={16} />
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary landing-cta">
                  Initialize Operator Account <ArrowRight size={16} />
                </Link>
                <Link to="/login" className="btn btn-ghost landing-cta-secondary">
                  Operator Sign In
                </Link>
              </>
            )}
          </div>

          <div className="landing-highlights">
            <div className="landing-highlight-item">
              <CheckCircle size={16} className="text-emerald" />
              <span>Full CRUD switch table with status toggles</span>
            </div>
            <div className="landing-highlight-item">
              <CheckCircle size={16} className="text-emerald" />
              <span>24h rolling charts with detailed point selectors</span>
            </div>
            <div className="landing-highlight-item">
              <CheckCircle size={16} className="text-emerald" />
              <span>Nodemailer templates for signup & warning dispatches</span>
            </div>
            <div className="landing-highlight-item">
              <CheckCircle size={16} className="text-emerald" />
              <span>Redis caching with in-memory fallback</span>
            </div>
          </div>
        </div>

        {/* Futuristic Terminal Simulator */}
        <div className="landing-hero__preview">
          <div className="landing-terminal">
            <div className="landing-terminal__header">
              <div className="landing-terminal__dots">
                <span className="dot dot--red"></span>
                <span className="dot dot--yellow"></span>
                <span className="dot dot--green"></span>
              </div>
              <div className="landing-terminal__title">
                <Terminal size={12} /> netpulse-noc-kernel.sh
              </div>
              <div className="landing-terminal__net-status">
                <span>PING: {pingRate}ms</span>
              </div>
            </div>
            <div className="landing-terminal__body">
              {logs.map((log, idx) => (
                <div key={idx} className="terminal-line">
                  <span className="terminal-prompt">$</span> {log}
                </div>
              ))}
              <span className="terminal-cursor"></span>
            </div>
            <div className="landing-terminal__footer">
              <div className="status-indicator">
                <span className="pulse-green"></span>
                <span>SYSTEM STABLE</span>
              </div>
              <div className="metrics">
                <span>CPU: 1.4%</span>
                <span>RAM: 42MB</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="landing-preview-grid">
            {stats.map((stat) => (
              <div key={stat.label} className="landing-stat-card">
                <span className="landing-stat-card__label">{stat.label}</span>
                <strong className="landing-stat-card__value">{stat.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="landing-section">
        <div className="landing-section__header">
          <span className="landing-section__eyebrow">Enterprise Features</span>
          <h2>A robust design architecture meeting high SLA needs.</h2>
        </div>

        <div className="landing-feature-grid">
          {features.map((feat) => {
            const Icon = feat.icon
            return (
              <div key={feat.title} className="landing-feature-card">
                <div className="landing-feature-card__icon">
                  <Icon size={20} />
                </div>
                <h3>{feat.title}</h3>
                <p>{feat.description}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Footer Wrapper */}
      <Footer />
    </div>
  )
}