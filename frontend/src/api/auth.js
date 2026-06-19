import client from './client'

export async function signup(payload) {
  return client.post('/auth/signup', payload)
}

export async function login(payload) {
  return client.post('/auth/login', payload)
}

export async function logout() {
  delete client.defaults.headers.common.Authorization
  return client.post('/auth/logout')
}

export async function fetchCurrentUser() {
  return client.get('/auth/me')
}

export async function changePassword(payload) {
  return client.put('/auth/change-password', payload)
}

export async function fetchHealth() {
  return client.get('/health')
}
