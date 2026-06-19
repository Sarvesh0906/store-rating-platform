import { useEffect, useState } from 'react'
import { fetchStore } from '../api/stores'
import Modal from './Modal'

function formatRating(value) {
  const number = Number(value)

  if (Number.isFinite(number)) {
    return `${number.toFixed(1)} / 5`
  }

  return 'Not available'
}

function StoreDetailModal({ open = false, store: providedStore = null, storeId = null, onClose }) {
  const [store, setStore] = useState(providedStore)
  const [loading, setLoading] = useState(Boolean(open && !providedStore && storeId))
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) {
      return
    }

    if (providedStore) {
      setStore(providedStore)
      setLoading(false)
      setError('')
      return
    }

    if (!storeId) {
      return
    }

    let active = true

    async function loadStore() {
      setLoading(true)
      setError('')

      try {
        const response = await fetchStore(storeId)
        if (!active) {
          return
        }
        setStore(response.data.store)
      } catch (err) {
        if (!active) {
          return
        }
        setError(err.response?.data?.message || 'Unable to load store')
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadStore()

    return () => {
      active = false
    }
  }, [open, providedStore, storeId])

  if (!open) {
    return null
  }

  return (
    <Modal
      title={store?.name || 'Store Details'}
      description="Review the store profile and your submitted rating."
      onClose={onClose}
      size="lg"
    >
      {loading ? <div className="state-panel compact">Loading store details...</div> : null}
      {error ? <p className="error-banner">{error}</p> : null}

      {!loading && !error && store ? (
        <article className="feature-card modal-feature-card">
          <p className="eyebrow">Store Detail</p>
          <div className="modal-detail-list">
            <div className="modal-detail-row">
              <span>Store Name</span>
              <strong>{store.name || 'Not available'}</strong>
            </div>
            <div className="modal-detail-row">
              <span>Address</span>
              <strong>{store.address || 'Not available'}</strong>
            </div>
            <div className="modal-detail-row">
              <span>Overall Rating</span>
              <strong>{formatRating(store.overall_rating)}</strong>
            </div>
            <div className="modal-detail-row">
              <span>Your Rating</span>
              <strong>{store.user_rating === null || store.user_rating === undefined ? 'You have not rated this store yet' : formatRating(store.user_rating)}</strong>
            </div>
          </div>
        </article>
      ) : null}
    </Modal>
  )
}

export default StoreDetailModal
