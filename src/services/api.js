import axios from 'axios'

// Use environment variable for API URL, fallback to '/api' for development proxy
const apiBaseURL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: apiBaseURL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // 10 second timeout to prevent hanging requests
})

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor to handle network errors and auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      error.message = 'Request timeout - please check your connection'
    } else if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      error.message = 'Network error - please check if the backend server is running'
    } else if (error.response?.status === 401) {
      // Unauthorized - clear auth and redirect to login
      localStorage.removeItem('authToken')
      localStorage.removeItem('currentUser')
      delete api.defaults.headers.common['Authorization']
      
      // Only redirect if we're not already on the login page
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api

