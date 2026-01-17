import { defineStore } from 'pinia'
import api from '../services/api'

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    notifications: [],
    unreadCount: 0,
    loading: false,
    currentUserId: null
  }),

  getters: {
    unreadNotifications: (state) => {
      return state.notifications.filter(n => !n.read)
    },
    
    hasUnread: (state) => {
      return state.unreadCount > 0
    }
  },

  actions: {
    setCurrentUser(userId) {
      this.currentUserId = userId
    },

    async fetchNotifications(limit = 50, unreadOnly = false) {
      if (!this.currentUserId) {
        console.warn('Cannot fetch notifications: user_id not set')
        return
      }

      this.loading = true
      try {
        const params = {
          user_id: this.currentUserId,
          limit
        }
        if (unreadOnly) {
          params.unread_only = 'true'
        }

        const response = await api.get('/notifications', { params })
        this.notifications = response.data
      } catch (error) {
        console.error('Error fetching notifications:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchUnreadCount() {
      if (!this.currentUserId) {
        return
      }

      try {
        const response = await api.get('/notifications/unread-count', {
          params: { user_id: this.currentUserId }
        })
        this.unreadCount = response.data.count || 0
      } catch (error) {
        console.error('Error fetching unread count:', error)
      }
    },

    async markAsRead(notificationId) {
      try {
        await api.patch(`/notifications/${notificationId}/read`)
        const notification = this.notifications.find(n => n.id === notificationId)
        if (notification) {
          notification.read = true
          if (this.unreadCount > 0) {
            this.unreadCount--
          }
        }
      } catch (error) {
        console.error('Error marking notification as read:', error)
        throw error
      }
    },

    async markAllAsRead() {
      if (!this.currentUserId) {
        return
      }

      try {
        await api.patch('/notifications/mark-all-read', {
          user_id: this.currentUserId
        })
        this.notifications.forEach(n => {
          n.read = true
        })
        this.unreadCount = 0
      } catch (error) {
        console.error('Error marking all notifications as read:', error)
        throw error
      }
    },

    async deleteNotification(notificationId) {
      try {
        await api.delete(`/notifications/${notificationId}`)
        const index = this.notifications.findIndex(n => n.id === notificationId)
        if (index !== -1) {
          const notification = this.notifications[index]
          this.notifications.splice(index, 1)
          // Decrement unread count if notification was unread
          if (!notification.read && this.unreadCount > 0) {
            this.unreadCount--
          }
        }
      } catch (error) {
        console.error('Error deleting notification:', error)
        throw error
      }
    },

    // Poll for new notifications (call this periodically)
    async refreshNotifications() {
      await Promise.all([
        this.fetchNotifications(50, false),
        this.fetchUnreadCount()
      ])
    }
  }
})

