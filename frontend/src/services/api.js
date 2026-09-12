import axios from 'axios'

const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
const BASE_URL = import.meta.env.VITE_API_URL || (isLocal ? '/api' : 'https://mediai-1-dfc2.onrender.com/api')

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('medi_access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      resolve(token)
    }
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    if (!error.response) return Promise.reject(error)

    if (error.response.status === 401 && !original._retry && !original.url.includes('/auth/login')) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`
          return api(original)
        })
      }

      original._retry = true
      isRefreshing = true

      const refreshToken = localStorage.getItem('medi_refresh_token')
      if (!refreshToken) {
        isRefreshing = false
        return Promise.reject(error)
      }

      try {
        const res = await axios.post('/api/auth/token/refresh/', { refresh: refreshToken })
        const newToken = res.data.access
        localStorage.setItem('medi_access_token', newToken)
        processQueue(null, newToken)
        original.headers.Authorization = `Bearer ${newToken}`
        isRefreshing = false
        return api(original)
      } catch (refreshErr) {
        processQueue(refreshErr, null)
        localStorage.removeItem('medi_access_token')
        localStorage.removeItem('medi_refresh_token')
        localStorage.removeItem('medi_user')
        window.location.href = '/login'
        isRefreshing = false
        return Promise.reject(refreshErr)
      }
    }
    return Promise.reject(error)
  }
)

export default api
