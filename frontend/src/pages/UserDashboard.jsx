import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

function UserDashboard() {
  const { user } = useAuth()

  return (
    <section className="dashboard-grid">
      <div className="dashboard-header">
        <p className="eyebrow">User Dashboard</p>
        <h1>Browse stores and manage your submitted ratings.</h1>
        <p className="lede">Search registered stores by name or address, then submit a rating from 1 to 5 or edit your own rating later.</p>
      </div>

      <div className="dashboard-content">
        <article className="feature-card">
          <h2>Current session</h2>
          <p>{user?.name}</p>
          <p>{user?.email}</p>
          <p>{user?.role}</p>
        </article>

        <article className="feature-card">
          <h2>Store browsing</h2>
          <p>Use the store list to search by name or address and submit ratings for registered stores.</p>
        </article>
      </div>

      <Link to="/stores" className="primary-button">
        Browse store listings
      </Link>
    </section>
  )
}

export default UserDashboard
