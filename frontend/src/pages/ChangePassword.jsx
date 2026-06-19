import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const initialState = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
}

function ChangePassword() {
  const [form, setForm] = useState(initialState)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const { changePassword, logout } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (form.newPassword !== form.confirmPassword) {
      setError('New password and confirmation do not match')
      return
    }

    setLoading(true)

    try {
      await changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      })
      setSuccess('Password updated successfully. Please log in again.')
      setForm(initialState)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      await logout()
      navigate('/login', { replace: true })
    } catch (err) {
      setError(
        err.response?.data?.errors?.[0]?.message ||
          err.response?.data?.message ||
          'Unable to change password right now',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="auth-card">
      <div className="auth-intro">
        <p className="eyebrow">Account Security</p>
        <h1>Change password</h1>
        <p className="lede">Use your current password, then choose a new one that matches the platform password rules.</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          Current password
          <input
            type="password"
            value={form.currentPassword}
            onChange={(event) => setForm((current) => ({ ...current, currentPassword: event.target.value }))}
            minLength={8}
            maxLength={16}
            required
          />
        </label>

        <label>
          New password
          <input
            type="password"
            value={form.newPassword}
            onChange={(event) => setForm((current) => ({ ...current, newPassword: event.target.value }))}
            placeholder="8 to 16 characters, with one uppercase letter and one special character"
            minLength={8}
            maxLength={16}
            pattern="^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$"
            title="8-16 characters, including at least one uppercase letter and one special character"
            required
          />
        </label>

        <label>
          Confirm new password
          <input
            type="password"
            value={form.confirmPassword}
            onChange={(event) => setForm((current) => ({ ...current, confirmPassword: event.target.value }))}
            required
          />
        </label>

        {error ? <p className="error-banner">{error}</p> : null}
        {success ? <p className="success-banner">{success}</p> : null}

        <button type="submit" className="primary-button" disabled={loading}>
          {loading ? 'Updating password...' : 'Save new password'}
        </button>
      </form>
    </section>
  )
}

export default ChangePassword
