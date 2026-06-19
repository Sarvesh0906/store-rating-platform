import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createAdminUser } from '../api/admin'

const initialState = {
  name: '',
  email: '',
  password: '',
  address: '',
  role: 'NORMAL_USER',
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

function AdminUserForm({ embedded = false, onCancel, onSuccess, successRedirectTo }) {
  const [form, setForm] = useState(initialState)
  const [fieldErrors, setFieldErrors] = useState({})
  const [generalError, setGeneralError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(event) {
    event.preventDefault()
    setFieldErrors({})
    setGeneralError('')
    setLoading(true)

    try {
      const response = await createAdminUser(form)
      if (onSuccess) {
        await onSuccess(response.data.user)
        return
      }

      navigate(successRedirectTo || '/users', { replace: true })
    } catch (err) {
      const errors = err.response?.data?.errors
      if (Array.isArray(errors)) {
        setFieldErrors(mapErrors(errors))
      } else {
        setGeneralError(err.response?.data?.message || 'Unable to create user')
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
            <p className="eyebrow">Add New User</p>
            <h2>Create a new platform user</h2>
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
            minLength={20}
            maxLength={60}
            placeholder="20 to 60 characters"
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
            required
          />
          {fieldErrors.email ? <span className="field-error">{fieldErrors.email}</span> : null}
        </label>

        <label>
          Password
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            minLength={8}
            maxLength={16}
            pattern="^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$"
            title="8-16 characters, including at least one uppercase letter and one special character"
            placeholder="8 to 16 characters, with one uppercase letter and one special character"
            required
          />
          {fieldErrors.password ? <span className="field-error">{fieldErrors.password}</span> : null}
        </label>

        <label>
          Address
          <textarea
            value={form.address}
            onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))}
            maxLength={400}
            placeholder="Up to 400 characters"
            rows={4}
            required
          />
          {fieldErrors.address ? <span className="field-error">{fieldErrors.address}</span> : null}
        </label>

        <label>
          Role
          <select value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}>
            <option value="NORMAL_USER">Normal user</option>
            <option value="SYSTEM_ADMIN">System admin</option>
            <option value="STORE_OWNER">Store owner</option>
          </select>
          {fieldErrors.role ? <span className="field-error">{fieldErrors.role}</span> : null}
        </label>

        {generalError ? <p className="error-banner">{generalError}</p> : null}

        <div className="button-row">
          {embedded ? (
            <button type="button" className="secondary-button" onClick={onCancel}>
              Cancel
            </button>
          ) : null}
          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? 'Creating user...' : 'Create New User'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AdminUserForm
