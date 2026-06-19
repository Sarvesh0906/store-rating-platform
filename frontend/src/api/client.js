import axios from 'axios'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

function isAuthRequest(url = '') {
  return url.startsWith('/auth/')
}

export function getApiErrorMessage(error, fallback = 'Request failed') {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.errors?.[0]?.message ||
    error?.message ||
    fallback
  )
}

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('store_rating_token')
  const method = String(config.method || 'GET').toUpperCase()
  const url = config.url || ''

  if (isAuthRequest(url)) {
    console.info(`[API] Request -> ${method} ${url}`)
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

client.interceptors.response.use(
  (response) => {
    const url = response.config?.url || ''
    if (isAuthRequest(url)) {
      console.info(`[API] Response <- ${response.status} ${url}`)
    }

    return response
  },
  (error) => {
    const url = error.config?.url || ''
    const status = error.response?.status || 'NO_STATUS'
    const message = error.response?.data?.message || error.message

    if (isAuthRequest(url)) {
      console.error(`[API] Error <- ${status} ${message}`)
    }

    return Promise.reject(error)
  },
)

export default client
