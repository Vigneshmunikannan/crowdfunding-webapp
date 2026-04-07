import api from './api'

export async function fetchCompanies() {
  const { data } = await api.get('/company')
  return data
}

/**
 * @param {{ name: string; description?: string; contactEmail: string }} payload
 */
export async function createCompany(payload) {
  const { data } = await api.post('/company', payload)
  return data
}

/**
 * @param {string} id
 * @param {{ name?: string; description?: string; contactEmail?: string }} payload
 */
export async function updateCompany(id, payload) {
  const { data } = await api.put(`/company/${id}`, payload)
  return data
}

export async function deleteCompany(id) {
  const { data } = await api.delete(`/company/${id}`)
  return data
}
