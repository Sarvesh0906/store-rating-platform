import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchStores } from '../api/stores'
import PaginationControls from '../components/PaginationControls'
import StoreDetailModal from '../components/StoreDetailModal'
import StoreRatingModal from '../components/StoreRatingModal'

const initialFilters = {
  search: '',
  sortBy: 'name',
  sortOrder: 'asc',
  page: 1,
  limit: 10,
}

function Stores() {
  const [filters, setFilters] = useState(initialFilters)
  const [data, setData] = useState({ items: [], pagination: { page: 1, totalPages: 0, total: 0, limit: 10 } })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedStore, setSelectedStore] = useState(null)
  const [activeModal, setActiveModal] = useState(null)
  const [refreshToken, setRefreshToken] = useState(0)

  useEffect(() => {
    let active = true

    async function loadStores() {
      setLoading(true)
      setError('')

      try {
        const response = await fetchStores(filters)
        if (!active) return
        setData(response.data)
      } catch (err) {
        if (!active) return
        setError(err.response?.data?.message || 'Unable to load stores')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadStores()
    return () => {
      active = false
    }
  }, [filters, refreshToken])

  const pagination = data.pagination || initialFilters

  function closeModal() {
    setSelectedStore(null)
    setActiveModal(null)
  }

  return (
    <section className="user-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">User Store Listings</p>
          <h1>Browse and rate registered stores</h1>
          <p className="lede">Search by name or address, then submit or update your rating.</p>
        </div>
        <Link to="/user" className="secondary-button">
          Back to Dashboard
        </Link>
      </div>

      <div className="filter-bar user-filter-bar">
        <input
          type="search"
          value={filters.search}
          onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value, page: 1 }))}
          placeholder="Search store name or address"
        />
        <select value={filters.sortBy} onChange={(event) => setFilters((current) => ({ ...current, sortBy: event.target.value }))}>
          <option value="name">Name</option>
          <option value="address">Address</option>
          <option value="overall_rating">Overall rating</option>
          <option value="created_at">Newest</option>
        </select>
        <select value={filters.sortOrder} onChange={(event) => setFilters((current) => ({ ...current, sortOrder: event.target.value }))}>
          <option value="asc">Asc</option>
          <option value="desc">Desc</option>
        </select>
        <select value={filters.limit} onChange={(event) => setFilters((current) => ({ ...current, limit: Number(event.target.value), page: 1 }))}>
          <option value={10}>10 / page</option>
          <option value={20}>20 / page</option>
          <option value={50}>50 / page</option>
        </select>
      </div>

      {loading ? <div className="state-panel compact">Loading registered stores...</div> : null}
      {error ? <p className="error-banner">{error}</p> : null}

      {!loading && !error ? (
        <>
          <div className="store-list">
            {data.items.length ? (
              data.items.map((store) => (
                <article className="store-card" key={store.id}>
                  <div className="store-copy">
                    <div>
                      <h2>{store.name}</h2>
                      <p>{store.address}</p>
                    </div>
                    <div className="store-meta">
                      <div>
                        <span>Overall Rating</span>
                        <strong>{store.overall_rating}</strong>
                      </div>
                      <div>
                        <span>Your Submitted Rating</span>
                        <strong>{store.user_rating ?? '-'}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="store-actions">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => {
                        setSelectedStore(store)
                        setActiveModal('detail')
                      }}
                    >
                      View Store Details
                    </button>
                    {store.user_rating === null ? (
                      <button
                        type="button"
                        className="primary-button"
                        onClick={() => {
                          setSelectedStore(store)
                          setActiveModal('submit')
                        }}
                      >
                        Submit Rating
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="primary-button"
                        onClick={() => {
                          setSelectedStore(store)
                          setActiveModal('edit')
                        }}
                      >
                        Modify Rating
                      </button>
                    )}
                  </div>
                </article>
              ))
            ) : (
              <div className="state-panel compact">No registered stores found.</div>
            )}
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
      ) : null}

      <StoreDetailModal open={activeModal === 'detail' && Boolean(selectedStore)} store={selectedStore} onClose={closeModal} />

      <StoreRatingModal
        open={activeModal === 'submit' && Boolean(selectedStore)}
        store={selectedStore}
        mode="submit"
        onClose={closeModal}
        onSuccess={() => {
          setRefreshToken((current) => current + 1)
          closeModal()
        }}
      />

      <StoreRatingModal
        open={activeModal === 'edit' && Boolean(selectedStore)}
        store={selectedStore}
        mode="edit"
        onClose={closeModal}
        onSuccess={() => {
          setRefreshToken((current) => current + 1)
          closeModal()
        }}
      />
    </section>
  )
}

export default Stores
