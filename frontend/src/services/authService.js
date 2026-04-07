import api from './api'

/**
 * @param {{ email: string; password: string }} credentials
 */
export async function login(credentials) {
  const { data } = await api.post('/auth/login', credentials)
  return data
}

/**
 * @param {{ name: string; email: string; password: string; role?: 'admin' | 'donor' }} payload
 */
export async function register(payload) {
  const { data } = await api.post('/auth/register', payload)
  return data
}
