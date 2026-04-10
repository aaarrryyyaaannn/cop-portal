const API_BASE = import.meta.env.VITE_API_URL || '/api'

function getToken() {
  return localStorage.getItem('fir_token')
}

function setToken(token) {
  if (token) localStorage.setItem('fir_token', token)
  else localStorage.removeItem('fir_token')
}

async function request(url, options = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers
  }
  const res = await fetch(`${API_BASE}${url}`, { ...options, headers })
  if (res.status === 401) {
    setToken(null)
    throw new Error('Session expired. Please login again.')
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || 'Request failed')
  return data
}

export const api = {
  async login(username, password) {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    })
    setToken(data.token)
    return data
  },

  logout() {
    setToken(null)
  },

  async getMe() {
    return request('/auth/me')
  },

  async getFirs(params = {}) {
    const q = new URLSearchParams(params).toString()
    return request(`/firs${q ? '?' + q : ''}`)
  },

  async getFir(id) {
    return request(`/firs/${id}`)
  },

  async trackFir(firNumber) {
    return request(`/firs/track/${encodeURIComponent(firNumber)}`)
  },

  async createFir(firData) {
    return request('/firs', {
      method: 'POST',
      body: JSON.stringify(firData)
    })
  },

  async updateFirStatus(id, status) {
    return request(`/firs/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    })
  },

  async assignFir(id, officerId) {
    return request(`/firs/${id}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ officerId })
    })
  },

  async getUsers() {
    return request('/users')
  },

  async createUser(userData) {
    return request('/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    })
  },

  async deleteUser(id) {
    return request(`/users/${id}`, { method: 'DELETE' })
  },

  async resetPassword(id, newPassword) {
    return request(`/users/${id}/reset-password`, {
      method: 'PATCH',
      body: JSON.stringify({ newPassword })
    })
  },

  async getEvidence(firId) {
    return request(`/evidence${firId ? '?firId=' + firId : ''}`)
  },

  async uploadEvidence(firId, file) {
    const formData = new FormData()
    formData.append('firId', firId)
    formData.append('file', file)
    const token = getToken()
    const res = await fetch(`${API_BASE}/evidence/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.message || 'Upload failed')
    return data
  },

  async getReports() {
    return request('/reports/stats')
  },

  async getWorkforce() { return request('/workforce') },
  async getWorkforceTasks() { return request('/workforce/tasks') },
  async createWorkforceTask(taskData) {
    return request('/workforce/tasks', { method: 'POST', body: JSON.stringify(taskData) })
  },
  async updateWorkforceTask(id, status) {
    return request(`/workforce/tasks/${id}`, { method: 'PUT', body: JSON.stringify({ status }) })
  },
  async getAlerts() { return request('/alerts') },
  async createAlert(alertData) {
    return request('/alerts', { method: 'POST', body: JSON.stringify(alertData) })
  },
  async getCrimeHotspots() { return request('/firs/data/hotspots') },
  async getCriminals() { return request('/criminals') },
  async createCriminal(criminalData) {
    return request('/criminals', { method: 'POST', body: JSON.stringify(criminalData) })
  }
}

export { getToken, setToken }
