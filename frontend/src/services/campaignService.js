import api from './api'

/** Public — open opportunities only */
export async function fetchOpenCampaigns() {
  const { data } = await api.get('/campaign')
  return data
}

/** Admin — all opportunities */
export async function fetchCampaignsAdmin() {
  const { data } = await api.get('/campaign/admin')
  return data
}

/** Public — single open opportunity (for donor submit flow) */
export async function fetchCampaign(id) {
  const { data } = await api.get(`/campaign/${id}`)
  return data
}

/**
 * @param {{ companyId: string; title: string; description?: string; goalAmount: number }} payload
 */
export async function createCampaign(payload) {
  const { data } = await api.post('/campaign', payload)
  return data
}

/**
 * @param {string} id
 * @param {{ title?: string; description?: string; goalAmount?: number; status?: 'open' | 'closed'; companyId?: string }} payload
 */
export async function updateCampaign(id, payload) {
  const { data } = await api.put(`/campaign/${id}`, payload)
  return data
}

export async function deleteCampaign(id) {
  const { data } = await api.delete(`/campaign/${id}`)
  return data
}
