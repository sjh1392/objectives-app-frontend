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

// Add response interceptor to handle network errors more gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      error.message = 'Request timeout - please check your connection'
    } else if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      error.message = 'Network error - please check if the backend server is running'
    }
    return Promise.reject(error)
  }
)

export default api

