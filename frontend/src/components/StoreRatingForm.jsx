import { useEffect, useState } from 'react'

function mapErrors(apiErrors) {
  const next = {}
  apiErrors.forEach((item) => {
    if (item?.path) {
      next[item.path] = item.message
    }
  })
  return next
}

function StoreRatingForm({ store, initialRating = '', actionLabel, onSubmit, onSuccess, loading }) {
  const [rating, setRating] = useState(initialRating)
  const [fieldErrors, setFieldErrors] = useState({})
  const [generalError, setGeneralError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    setRating(initialRating)
  }, [initialRating])

  async function handleSubmit(event) {
    event.preventDefault()
    setFieldErrors({})
    setGeneralError('')
    setSuccess('')

    try {
      await onSubmit({ rating_value: rating })
      setSuccess('Rating saved successfully')
      onSuccess?.()
    } catch (err) {
      const errors = err.response?.data?.errors
      if (Array.isArray(errors)) {
        setFieldErrors(mapErrors(errors))
      } else {
        setGeneralError(err.response?.data?.message || 'Unable to save rating')
      }
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="feature-card">
        <h2>{store.name}</h2>
        <p>{store.address}</p>
        <p>
          Overall Store Rating: <strong>{store.overall_rating}</strong>
        </p>
        <p>
          Your Submitted Rating: <strong>{store.user_rating ?? 'Not submitted yet'}</strong>
        </p>
      </div>

      <label>
        Rating (1 to 5)
        <input
          type="number"
          min="1"
          max="5"
          value={rating}
          onChange={(event) => setRating(event.target.value)}
          placeholder="1 to 5"
          required
        />
        {fieldErrors.rating_value ? <span className="field-error">{fieldErrors.rating_value}</span> : null}
      </label>

      {generalError ? <p className="error-banner">{generalError}</p> : null}
      {success ? <p className="success-banner">{success}</p> : null}

      <button type="submit" className="primary-button" disabled={loading}>
        {loading ? 'Saving rating...' : actionLabel}
      </button>
    </form>
  )
}

export default StoreRatingForm
