import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../api/client'
import { useAuth } from '../hooks/useAuth'
import { getDashboardPath } from '../utils/navigation'

const initialState = {
  name: '',
  email: '',
  password: '',
  address: '',
}

function Signup() {
  const [form, setForm] = useState(initialState)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signup } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      console.info('[SIGNUP] Sending payload', {
        nameLength: form.name.trim().length,
        email: form.email.trim().toLowerCase(),
        addressLength: form.address.trim().length,
        password: '[masked]',
      })
      const nextUser = await signup(form)
      console.info('[SIGNUP] Response received')
      navigate(getDashboardPath(nextUser?.role), { replace: true })
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to create account right now'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="auth-card">
      <div className="auth-intro">
        <p className="eyebrow">User Signup</p>
        <h1>Create a new user account.</h1>
        <p className="lede">Normal users can browse stores, submit ratings from 1 to 5, and edit their own submitted rating.</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          Full name
          <input
            type="text"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            placeholder="20 to 60 characters"
            minLength={20}
            maxLength={60}
            required
          />
        </label>

        <label>
          Email
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            placeholder="you@example.com"
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            placeholder="8 to 16 characters, with one uppercase letter and one special character"
            minLength={8}
            maxLength={16}
            pattern="^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$"
            title="8-16 characters, including at least one uppercase letter and one special character"
            required
          />
        </label>

        <label>
          Address
          <textarea
            value={form.address}
            onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))}
            placeholder="Registered store address or home address"
            maxLength={400}
            rows={4}
            required
          />
        </label>

        {error ? <p className="error-banner">{error}</p> : null}

        <button type="submit" className="primary-button" disabled={loading}>
          {loading ? 'Creating account...' : 'Create new user account'}
        </button>

        <p className="form-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </section>
  )
}

export default Signup
