import { Link } from 'react-router-dom'

function AdminNotFound() {
  return (
    <section className="admin-panel">
      <div className="state-panel compact">
        <p className="eyebrow">404</p>
        <h2>System administrator page not found</h2>
        <Link to="/admin/dashboard" className="primary-button">
          Back to system administrator dashboard
        </Link>
      </div>
    </section>
  )
}

export default AdminNotFound
