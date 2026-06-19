import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <section className="state-panel">
      <p className="eyebrow">404</p>
      <h1>Store rating page not found</h1>
      <p>The route you requested does not exist in the store rating platform.</p>
      <Link to="/" className="primary-button">
        Go to home
      </Link>
    </section>
  )
}

export default NotFound
