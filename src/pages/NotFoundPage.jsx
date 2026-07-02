import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <section className="auth-screen">
      <div className="auth-card">
        <p className="eyebrow">Page not found</p>
        <h1>That route does not exist</h1>
        <p className="auth-card__subtitle">Use the navigation links or return to the dashboard.</p>
        <div className="auth-card__links">
          <Link to="/">Go to dashboard</Link>
          <Link to="/login">Login</Link>
        </div>
      </div>
    </section>
  )
}
