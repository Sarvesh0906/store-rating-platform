import { useEffect, useState } from 'react'
import { fetchAdminStores } from '../api/admin'
import AdminFilters from '../components/admin/AdminFilters'
import StoreTable from '../components/admin/StoreTable'
import PaginationControls from '../components/PaginationControls'
import Modal from '../components/Modal'
import AdminStoreForm from './AdminStoreForm'

const initialFilters = {
  search: '',
  sortBy: 'created_at',
  sortOrder: 'desc',
  page: 1,
  limit: 10,
}

function AdminStores() {
  const [filters, setFilters] = useState(initialFilters)
  const [data, setData] = useState({ items: [], pagination: { page: 1, totalPages: 0, total: 0, limit: 10 } })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeModal, setActiveModal] = useState(null)
  const [refreshToken, setRefreshToken] = useState(0)

  useEffect(() => {
    let active = true

    async function loadStores() {
      setLoading(true)
      setError('')

      try {
        const response = await fetchAdminStores(filters)
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
    setActiveModal(null)
  }

  function refreshAndClose() {
    setRefreshToken((current) => current + 1)
    closeModal()
  }

  return (
    <section className="admin-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">System Administrator Stores</p>
          <h2>All registered stores</h2>
        </div>
        <button type="button" className="primary-button" onClick={() => setActiveModal('add-store')}>
          Add New Store
        </button>
      </div>

      <AdminFilters
        search={filters.search}
        searchPlaceholder="Search name, email, or address"
        onSearchChange={(search) => setFilters((current) => ({ ...current, search, page: 1 }))}
        selects={[
          {
            key: 'sortBy',
            value: filters.sortBy,
            onChange: (sortBy) => setFilters((current) => ({ ...current, sortBy })),
            options: [
              { value: 'created_at', label: 'Newest' },
              { value: 'name', label: 'Name' },
              { value: 'email', label: 'Email' },
              { value: 'address', label: 'Address' },
              { value: 'overall_rating', label: 'Overall rating' },
              { value: 'rating_count', label: 'Ratings count' },
            ],
          },
          {
            key: 'sortOrder',
            value: filters.sortOrder,
            onChange: (sortOrder) => setFilters((current) => ({ ...current, sortOrder })),
            options: [
              { value: 'desc', label: 'Desc' },
              { value: 'asc', label: 'Asc' },
            ],
          },
          {
            key: 'limit',
            value: filters.limit,
            onChange: (limit) => setFilters((current) => ({ ...current, limit: Number(limit), page: 1 })),
            options: [
              { value: 10, label: '10 / page' },
              { value: 20, label: '20 / page' },
              { value: 50, label: '50 / page' },
            ],
          },
        ]}
      />

      {loading ? <div className="state-panel compact">Loading registered stores...</div> : null}
      {error ? <p className="error-banner">{error}</p> : null}

      {!loading && !error ? (
        <>
          <StoreTable items={data.items} />

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

      {activeModal === 'add-store' ? (
        <Modal title="Add New Store" description="Create a new store record" onClose={closeModal} size="lg">
          <AdminStoreForm
            embedded
            onCancel={closeModal}
            onSuccess={async () => {
              refreshAndClose()
            }}
          />
        </Modal>
      ) : null}
    </section>
  )
}

export default AdminStores
