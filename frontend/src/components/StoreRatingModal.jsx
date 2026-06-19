import { useEffect, useState } from 'react'
import { fetchStore, submitRating, updateRating } from '../api/stores'
import Modal from './Modal'
import StoreRatingForm from './StoreRatingForm'

function StoreRatingModal({
  open = false,
  mode = 'submit',
  store: providedStore = null,
  storeId = null,
  onClose,
  onSuccess,
}) {
  const [store, setStore] = useState(providedStore)
  const [loading, setLoading] = useState(Boolean(open && !providedStore && storeId))
  const [saving, setSaving] = useState(false)
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

  const actionLabel = mode === 'edit' ? 'Modify Rating' : 'Submit Rating'
  const initialRating = mode === 'edit' ? store?.user_rating ?? '' : ''

  return (
    <Modal title={actionLabel} description={store?.name || 'Rate this store'} onClose={onClose} size="lg">
      {loading ? <div className="state-panel compact">Loading {mode === 'edit' ? 'modify rating' : 'submit rating'} form...</div> : null}
      {error ? <p className="error-banner">{error}</p> : null}

      {!loading && !error && store ? (
        <StoreRatingForm
          store={store}
          initialRating={initialRating}
          actionLabel={actionLabel}
          loading={saving}
          onSuccess={onSuccess}
          onSubmit={async (payload) => {
            setSaving(true)
            try {
              if (mode === 'edit') {
                await updateRating(store.id, payload)
              } else {
                await submitRating(store.id, payload)
              }
            } finally {
              setSaving(false)
            }
          }}
        />
      ) : null}
    </Modal>
  )
}

export default StoreRatingModal
