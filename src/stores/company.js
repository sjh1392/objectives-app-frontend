import { defineStore } from 'pinia'
import api from '../services/api'

export const useCompanyStore = defineStore('company', {
  state: () => ({
    name: null,
    logoUrl: null,
    loading: false
  }),

  getters: {
    hasCompanyData: (state) => {
      return state.name !== null || state.logoUrl !== null
    }
  },

  actions: {
    setCompanyData(data) {
      if (data) {
        this.name = data.name || null
        this.logoUrl = data.logo_url || null
        
        // Persist to localStorage
        if (data.name || data.logo_url) {
          localStorage.setItem('companyData', JSON.stringify({
            name: this.name,
            logoUrl: this.logoUrl
          }))
        }
        
        // Update page title
        if (this.name) {
          document.title = `${this.name} - Objectives Management`
        } else {
          document.title = 'Objectives Management'
        }
      }
    },

    async fetchCompanyData() {
      // If we already have data, don't fetch again
      if (this.hasCompanyData && !this.loading) {
        return { name: this.name, logo_url: this.logoUrl }
      }

      this.loading = true
      try {
        const response = await api.get('/company')
        if (response.data) {
          this.setCompanyData(response.data)
          return response.data
        }
      } catch (error) {
        console.error('Error loading company data:', error)
        // Don't throw - just return null so app can continue
        return null
      } finally {
        this.loading = false
      }
    },

    loadFromStorage() {
      // Load company data from localStorage on app start
      const stored = localStorage.getItem('companyData')
      if (stored) {
        try {
          const data = JSON.parse(stored)
          this.name = data.name || null
          this.logoUrl = data.logoUrl || null
          
          // Update page title
          if (this.name) {
            document.title = `${this.name} - Objectives Management`
          }
        } catch (error) {
          console.error('Error parsing stored company data:', error)
          localStorage.removeItem('companyData')
        }
      }
    },

    clearCompanyData() {
      this.name = null
      this.logoUrl = null
      localStorage.removeItem('companyData')
      document.title = 'Objectives Management'
    }
  }
})

