import { defineStore } from 'pinia'
import api from '../services/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null,
    currentUser: null,
    loading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => {
      return state.token !== null && state.currentUser !== null
    },
    currentUserId: (state) => {
      return state.currentUser?.id || null
    },
    organizationId: (state) => {
      return state.currentUser?.organizationId || null
    }
  },

  actions: {
    setToken(token) {
      this.token = token
      if (token) {
        localStorage.setItem('authToken', token)
        // Set token in axios default headers
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      } else {
        localStorage.removeItem('authToken')
        delete api.defaults.headers.common['Authorization']
      }
    },

    setCurrentUser(user) {
      this.currentUser = user
      if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user))
      } else {
        localStorage.removeItem('currentUser')
      }
    },

    async login(email, password) {
      this.loading = true
      this.error = null
      try {
        const response = await api.post('/auth/login', { email, password })
        const { token, user } = response.data
        
        this.setToken(token)
        this.setCurrentUser(user)
        
        return { success: true }
      } catch (error) {
        this.error = error.response?.data?.error || 'Login failed'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async register(email, password, name, organizationName) {
      this.loading = true
      this.error = null
      try {
        const response = await api.post('/auth/register', {
          email,
          password,
          name,
          organizationName
        })
        
        return { 
          success: true, 
          message: response.data.message,
          userId: response.data.userId,
          emailVerified: response.data.emailVerified
        }
      } catch (error) {
        this.error = error.response?.data?.error || 'Registration failed'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async verifyEmail(token) {
      this.loading = true
      this.error = null
      try {
        await api.post('/auth/verify-email', { token })
        return { success: true }
      } catch (error) {
        this.error = error.response?.data?.error || 'Email verification failed'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async resendVerification(email) {
      this.loading = true
      this.error = null
      try {
        await api.post('/auth/resend-verification', { email })
        return { success: true }
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to resend verification email'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async forgotPassword(email) {
      this.loading = true
      this.error = null
      try {
        await api.post('/auth/forgot-password', { email })
        return { success: true }
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to send password reset email'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async resetPassword(token, password) {
      this.loading = true
      this.error = null
      try {
        await api.post('/auth/reset-password', { token, password })
        return { success: true }
      } catch (error) {
        this.error = error.response?.data?.error || 'Password reset failed'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async fetchCurrentUser() {
      try {
        const response = await api.get('/auth/me')
        this.setCurrentUser(response.data)
        return response.data
      } catch (error) {
        // If token is invalid, clear auth
        if (error.response?.status === 401) {
          this.logout()
        }
        throw error
      }
    },

    async loginWithGoogle(redirectPath = '/') {
      this.loading = true
      this.error = null
      try {
        // Store redirect path in sessionStorage
        sessionStorage.setItem('googleOAuthRedirect', redirectPath)
        
        // Get the redirect URI from current window location
        const redirectUri = `${window.location.origin}/auth/google/callback`
        console.log('Frontend redirect URI:', redirectUri)
        
        // Get Google OAuth URL from backend, passing the redirect URI
        const response = await api.get('/auth/google', {
          params: { 
            redirect: redirectPath,
            redirectUri: redirectUri
          }
        })
        
        const { authUrl, redirectUri: backendRedirectUri } = response.data
        console.log('Backend redirect URI:', backendRedirectUri)
        console.log('Auth URL:', authUrl)
        
        // Log warning if redirect URIs don't match
        if (redirectUri !== backendRedirectUri) {
          console.warn('⚠️ Redirect URI mismatch!')
          console.warn('Frontend:', redirectUri)
          console.warn('Backend:', backendRedirectUri)
          console.warn('Make sure this matches exactly in Google Cloud Console')
        }
        
        // Redirect to Google OAuth
        window.location.href = authUrl
        
        // Return pending state (will be handled by callback page)
        return { success: true, pending: true }
      } catch (error) {
        this.error = error.response?.data?.error || 'Google sign-in failed'
        this.loading = false
        return { success: false, error: this.error }
      }
    },

    async exchangeGoogleCode(code) {
      try {
        // Get the redirect URI from the current window location
        const redirectUri = `${window.location.origin}/auth/google/callback`
        console.log('Exchanging code with redirect URI:', redirectUri)
        
        const response = await api.post('/auth/google/callback', { 
          code,
          redirectUri 
        })
        const { token, user } = response.data
        
        this.setToken(token)
        this.setCurrentUser(user)
        
        return { success: true }
      } catch (error) {
        console.error('Exchange error:', error.response?.data)
        this.error = error.response?.data?.error || 'Failed to complete Google sign-in'
        return { success: false, error: this.error }
      }
    },

    async logout() {
      try {
        if (this.token) {
          await api.post('/auth/logout')
        }
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        this.setToken(null)
        this.setCurrentUser(null)
        this.error = null
      }
    },

    loadFromStorage() {
      // Load token and user from localStorage on app start
      const token = localStorage.getItem('authToken')
      const userStr = localStorage.getItem('currentUser')
      
      if (token) {
        this.setToken(token)
      }
      
      if (userStr) {
        try {
          const user = JSON.parse(userStr)
          this.setCurrentUser(user)
        } catch (error) {
          console.error('Error parsing stored user:', error)
          localStorage.removeItem('currentUser')
        }
      }
      
      // If we have a token, try to fetch current user to verify it's still valid
      if (token && userStr) {
        this.fetchCurrentUser().catch(() => {
          // Token is invalid, clear everything
          this.logout()
        })
      }
    }
  }
})

