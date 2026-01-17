import { defineStore } from 'pinia'
import api from '../services/api'

export const useUsersStore = defineStore('users', {
  state: () => ({
    users: [],
    departments: [],
    loading: false
  }),

  getters: {
    usersByDepartment: (state) => {
      const grouped = {}
      state.users.forEach(user => {
        const deptId = user.department || 'unassigned'
        if (!grouped[deptId]) {
          grouped[deptId] = []
        }
        grouped[deptId].push(user)
      })
      return grouped
    }
  },

  actions: {
    async fetchUsers() {
      // Don't fetch if already loading
      if (this.loading) {
        return this.users
      }
      
      // If we already have users, return them immediately (optional optimization)
      // Commented out to always fetch fresh data, but can be enabled if needed
      // if (this.users.length > 0) {
      //   return this.users
      // }
      
      this.loading = true
      try {
        const response = await api.get('/users')
        this.users = response.data
        return response.data
      } catch (error) {
        console.error('Error fetching users:', error)
        // Don't throw - let caller handle gracefully
        // Just return existing users or empty array so app can continue
        return this.users.length > 0 ? this.users : []
      } finally {
        this.loading = false
      }
    },

    async fetchUser(id) {
      try {
        const response = await api.get(`/users/${id}`)
        return response.data
      } catch (error) {
        console.error('Error fetching user:', error)
        throw error
      }
    },

    async createUser(userData) {
      try {
        const response = await api.post('/users', userData)
        this.users.push(response.data)
        return response.data
      } catch (error) {
        console.error('Error creating user:', error)
        throw error
      }
    },

    async updateUser(id, userData) {
      try {
        const response = await api.put(`/users/${id}`, userData)
        const index = this.users.findIndex(user => user.id === id)
        if (index !== -1) {
          this.users[index] = response.data
        }
        return response.data
      } catch (error) {
        console.error('Error updating user:', error)
        throw error
      }
    },

    async deleteUser(id) {
      try {
        await api.delete(`/users/${id}`)
        this.users = this.users.filter(user => user.id !== id)
      } catch (error) {
        console.error('Error deleting user:', error)
        throw error
      }
    },

    async fetchDepartments() {
      try {
        const response = await api.get('/departments')
        this.departments = response.data
        return response.data
      } catch (error) {
        console.error('Error fetching departments:', error)
        throw error
      }
    },

    async fetchDepartment(id) {
      try {
        const response = await api.get(`/departments/${id}`)
        return response.data
      } catch (error) {
        console.error('Error fetching department:', error)
        throw error
      }
    },

    async createDepartment(departmentData) {
      try {
        const response = await api.post('/departments', departmentData)
        this.departments.push(response.data)
        return response.data
      } catch (error) {
        console.error('Error creating department:', error)
        throw error
      }
    },

    async updateDepartment(id, departmentData) {
      try {
        const response = await api.put(`/departments/${id}`, departmentData)
        const index = this.departments.findIndex(dept => dept.id === id)
        if (index !== -1) {
          this.departments[index] = response.data
        }
        return response.data
      } catch (error) {
        console.error('Error updating department:', error)
        throw error
      }
    },

    async deleteDepartment(id) {
      try {
        await api.delete(`/departments/${id}`)
        this.departments = this.departments.filter(dept => dept.id !== id)
        // Also update users who were in this department
        this.users.forEach(user => {
          if (user.department === id) {
            user.department = null
          }
        })
      } catch (error) {
        console.error('Error deleting department:', error)
        throw error
      }
    },

    getUserById(id) {
      return this.users.find(user => user.id === id)
    },

    getDepartmentById(id) {
      return this.departments.find(dept => dept.id === id)
    }
  }
})

