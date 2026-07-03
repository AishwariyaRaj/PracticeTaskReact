import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__wrapper">
        <div className="footer__grid">
          <div className="footer__brand-col">
            <div className="footer__logo-wrap">
              <span className="footer__logo-mark">N</span>
              <span className="footer__logo-name">NetPulse NOC</span>
            </div>
            <p className="footer__description">
              Next-generation Network Operations Center platform for telemetry monitoring, switch control, and automated alerting.
            </p>
            <div className="footer__status-badge">
              <span className="footer__status-dot"></span>
              <span className="footer__status-text">All Systems Operational</span>
            </div>
            <span className="footer__copyright">
              © {new Date().getFullYear()} NetPulse. All rights reserved.
            </span>
          </div>
          
          <div className="footer__links-col">
            <h4>Platform</h4>
            <ul>
              <li><Link to="/login">Inventory Control</Link></li>
              <li><Link to="/login">Live Telemetry</Link></li>
              <li><Link to="/login">Alerting Service</Link></li>
              <li><Link to="/login">Redis Storage</Link></li>
            </ul>
          </div>
          
          <div className="footer__links-col">
            <h4>Resources</h4>
            <ul>
              <li><a href="#docs">API Documentation</a></li>
              <li><a href="#status">Network Status</a></li>
              <li><a href="#help">Help Center</a></li>
              <li><a href="#contact">Operator Desk</a></li>
            </ul>
          </div>
          
          <div className="footer__links-col">
            <h4>Compliance</h4>
            <ul>
              <li><a href="#terms">Terms of Service</a></li>
              <li><a href="#privacy">Privacy Policy</a></li>
              <li><a href="#security">Security Audit</a></li>
              <li><a href="#sla">SLA Agreement</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}
