import { useEffect, useState } from 'react'
import { fetchAdminUsers } from '../api/admin'
import AdminFilters from '../components/admin/AdminFilters'
import UserTable from '../components/admin/UserTable'
import PaginationControls from '../components/PaginationControls'
import Modal from '../components/Modal'
import AdminUserForm from './AdminUserForm'
import AdminUserDetailModal from '../components/AdminUserDetailModal'

const initialFilters = {
  search: '',
  role: '',
  sortBy: 'created_at',
  sortOrder: 'desc',
  page: 1,
  limit: 10,
}

function AdminUsers() {
  const [filters, setFilters] = useState(initialFilters)
  const [data, setData] = useState({ items: [], pagination: { page: 1, totalPages: 0, total: 0, limit: 10 } })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeModal, setActiveModal] = useState(null)
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [refreshToken, setRefreshToken] = useState(0)

  useEffect(() => {
    let active = true

    async function loadUsers() {
      setLoading(true)
      setError('')

      try {
        const response = await fetchAdminUsers(filters)
        if (!active) return
        setData(response.data)
      } catch (err) {
        if (!active) return
        setError(err.response?.data?.message || 'Unable to load users')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadUsers()
    return () => {
      active = false
    }
  }, [filters, refreshToken])

  const pagination = data.pagination || initialFilters

  function closeModal() {
    setActiveModal(null)
    setSelectedUserId(null)
  }

  function refreshAndClose() {
    setRefreshToken((current) => current + 1)
    closeModal()
  }

  return (
    <section className="admin-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">System Administrator Users</p>
          <h2>All registered users</h2>
        </div>
        <button type="button" className="primary-button" onClick={() => setActiveModal('add-user')}>
          Add New User
        </button>
      </div>

      <AdminFilters
        search={filters.search}
        searchPlaceholder="Search name, email, address, or role"
        onSearchChange={(search) => setFilters((current) => ({ ...current, search, page: 1 }))}
        selects={[
          {
            key: 'role',
            value: filters.role,
            onChange: (role) => setFilters((current) => ({ ...current, role, page: 1 })),
            options: [
              { value: '', label: 'All roles' },
              { value: 'SYSTEM_ADMIN', label: 'System admin' },
              { value: 'NORMAL_USER', label: 'Normal user' },
              { value: 'STORE_OWNER', label: 'Store owner' },
            ],
          },
          {
            key: 'sortBy',
            value: filters.sortBy,
            onChange: (sortBy) => setFilters((current) => ({ ...current, sortBy })),
            options: [
              { value: 'created_at', label: 'Newest' },
              { value: 'name', label: 'Name' },
              { value: 'email', label: 'Email' },
              { value: 'address', label: 'Address' },
              { value: 'role', label: 'Role' },
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

      {loading ? <div className="state-panel compact">Loading registered users...</div> : null}
      {error ? <p className="error-banner">{error}</p> : null}

      {!loading && !error ? (
        <>
          <UserTable
            items={data.items}
            onViewProfile={(user) => {
              setSelectedUserId(user.id)
              setActiveModal('view-user')
            }}
          />

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

      <AdminUserDetailModal open={activeModal === 'view-user' && Boolean(selectedUserId)} userId={selectedUserId} onClose={closeModal} />

      {activeModal === 'add-user' ? (
        <Modal title="Add New User" description="Create a new platform user" onClose={closeModal} size="lg">
          <AdminUserForm
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

export default AdminUsers
