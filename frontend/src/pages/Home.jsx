import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getDashboardPath } from '../utils/navigation'

function Home() {
  const { user, isAuthenticated } = useAuth()

  return (
    <section className="hero-panel">
      <div className="hero-copy">
        <p className="eyebrow">Store Rating Platform</p>
        <h1>Track store ratings for system administrators, new users, and store owners.</h1>
        <p className="lede">
          One shared login system powers all roles. Normal users can sign up, browse registered stores, and submit
          ratings from 1 to 5. System administrators manage users and stores. Store owners review the ratings left for
          their store.
        </p>

        <div className="button-row">
          <Link to={isAuthenticated ? getDashboardPath(user?.role) : '/login'} className="primary-button">
            {isAuthenticated ? 'Open Your Dashboard' : 'Sign In'}
          </Link>
          <Link to="/signup" className="secondary-button">
            User Signup
          </Link>
        </div>

        {user ? (
          <div className="status-card">
            <span>Active session</span>
            <strong>{user.name}</strong>
            <p>{user.role}</p>
          </div>
        ) : null}
      </div>

      <div className="feature-grid">
        <article className="feature-card">
          <h2>System Administrator Tools</h2>
          <p>Total Users, Total Stores, and Total Submitted Ratings are available from the admin dashboard.</p>
        </article>
        <article className="feature-card">
          <h2>New User Flow</h2>
          <p>Search stores by name or address, submit a 1 to 5 rating, and modify your submitted rating later.</p>
        </article>
        <article className="feature-card">
          <h2>Store Owner View</h2>
          <p>See your Average Store Rating and the Users Who Rated Your Store, with search and pagination.</p>
        </article>
      </div>
    </section>
  )
}

export default Home
