<template>
  <div>
    <button
      @click="openSidebar"
      class="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg transition-colors"
      :class="{ 'text-blue-600': isOpen }"
    >
      <svg
        class="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>
      <span
        v-if="unreadCount > 0"
        class="absolute top-0 right-0 block h-5 w-5 text-xs text-white bg-red-500 rounded-full flex items-center justify-center transform translate-x-1 -translate-y-1"
      >
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </span>
    </button>

    <!-- Sidebar Overlay -->
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
      @click="closeSidebar"
    ></div>

    <!-- Sidebar Panel -->
    <div
      v-if="isOpen"
      class="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out"
      @click.stop
    >
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200 bg-white sticky top-0">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-xl font-semibold text-gray-900">Notifications</h2>
          <div class="flex items-center gap-3">
            <button
              v-if="unreadCount > 0"
              @click="markAllAsRead"
              class="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Mark all read
            </button>
            <button
              @click="closeSidebar"
              class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <!-- Subscription Info -->
        <div class="mt-3 pt-3 border-t border-gray-100">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs text-gray-600">Subscribed to:</span>
            <span class="text-xs font-medium text-gray-900">{{ subscriptionCount || 0 }} objectives</span>
          </div>
          <button
            v-if="subscriptionCount > 0"
            @click="unsubscribeFromAll"
            :disabled="unsubscribing"
            class="w-full mt-2 px-3 py-1.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ unsubscribing ? 'Unsubscribing...' : 'Unsubscribe from all objectives' }}
          </button>
        </div>
      </div>

      <!-- Notifications List -->
      <div class="flex-1 overflow-y-auto">
        <div v-if="loading" class="p-8 text-center text-gray-500">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p class="mt-2">Loading notifications...</p>
        </div>
        <div v-else-if="notifications.length === 0" class="p-8 text-center text-gray-500">
          <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <p class="text-gray-500">No notifications</p>
          <p class="text-sm text-gray-400 mt-1">You're all caught up!</p>
        </div>
        <div v-else class="divide-y divide-gray-200">
          <div
            v-for="notification in notifications"
            :key="notification.id"
            class="px-6 py-4 hover:bg-gray-50 transition-colors"
            :class="{ 'bg-blue-50': !notification.read }"
          >
            <div class="flex items-start gap-3">
              <div class="flex-shrink-0 mt-1">
                <div
                  class="w-2.5 h-2.5 rounded-full"
                  :class="notification.read ? 'bg-transparent' : 'bg-blue-500'"
                ></div>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-2">
                  <div class="flex-1">
                    <p class="text-sm font-semibold text-gray-900">{{ notification.title }}</p>
                    <p class="text-sm text-gray-600 mt-1 leading-relaxed whitespace-pre-wrap">{{ notification.message }}</p>
                    <p class="text-xs text-gray-400 mt-2">{{ formatTime(notification.created_at) }}</p>
                  </div>
                  <button
                    @click.stop="deleteNotification(notification.id)"
                    class="flex-shrink-0 text-gray-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors"
                    title="Delete notification"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div class="flex items-center gap-3 mt-3">
                  <button
                    v-if="!notification.read"
                    @click.stop="markAsRead(notification.id)"
                    class="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Mark as read
                  </button>
                  <button
                    v-if="notification.objective_id"
                    @click.stop="goToObjective(notification.objective_id)"
                    class="text-xs text-primary-600 hover:text-primary-700 font-medium"
                  >
                    View objective →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationsStore } from '@/stores/notifications'
import { useUsersStore } from '@/stores/users'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const router = useRouter()
const notificationsStore = useNotificationsStore()
const usersStore = useUsersStore()
const authStore = useAuthStore()

const isOpen = ref(false)
const loading = ref(false)
const subscriptionCount = ref(null)
const unsubscribing = ref(false)

const notifications = computed(() => notificationsStore.notifications)
const unreadCount = computed(() => notificationsStore.unreadCount)

let refreshInterval = null
let escapeHandler = null

onMounted(async () => {
  // Set current user from auth store
  if (authStore.currentUserId) {
    notificationsStore.setCurrentUser(authStore.currentUserId)
    await loadNotifications()
  } else if (usersStore.users.length > 0) {
    // Fallback to first user if no auth user set
    notificationsStore.setCurrentUser(usersStore.users[0].id)
    await loadNotifications()
  }
  
  // Poll for new notifications every 30 seconds
  refreshInterval = setInterval(async () => {
    if (notificationsStore.currentUserId) {
      await notificationsStore.refreshNotifications()
    }
  }, 30000)
  
  // Handle escape key to close sidebar
  escapeHandler = (e) => {
    if (e.key === 'Escape' && isOpen.value) {
      closeSidebar()
    }
  }
  window.addEventListener('keydown', escapeHandler)
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
  if (escapeHandler) {
    window.removeEventListener('keydown', escapeHandler)
  }
  // Ensure body scroll is restored if component unmounts with sidebar open
  document.body.style.overflow = ''
})

async function loadNotifications() {
  loading.value = true
  try {
    await Promise.all([
      notificationsStore.fetchNotifications(50, false),
      notificationsStore.fetchUnreadCount(),
      loadSubscriptionCount()
    ])
  } catch (error) {
    console.error('Error loading notifications:', error)
  } finally {
    loading.value = false
  }
}

async function loadSubscriptionCount() {
  try {
    const response = await api.get('/objectives/subscriptions/count')
    subscriptionCount.value = response.data.subscription_count || 0
  } catch (error) {
    console.error('Error loading subscription count:', error)
    subscriptionCount.value = null
  }
}

async function unsubscribeFromAll() {
  if (!confirm('Are you sure you want to unsubscribe from all objectives? You will stop receiving notifications for updates.')) {
    return
  }
  
  unsubscribing.value = true
  try {
    await api.delete('/objectives/subscribe/all')
    subscriptionCount.value = 0
    alert('Successfully unsubscribed from all objectives.')
    // Reload notifications to remove subscription-related ones
    await loadNotifications()
  } catch (error) {
    console.error('Error unsubscribing from all:', error)
    alert('Failed to unsubscribe from all objectives. Please try again.')
  } finally {
    unsubscribing.value = false
  }
}

function openSidebar() {
  isOpen.value = true
  if (notifications.value.length === 0) {
    loadNotifications()
  }
  // Prevent body scroll when sidebar is open
  document.body.style.overflow = 'hidden'
}

function closeSidebar() {
  isOpen.value = false
  // Restore body scroll
  document.body.style.overflow = ''
}

async function markAsRead(notificationId) {
  try {
    await notificationsStore.markAsRead(notificationId)
  } catch (error) {
    console.error('Error marking notification as read:', error)
  }
}

async function deleteNotification(notificationId) {
  try {
    await notificationsStore.deleteNotification(notificationId)
  } catch (error) {
    console.error('Error deleting notification:', error)
    alert('Failed to delete notification. Please try again.')
  }
}

async function markAllAsRead() {
  try {
    await notificationsStore.markAllAsRead()
  } catch (error) {
    console.error('Error marking all as read:', error)
  }
}

function goToObjective(objectiveId) {
  closeSidebar()
  router.push(`/objectives/${objectiveId}`)
}

function formatTime(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  
  return date.toLocaleDateString()
}

</script>

