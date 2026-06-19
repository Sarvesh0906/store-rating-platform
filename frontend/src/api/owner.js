import client from './client'

function toQueryString(params = {}) {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return
    }

    searchParams.set(key, String(value))
  })

  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

export async function fetchOwnerDashboard(params) {
  const { data } = await client.get(`/owner/dashboard${toQueryString(params)}`)
  return data
}
