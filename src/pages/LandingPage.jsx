import { Link } from 'react-router-dom'
import { Activity, ArrowRight, Mail, Network, ShieldCheck, Sparkles, TimerReset } from 'lucide-react'
import Footer from '../components/Footer'

const features = [
  {
    icon: Network,
    title: 'Switch Inventory',
    description: 'Store, search, edit, and track switch details with Redis-backed persistence.',
  },
  {
    icon: Activity,
    title: 'Telemetry Charts',
    description: 'Inspect Min, Median, and Max values across a rolling time window.',
  },
  {
    icon: Mail,
    title: 'Email Automation',
    description: 'Send welcome, reset, and cluster alert emails from the backend.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Access',
    description: 'JWT authentication with protected routes and persistent sessions.',
  },
]

const stats = [
  { label: 'Protected Pages', value: '4' },
  { label: 'Core Practices', value: '4' },
  { label: 'Stack', value: 'React + Express' },
  { label: 'Storage', value: 'Redis' },
]

const highlights = [
  'Authenticated dashboard and public marketing entry',
  'Modern UI with clean cards, gradients, and responsive layout',
  'Persistent data flow with Redis or memory fallback',
  'Interactive charts and operational email workflows',
]

export default function LandingPage() {
  return (
    <div className="landing-shell">
      <section className="landing-hero">
        <div className="landing-hero__content">
          <span className="landing-badge">
            <Sparkles size={14} /> Network Operations Platform
          </span>
          <h1>Monitor switches, charts, and alerts from one polished dashboard.</h1>
          <p>
            NetPulse Dashboard is a full-stack NOC workspace with secure authentication,
            Redis-backed persistence, telemetry visualization, and automated email workflows.
          </p>

          <div className="landing-actions">
            <Link to="/register" className="btn btn-primary landing-cta">
              Create Account <ArrowRight size={16} />
            </Link>
            <Link to="/login" className="btn btn-ghost landing-cta-secondary">
              Sign In
            </Link>
          </div>

          <div className="landing-highlights">
            {highlights.map((item) => (
              <div key={item} className="landing-highlights__item">
                <TimerReset size={16} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="landing-hero__preview">
          <div className="landing-preview-card landing-preview-card--primary">
            <div className="landing-preview-card__eyebrow">Operations at a glance</div>
            <h2>Switches, telemetry, and alerts</h2>
            <p>Built for fast inspection, quick updates, and clear operational visibility.</p>
          </div>

          <div className="landing-preview-grid">
            {stats.map((stat) => (
              <article key={stat.label} className="landing-preview-card">
                <span className="landing-preview-card__label">{stat.label}</span>
                <strong>{stat.value}</strong>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section">
        <div className="landing-section__header">
          <span className="landing-section__eyebrow">Why this platform</span>
          <h2>Built to satisfy all practice tasks in one production-style UI.</h2>
        </div>

        <div className="landing-feature-grid">
          {features.map((feature) => {
            const Icon = feature.icon

            return (
              <article key={feature.title} className="landing-feature-card">
                <div className="landing-feature-card__icon">
                  <Icon size={20} />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            )
          })}
        </div>
      </section>

      <section className="landing-section landing-section--split">
        <div className="landing-panel">
          <span className="landing-section__eyebrow">What is included</span>
          <h2>Everything needed for the assignment is already covered in the product.</h2>
          <p>
            The app includes authenticated and unauthenticated pages, chart interactions, email
            flows, and persistent switch records stored through the backend.
          </p>
        </div>

        <div className="landing-panel landing-panel--list">
          <ul>
            <li>Public landing page with strong CTA buttons</li>
            <li>Login and registration flow with password confirmation</li>
            <li>Switch management with search and update actions</li>
            <li>Interactive telemetry chart with details table on double-click</li>
            <li>Email handling for register, reset, and cluster alerts</li>
          </ul>
        </div>
      </section>

      <Footer />
    </div>
  )
}