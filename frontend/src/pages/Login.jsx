import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getDashboardPath } from '../utils/navigation'

const initialState = {
  email: '',
  password: '',
}

function Login() {
  const [form, setForm] = useState(initialState)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, user } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      console.info('[LOGIN] Attempt with email:', form.email.trim().toLowerCase())
      const nextUser = await login(form)
      console.info('[LOGIN] Response success', {
        userId: nextUser?.id,
        role: nextUser?.role,
      })
      navigate(getDashboardPath(nextUser?.role), { replace: true })
    } catch (err) {
      console.error('[LOGIN] Error message from backend:', err.response?.data?.message || err.message)
      setError(
        err.response?.data?.errors?.[0]?.message ||
          err.response?.data?.message ||
          'Unable to log in right now',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="auth-card">
      <div className="auth-intro">
        <p className="eyebrow">Shared Sign In</p>
        <h1>Log in to the store rating platform.</h1>
        <p className="lede">Use one account to access the correct view for a system administrator, new user, or store owner.</p>
        {user ? <p className="inline-note">Already signed in as {user.name}.</p> : null}
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
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

        {error ? <p className="error-banner">{error}</p> : null}

        <button type="submit" className="primary-button" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in to Platform'}
        </button>

        <p className="form-footer">
          New user? <Link to="/signup">Create a new user account</Link>
        </p>
      </form>
    </section>
  )
}

export default Login
