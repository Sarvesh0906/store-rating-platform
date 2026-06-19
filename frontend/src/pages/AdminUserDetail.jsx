import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchAdminUserDetail } from '../api/admin'

function AdminUserDetail() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadUser() {
      setLoading(true)
      setError('')

      try {
        const response = await fetchAdminUserDetail(id)
        if (!active) return
        setData(response.data)
      } catch (err) {
        if (!active) return
        setError(err.response?.data?.message || 'Unable to load user details')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadUser()
    return () => {
      active = false
    }
  }, [id])

  if (loading) {
    return <div className="state-panel compact">Loading user details...</div>
  }

  if (error) {
    return <p className="error-banner">{error}</p>
  }

  return (
    <section className="admin-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">User Detail</p>
          <h2>{data.user.name}</h2>
        </div>
        <Link to="/users" className="secondary-button">
          Back to user list
        </Link>
      </div>

      <div className="detail-grid">
        <article className="feature-card">
          <h3>User Profile</h3>
          <p><strong>Email:</strong> {data.user.email}</p>
          <p><strong>Address:</strong> {data.user.address}</p>
          <p><strong>Role:</strong> {data.user.role}</p>
        </article>

        <article className="feature-card">
          <h3>Store Owner Assignment</h3>
          {data.owned_store ? (
            <>
              <p><strong>Store Name:</strong> {data.owned_store.name}</p>
              <p><strong>Email:</strong> {data.owned_store.email || '-'}</p>
              <p><strong>Overall Rating:</strong> {data.owned_store.overall_rating}</p>
              <p><strong>Ratings Count:</strong> {data.owned_store.rating_count}</p>
            </>
          ) : (
            <p>This user is not assigned as a store owner.</p>
          )}
        </article>
      </div>
    </section>
  )
}

export default AdminUserDetail
