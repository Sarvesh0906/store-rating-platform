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

export async function fetchAdminDashboard() {
  const { data } = await client.get('/admin/dashboard')
  return data
}

export async function fetchAdminUsers(params) {
  const { data } = await client.get(`/admin/users${toQueryString(params)}`)
  return data
}

export async function fetchAdminStores(params) {
  const { data } = await client.get(`/admin/stores${toQueryString(params)}`)
  return data
}

export async function fetchAdminUserDetail(id) {
  const { data } = await client.get(`/admin/users/${id}`)
  return data
}

export async function createAdminUser(payload) {
  const { data } = await client.post('/admin/users', payload)
  return data
}

export async function createAdminStore(payload) {
  const { data } = await client.post('/admin/stores', payload)
  return data
}
