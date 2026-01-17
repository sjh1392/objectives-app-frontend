import { defineStore } from 'pinia'
import api from '../services/api'

export const useObjectivesStore = defineStore('objectives', {
  state: () => ({
    objectives: [],
    currentObjective: null,
    tags: [],
    loading: false,
    filters: {
      status: null,
      tag: null,
      search: null,
      owner_id: null,
      department_id: null
    },
    stats: null
  }),

  getters: {
    filteredObjectives: (state) => {
      // Early return if no filters are active - avoid unnecessary array copying and filtering
      const hasFilters = state.filters.status || 
                        state.filters.tag || 
                        state.filters.owner_id || 
                        state.filters.department_id
      
      // Search filter is always handled server-side via fetchObjectives(), so we skip it here
      // If no other filters are active, return objectives directly (no copy needed when unfiltered)
      if (!hasFilters) {
        return state.objectives
      }

      // Only perform filtering when filters are actually active
      let filtered = state.objectives

      if (state.filters.status) {
        filtered = filtered.filter(obj => obj.status === state.filters.status)
      }

      if (state.filters.tag) {
        filtered = filtered.filter(obj => 
          obj.tags && obj.tags.includes(state.filters.tag)
        )
      }

      if (state.filters.owner_id) {
        filtered = filtered.filter(obj => obj.owner_id === state.filters.owner_id)
      }

      if (state.filters.department_id) {
        filtered = filtered.filter(obj => obj.department_id === state.filters.department_id)
      }

      return filtered
    },

    objectivesByTag: (state) => {
      const grouped = {}
      state.objectives.forEach(obj => {
        if (obj.tags && obj.tags.length > 0) {
          obj.tags.forEach(tag => {
            if (!grouped[tag]) {
              grouped[tag] = []
            }
            grouped[tag].push(obj)
          })
        }
      })
      return grouped
    }
  },

  actions: {
    async fetchObjectives() {
      this.loading = true
      try {
        const params = {}
        if (this.filters.status) params.status = this.filters.status
        if (this.filters.tag) params.tag = this.filters.tag
        if (this.filters.search) params.search = this.filters.search
        if (this.filters.owner_id) params.owner_id = this.filters.owner_id
        if (this.filters.department_id) params.department_id = this.filters.department_id

        const response = await api.get('/objectives', { params })
        this.objectives = response.data
      } catch (error) {
        console.error('Error fetching objectives:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchObjective(id) {
      this.loading = true
      try {
        const response = await api.get(`/objectives/${id}`)
        this.currentObjective = response.data
        return response.data
      } catch (error) {
        console.error('Error fetching objective:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async createObjective(objectiveData) {
      try {
        const response = await api.post('/objectives', objectiveData)
        this.objectives.unshift(response.data)
        return response.data
      } catch (error) {
        console.error('Error creating objective:', error)
        throw error
      }
    },

    async updateObjective(id, objectiveData) {
      try {
        const response = await api.put(`/objectives/${id}`, objectiveData)
        const index = this.objectives.findIndex(obj => obj.id === id)
        if (index !== -1) {
          this.objectives[index] = response.data
        }
        if (this.currentObjective && this.currentObjective.id === id) {
          this.currentObjective = response.data
        }
        return response.data
      } catch (error) {
        console.error('Error updating objective:', error)
        throw error
      }
    },

    async deleteObjective(id) {
      try {
        await api.delete(`/objectives/${id}`)
        this.objectives = this.objectives.filter(obj => obj.id !== id)
        if (this.currentObjective && this.currentObjective.id === id) {
          this.currentObjective = null
        }
      } catch (error) {
        console.error('Error deleting objective:', error)
        throw error
      }
    },

    async updateProgress(id, currentValue, notes) {
      try {
        const response = await api.patch(`/objectives/${id}/progress`, {
          current_value: currentValue,
          notes
        })
        const index = this.objectives.findIndex(obj => obj.id === id)
        if (index !== -1) {
          this.objectives[index] = response.data
        }
        if (this.currentObjective && this.currentObjective.id === id) {
          this.currentObjective = response.data
        }
        return response.data
      } catch (error) {
        console.error('Error updating progress:', error)
        throw error
      }
    },

    async fetchTags() {
      try {
        const response = await api.get('/tags')
        this.tags = response.data
        return response.data
      } catch (error) {
        console.error('Error fetching tags:', error)
        throw error
      }
    },

    async fetchStats() {
      try {
        const response = await api.get('/dashboard/stats')
        this.stats = response.data
        return response.data
      } catch (error) {
        console.error('Error fetching stats:', error)
        throw error
      }
    },

    async getTagStats(tag) {
      try {
        const response = await api.get(`/tags/${tag}/stats`)
        return response.data
      } catch (error) {
        console.error('Error fetching tag stats:', error)
        throw error
      }
    },

    setFilter(filterType, value) {
      this.filters[filterType] = value
    },

    clearFilters() {
      this.filters = {
        status: null,
        tag: null,
        search: null,
        owner_id: null,
        department_id: null
      }
    }
  }
})

