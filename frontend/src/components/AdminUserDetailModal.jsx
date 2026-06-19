import { useEffect, useState } from 'react'
import { fetchAdminUserDetail } from '../api/admin'
import Modal from './Modal'

function formatRating(value) {
  const number = Number(value)
  return Number.isFinite(number) ? `${number.toFixed(1)} / 5` : 'Not available'
}

function AdminUserDetailModal({ open = false, userId = null, onClose }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(Boolean(open && userId))
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open || !userId) {
      return
    }

    let active = true

    async function loadUser() {
      setLoading(true)
      setError('')

      try {
        const response = await fetchAdminUserDetail(userId)
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
  }, [open, userId])

  if (!open) {
    return null
  }

  return (
    <Modal title={data?.user?.name || 'User Profile'} description="View account and store ownership details" onClose={onClose} size="lg">
      {loading ? <div className="state-panel compact">Loading user details...</div> : null}
      {error ? <p className="error-banner">{error}</p> : null}

      {!loading && !error && data?.user ? (
        <div className="modal-detail-list">
          <div className="modal-detail-row">
            <span>Name</span>
            <strong>{data.user.name}</strong>
          </div>
          <div className="modal-detail-row">
            <span>Email</span>
            <strong>{data.user.email}</strong>
          </div>
          <div className="modal-detail-row">
            <span>Address</span>
            <strong>{data.user.address}</strong>
          </div>
          <div className="modal-detail-row">
            <span>Role</span>
            <strong>{data.user.role}</strong>
          </div>
          {data.user.role === 'STORE_OWNER' ? (
            <div className="modal-detail-row">
              <span>Store Rating</span>
              <strong>{formatRating(data.owned_store?.overall_rating)}</strong>
            </div>
          ) : null}
        </div>
      ) : null}
    </Modal>
  )
}

export default AdminUserDetailModal
