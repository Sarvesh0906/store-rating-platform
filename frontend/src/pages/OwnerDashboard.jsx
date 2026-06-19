import { useEffect, useState } from 'react'
import { fetchOwnerDashboard } from '../api/owner'
import { useAuth } from '../hooks/useAuth'
import PaginationControls from '../components/PaginationControls'

const initialFilters = {
  search: '',
  sortBy: 'created_at',
  sortOrder: 'desc',
  page: 1,
  limit: 10,
}

function OwnerDashboard() {
  const { user } = useAuth()
  const [filters, setFilters] = useState(initialFilters)
  const [data, setData] = useState({ store: null, ratings: [], pagination: { page: 1, totalPages: 0, total: 0, limit: 10 } })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadOwnerDashboard() {
      setLoading(true)
      setError('')

      try {
        const response = await fetchOwnerDashboard(filters)
        if (!active) return
        setData(response.data)
      } catch (err) {
        if (!active) return
        setError(err.response?.data?.message || 'Unable to load owner dashboard')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadOwnerDashboard()

    return () => {
      active = false
    }
  }, [filters])

  const pagination = data.pagination || initialFilters

  return (
    <section className="owner-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Store Owner</p>
          <h1>Store Owner Dashboard</h1>
          <p className="lede">See the ratings for your own store and the users who submitted them.</p>
        </div>
      </div>

      <article className="feature-card">
        <h2>Current session</h2>
        <p>{user?.name}</p>
        <p>{user?.email}</p>
        <p>{user?.role}</p>
      </article>

      {loading ? <div className="state-panel compact">Loading your store data...</div> : null}
      {error ? <p className="error-banner">{error}</p> : null}

      {!loading && !error ? (
        data.store ? (
          <>
            <div className="metric-grid">
              <article className="metric-card">
                <span>Store name</span>
                <strong>{data.store.name}</strong>
              </article>
              <article className="metric-card">
                <span>Average rating</span>
                <strong>{data.store.average_rating}</strong>
              </article>
              <article className="metric-card">
                <span>Total Submitted Ratings</span>
                <strong>{data.pagination.total}</strong>
              </article>
            </div>

            <div className="filter-bar owner-filter-bar">
              <input
                type="search"
                value={filters.search}
                onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value, page: 1 }))}
                placeholder="Search user name, email, or address"
              />
              <select value={filters.sortBy} onChange={(event) => setFilters((current) => ({ ...current, sortBy: event.target.value }))}>
                <option value="created_at">Newest</option>
                <option value="name">Name</option>
                <option value="email">Email</option>
                <option value="address">Address</option>
                <option value="rating_value">Rating</option>
              </select>
              <select value={filters.sortOrder} onChange={(event) => setFilters((current) => ({ ...current, sortOrder: event.target.value }))}>
                <option value="desc">Desc</option>
                <option value="asc">Asc</option>
              </select>
              <select value={filters.limit} onChange={(event) => setFilters((current) => ({ ...current, limit: Number(event.target.value), page: 1 }))}>
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
                <option value={50}>50 / page</option>
              </select>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>User Name</th>
                    <th>Email</th>
                    <th>Address</th>
                    <th>Rating</th>
                    <th>Rated at</th>
                  </tr>
                </thead>
                <tbody>
                  {data.ratings.length ? (
                    data.ratings.map((rating) => (
                      <tr key={`${rating.user_id}-${rating.createdAt}`}>
                        <td>{rating.name}</td>
                        <td>{rating.email}</td>
                        <td>{rating.address}</td>
                        <td>{rating.rating_value}</td>
                        <td>{new Date(rating.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5">No ratings submitted yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <PaginationControls
              meta={pagination}
              onPrev={() => setFilters((current) => ({ ...current, page: Math.max(1, current.page - 1) }))}
              onNext={() =>
                setFilters((current) => ({
                  ...current,
                  page: Math.min(pagination.totalPages || 1, current.page + 1),
                }))
              }
              onPageSizeChange={(nextLimit) => setFilters((current) => ({ ...current, limit: nextLimit, page: 1 }))}
            />
          </>
        ) : (
          <div className="state-panel compact">
            <p>No store is assigned to this store owner yet.</p>
          </div>
        )
      ) : null}
    </section>
  )
}

export default OwnerDashboard
