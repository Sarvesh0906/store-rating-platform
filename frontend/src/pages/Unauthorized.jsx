import { Link } from 'react-router-dom'

function Unauthorized() {
  return (
    <section className="state-panel">
      <p className="eyebrow">403</p>
      <h1>Access denied for this role</h1>
      <p>You are signed in, but your current role cannot access this area of the store rating platform.</p>
      <Link to="/dashboard" className="primary-button">
        Return to dashboard
      </Link>
    </section>
  )
}

export default Unauthorized
