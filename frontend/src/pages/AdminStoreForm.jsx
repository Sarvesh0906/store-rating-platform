import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createAdminStore, fetchAdminUsers } from '../api/admin'

const initialState = {
  name: '',
  email: '',
  address: '',
  owner_user_id: '',
}

function mapErrors(apiErrors) {
  const next = {}
  apiErrors.forEach((item) => {
    if (item?.path) {
      next[item.path] = item.message
    }
  })
  return next
}

function AdminStoreForm({ embedded = false, onCancel, onSuccess, successRedirectTo }) {
  const [form, setForm] = useState(initialState)
  const [owners, setOwners] = useState([])
  const [fieldErrors, setFieldErrors] = useState({})
  const [generalError, setGeneralError] = useState('')
  const [loading, setLoading] = useState(false)
  const [ownerLoading, setOwnerLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    let active = true

    async function loadOwners() {
      try {
        const response = await fetchAdminUsers({
          role: 'STORE_OWNER',
          page: 1,
          limit: 50,
          sortBy: 'name',
          sortOrder: 'asc',
        })
        if (!active) return
        setOwners(response.data.items)
      } catch {
        if (!active) return
        setOwners([])
      } finally {
        if (active) setOwnerLoading(false)
      }
    }

    loadOwners()
    return () => {
      active = false
    }
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    setFieldErrors({})
    setGeneralError('')
    setLoading(true)

    try {
      const response = await createAdminStore({
        ...form,
        owner_user_id: form.owner_user_id || null,
      })
      if (onSuccess) {
        await onSuccess(response)
        return
      }

      navigate(successRedirectTo || '/stores', { replace: true })
    } catch (err) {
      const errors = err.response?.data?.errors
      if (Array.isArray(errors)) {
        setFieldErrors(mapErrors(errors))
      } else {
        setGeneralError(err.response?.data?.message || 'Unable to create store')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={embedded ? 'modal-form-shell' : 'admin-panel'}>
      {!embedded ? (
        <div className="panel-header">
          <div>
            <p className="eyebrow">Add New Store</p>
            <h2>Create a new store record</h2>
          </div>
        </div>
      ) : null}

      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          Name
          <input
            type="text"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            placeholder="Store name"
            required
          />
          {fieldErrors.name ? <span className="field-error">{fieldErrors.name}</span> : null}
        </label>

        <label>
          Email
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            placeholder="Optional store email"
          />
          {fieldErrors.email ? <span className="field-error">{fieldErrors.email}</span> : null}
        </label>

        <label>
          Address
          <textarea
            value={form.address}
            onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))}
            maxLength={400}
            placeholder="Store address up to 400 characters"
            rows={4}
            required
          />
          {fieldErrors.address ? <span className="field-error">{fieldErrors.address}</span> : null}
        </label>

        <label>
          Store owner
          <select
            value={form.owner_user_id}
            onChange={(event) => setForm((current) => ({ ...current, owner_user_id: event.target.value }))}
            disabled={ownerLoading || owners.length === 0}
          >
            {ownerLoading ? (
              <option value="">Loading store owners...</option>
            ) : owners.length === 0 ? (
              <option value="">No store owners available</option>
            ) : (
              <>
                <option value="">Select Store Owner (optional)</option>
                {owners.map((owner) => (
                  <option key={owner.id} value={owner.id}>
                    {owner.name}
                    {owner.email ? ` (${owner.email})` : ''}
                  </option>
                ))}
              </>
            )}
          </select>
          {fieldErrors.owner_user_id ? <span className="field-error">{fieldErrors.owner_user_id}</span> : null}
        </label>

        {generalError ? <p className="error-banner">{generalError}</p> : null}

        <div className="button-row">
          {embedded ? (
            <button type="button" className="secondary-button" onClick={onCancel}>
              Cancel
            </button>
          ) : null}
          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? 'Creating store...' : 'Create New Store'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AdminStoreForm
