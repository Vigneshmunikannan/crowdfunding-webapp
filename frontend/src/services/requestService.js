import api from './api'

export async function fetchAllRequests() {
  const { data } = await api.get('/request')
  return data
}

/** Logged-in donor only — GET /request/my */
export async function fetchMyRequests() {
  const { data } = await api.get('/request/my')
  return data
}

/**
 * @param {{ title: string; description?: string; amount: number; companyId?: string; campaignId?: string }} payload
 */
export async function createFundingRequest(payload) {
  const { data } = await api.post('/request', payload)
  return data
}

/**
 * @param {string} id
 * @param {'approved' | 'rejected'} status
 */
export async function updateRequestStatus(id, status) {
  const { data } = await api.patch(`/request/${id}`, { status })
  return data
}

export async function deleteRequest(id) {
  const { data } = await api.delete(`/request/${id}`)
  return data
}
