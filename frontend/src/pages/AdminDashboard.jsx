import { useEffect, useState } from 'react'
import { fetchAdminDashboard, fetchAdminStores, fetchAdminUsers } from '../api/admin'
import AdminFilters from '../components/admin/AdminFilters'
import StoreTable from '../components/admin/StoreTable'
import UserTable from '../components/admin/UserTable'
import PaginationControls from '../components/PaginationControls'
import Modal from '../components/Modal'
import AdminStoreForm from './AdminStoreForm'
import AdminUserForm from './AdminUserForm'
import AdminUserDetailModal from '../components/AdminUserDetailModal'

const initialUsersFilters = {
  search: '',
  role: '',
  sortBy: 'created_at',
  sortOrder: 'desc',
  page: 1,
  limit: 10,
}

const initialStoresFilters = {
  search: '',
  sortBy: 'created_at',
  sortOrder: 'desc',
  page: 1,
  limit: 10,
}

function AdminDashboard() {
  const [metrics, setMetrics] = useState({ total_users: 0, total_stores: 0, total_ratings: 0 })
  const [usersFilters, setUsersFilters] = useState(initialUsersFilters)
  const [storesFilters, setStoresFilters] = useState(initialStoresFilters)
  const [usersData, setUsersData] = useState({ items: [], pagination: initialUsersFilters })
  const [storesData, setStoresData] = useState({ items: [], pagination: initialStoresFilters })
  const [loadingMetrics, setLoadingMetrics] = useState(true)
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [loadingStores, setLoadingStores] = useState(true)
  const [errorMetrics, setErrorMetrics] = useState('')
  const [errorUsers, setErrorUsers] = useState('')
  const [errorStores, setErrorStores] = useState('')
  const [activeModal, setActiveModal] = useState(null)
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [refreshToken, setRefreshToken] = useState(0)

  useEffect(() => {
    let active = true

    async function loadMetrics() {
      setLoadingMetrics(true)
      setErrorMetrics('')

      try {
        const response = await fetchAdminDashboard()
        if (!active) return
        setMetrics(response.data)
      } catch (err) {
        if (!active) return
        setErrorMetrics(err.response?.data?.message || 'Unable to load dashboard metrics')
      } finally {
        if (active) setLoadingMetrics(false)
      }
    }

    loadMetrics()

    return () => {
      active = false
    }
  }, [refreshToken])

  useEffect(() => {
    let active = true

    async function loadUsers() {
      setLoadingUsers(true)
      setErrorUsers('')

      try {
        const response = await fetchAdminUsers(usersFilters)
        if (!active) return
        setUsersData(response.data)
      } catch (err) {
        if (!active) return
        setErrorUsers(err.response?.data?.message || 'Unable to load users')
      } finally {
        if (active) setLoadingUsers(false)
      }
    }

    loadUsers()

    return () => {
      active = false
    }
  }, [usersFilters, refreshToken])

  useEffect(() => {
    let active = true

    async function loadStores() {
      setLoadingStores(true)
      setErrorStores('')

      try {
        const response = await fetchAdminStores(storesFilters)
        if (!active) return
        setStoresData(response.data)
      } catch (err) {
        if (!active) return
        setErrorStores(err.response?.data?.message || 'Unable to load stores')
      } finally {
        if (active) setLoadingStores(false)
      }
    }

    loadStores()

    return () => {
      active = false
    }
  }, [storesFilters, refreshToken])

  const usersPagination = usersData.pagination || initialUsersFilters
  const storesPagination = storesData.pagination || initialStoresFilters

  function closeModal() {
    setActiveModal(null)
    setSelectedUserId(null)
  }

  function refreshAndClose() {
    setRefreshToken((current) => current + 1)
    closeModal()
  }

  return (
    <section className="admin-panel admin-dashboard-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">System Administrator</p>
          <h2>Admin Control Center</h2>
          <p className="lede">Monitor platform totals, manage users, and manage stores from one dashboard.</p>
        </div>
      </div>

      {loadingMetrics ? <div className="state-panel compact">Loading system administrator metrics...</div> : null}
      {errorMetrics ? <p className="error-banner">{errorMetrics}</p> : null}

      {!loadingMetrics && !errorMetrics ? (
        <div className="metric-grid">
          <article className="metric-card">
            <span>Total Users</span>
            <strong>{metrics.total_users}</strong>
          </article>
          <article className="metric-card">
            <span>Total Stores</span>
            <strong>{metrics.total_stores}</strong>
          </article>
          <article className="metric-card">
            <span>Total Ratings</span>
            <strong>{metrics.total_ratings}</strong>
          </article>
        </div>
      ) : null}

      <section className="admin-section">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Manage Users</p>
            <h2>All registered users</h2>
          </div>
          <button type="button" className="primary-button" onClick={() => setActiveModal('add-user')}>
            Add New User
          </button>
        </div>

        <AdminFilters
          search={usersFilters.search}
          searchPlaceholder="Search name, email, address, or role"
          onSearchChange={(search) => setUsersFilters((current) => ({ ...current, search, page: 1 }))}
          selects={[
            {
              key: 'role',
              value: usersFilters.role,
              onChange: (role) => setUsersFilters((current) => ({ ...current, role, page: 1 })),
              options: [
                { value: '', label: 'All roles' },
                { value: 'SYSTEM_ADMIN', label: 'System admin' },
                { value: 'NORMAL_USER', label: 'Normal user' },
                { value: 'STORE_OWNER', label: 'Store owner' },
              ],
            },
            {
              key: 'sortBy',
              value: usersFilters.sortBy,
              onChange: (sortBy) => setUsersFilters((current) => ({ ...current, sortBy })),
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
              value: usersFilters.sortOrder,
              onChange: (sortOrder) => setUsersFilters((current) => ({ ...current, sortOrder })),
              options: [
                { value: 'desc', label: 'Desc' },
                { value: 'asc', label: 'Asc' },
              ],
            },
            {
              key: 'limit',
              value: usersFilters.limit,
              onChange: (limit) => setUsersFilters((current) => ({ ...current, limit: Number(limit), page: 1 })),
              options: [
                { value: 10, label: '10 / page' },
                { value: 20, label: '20 / page' },
                { value: 50, label: '50 / page' },
              ],
            },
          ]}
        />

        {loadingUsers ? <div className="state-panel compact">Loading registered users...</div> : null}
        {errorUsers ? <p className="error-banner">{errorUsers}</p> : null}

        {!loadingUsers && !errorUsers ? (
          <>
            <UserTable
              items={usersData.items}
              onViewProfile={(user) => {
                setSelectedUserId(user.id)
                setActiveModal('view-user')
              }}
            />

            <PaginationControls
              meta={usersPagination}
              onPrev={() => setUsersFilters((current) => ({ ...current, page: Math.max(1, current.page - 1) }))}
              onNext={() =>
                setUsersFilters((current) => ({
                  ...current,
                  page: Math.min(usersPagination.totalPages || 1, current.page + 1),
                }))
              }
              onPageSizeChange={(nextLimit) => setUsersFilters((current) => ({ ...current, limit: nextLimit, page: 1 }))}
            />
          </>
        ) : null}
      </section>

      <section className="admin-section">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Manage Stores</p>
            <h2>All registered stores</h2>
          </div>
          <button type="button" className="primary-button" onClick={() => setActiveModal('add-store')}>
            Add New Store
          </button>
        </div>

        <AdminFilters
          search={storesFilters.search}
          searchPlaceholder="Search name, email, or address"
          onSearchChange={(search) => setStoresFilters((current) => ({ ...current, search, page: 1 }))}
          selects={[
            {
              key: 'sortBy',
              value: storesFilters.sortBy,
              onChange: (sortBy) => setStoresFilters((current) => ({ ...current, sortBy })),
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
              value: storesFilters.sortOrder,
              onChange: (sortOrder) => setStoresFilters((current) => ({ ...current, sortOrder })),
              options: [
                { value: 'desc', label: 'Desc' },
                { value: 'asc', label: 'Asc' },
              ],
            },
            {
              key: 'limit',
              value: storesFilters.limit,
              onChange: (limit) => setStoresFilters((current) => ({ ...current, limit: Number(limit), page: 1 })),
              options: [
                { value: 10, label: '10 / page' },
                { value: 20, label: '20 / page' },
                { value: 50, label: '50 / page' },
              ],
            },
          ]}
        />

        {loadingStores ? <div className="state-panel compact">Loading registered stores...</div> : null}
        {errorStores ? <p className="error-banner">{errorStores}</p> : null}

        {!loadingStores && !errorStores ? (
          <>
            <StoreTable items={storesData.items} />

            <PaginationControls
              meta={storesPagination}
              onPrev={() => setStoresFilters((current) => ({ ...current, page: Math.max(1, current.page - 1) }))}
              onNext={() =>
                setStoresFilters((current) => ({
                  ...current,
                  page: Math.min(storesPagination.totalPages || 1, current.page + 1),
                }))
              }
              onPageSizeChange={(nextLimit) => setStoresFilters((current) => ({ ...current, limit: nextLimit, page: 1 }))}
            />
          </>
        ) : null}
      </section>

      <AdminUserDetailModal
        open={activeModal === 'view-user' && Boolean(selectedUserId)}
        userId={selectedUserId}
        onClose={closeModal}
      />

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

export default AdminDashboard
