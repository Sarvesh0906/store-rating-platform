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

export async function fetchStores(params) {
  const { data } = await client.get(`/stores${toQueryString(params)}`)
  return data
}

export async function fetchStore(storeId) {
  const { data } = await client.get(`/stores/${storeId}`)
  return data
}

export async function submitRating(storeId, payload) {
  const { data } = await client.post(`/stores/${storeId}/ratings`, payload)
  return data
}

export async function updateRating(storeId, payload) {
  const { data } = await client.put(`/stores/${storeId}/ratings`, payload)
  return data
}
