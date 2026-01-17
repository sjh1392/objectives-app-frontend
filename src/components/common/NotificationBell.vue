<template>
  <div class="relative">
    <button
      @click="toggleDropdown"
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

    <!-- Dropdown -->
    <div
      v-if="isOpen"
      v-click-outside="closeDropdown"
      class="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden flex flex-col"
    >
      <!-- Header -->
      <div class="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">Notifications</h3>
        <div class="flex items-center gap-2">
          <button
            v-if="unreadCount > 0"
            @click="markAllAsRead"
            class="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Mark all read
          </button>
          <button
            @click="closeDropdown"
            class="text-gray-400 hover:text-gray-600"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Notifications List -->
      <div class="overflow-y-auto flex-1">
        <div v-if="loading" class="p-4 text-center text-gray-500">
          Loading...
        </div>
        <div v-else-if="notifications.length === 0" class="p-8 text-center text-gray-500">
          <svg class="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <p>No notifications</p>
        </div>
        <div v-else class="divide-y divide-gray-100">
          <button
            v-for="notification in notifications"
            :key="notification.id"
            @click="handleNotificationClick(notification)"
            class="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
            :class="{ 'bg-blue-50': !notification.read }"
          >
            <div class="flex items-start gap-3">
              <div class="flex-shrink-0 mt-1">
                <div
                  class="w-2 h-2 rounded-full"
                  :class="notification.read ? 'bg-transparent' : 'bg-blue-500'"
                ></div>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900">{{ notification.title }}</p>
                <p class="text-sm text-gray-600 mt-1">{{ notification.message }}</p>
                <p class="text-xs text-gray-400 mt-1">{{ formatTime(notification.created_at) }}</p>
              </div>
            </div>
          </button>
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

const router = useRouter()
const notificationsStore = useNotificationsStore()
const usersStore = useUsersStore()
const authStore = useAuthStore()

const isOpen = ref(false)
const loading = ref(false)

const notifications = computed(() => notificationsStore.notifications)
const unreadCount = computed(() => notificationsStore.unreadCount)

let refreshInterval = null

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
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})

async function loadNotifications() {
  loading.value = true
  try {
    await notificationsStore.fetchNotifications(50, false)
    await notificationsStore.fetchUnreadCount()
  } catch (error) {
    console.error('Error loading notifications:', error)
  } finally {
    loading.value = false
  }
}

function toggleDropdown() {
  isOpen.value = !isOpen.value
  if (isOpen.value && notifications.value.length === 0) {
    loadNotifications()
  }
}

function closeDropdown() {
  isOpen.value = false
}

async function handleNotificationClick(notification) {
  if (!notification.read) {
    await notificationsStore.markAsRead(notification.id)
  }
  
  closeDropdown()
  
  // Navigate to objective if available
  if (notification.objective_id) {
    router.push(`/objectives/${notification.objective_id}`)
  }
}

async function markAllAsRead() {
  await notificationsStore.markAllAsRead()
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

// Click outside directive
const vClickOutside = {
  mounted(el, binding) {
    el.clickOutsideEvent = (event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value()
      }
    }
    document.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el) {
    document.removeEventListener('click', el.clickOutsideEvent)
  }
}
</script>

