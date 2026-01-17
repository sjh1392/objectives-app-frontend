<template>
  <div class="relative">
    <button
      @click="toggleDropdown"
      class="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium text-sm">
        {{ userInitials }}
      </div>
      <div class="text-left hidden md:block">
        <div class="text-sm font-medium text-gray-900">{{ currentUser?.name || 'Not signed in' }}</div>
        <div class="text-xs text-gray-500">{{ currentUser?.email || 'Select a user' }}</div>
      </div>
      <svg
        class="w-4 h-4 text-gray-400"
        :class="{ 'transform rotate-180': isOpen }"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Dropdown -->
    <div
      v-if="isOpen"
      v-click-outside="closeDropdown"
      class="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
    >
      <div class="p-4 border-b border-gray-200">
        <div class="text-sm font-medium text-gray-900">Current User</div>
        <div class="text-xs text-gray-500 mt-1">{{ currentUser?.name || 'Not selected' }}</div>
      </div>
      
      <div class="max-h-64 overflow-y-auto">
        <div class="p-2">
          <div v-if="users.length > 0" class="text-xs font-semibold text-gray-500 uppercase px-2 py-1">Select User</div>
          <button
            v-for="user in users"
            :key="user.id"
            @click="selectUser(user)"
            class="w-full px-3 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-3"
            :class="{ 'bg-blue-50 border border-blue-200': currentUserId === user.id }"
          >
            <div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
              {{ getUserInitials(user) }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-gray-900 truncate">{{ user.name }}</div>
              <div class="text-xs text-gray-500 truncate">{{ user.email }}</div>
            </div>
            <svg
              v-if="currentUserId === user.id"
              class="w-5 h-5 text-blue-600 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </button>
        </div>
      </div>
      
      <div class="p-2 border-t border-gray-200">
        <button
          @click="handleLogout"
          class="w-full px-3 py-2 text-left hover:bg-red-50 rounded-lg transition-colors flex items-center gap-3 text-red-600"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span class="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useUsersStore } from '@/stores/users'
import { useNotificationsStore } from '@/stores/notifications'

const authStore = useAuthStore()
const usersStore = useUsersStore()
const notificationsStore = useNotificationsStore()

const isOpen = ref(false)

const users = computed(() => usersStore.users)
const currentUserId = computed(() => authStore.currentUserId)
const currentUser = computed(() => {
  // Use authStore.currentUser if available (from real auth), otherwise fall back to usersStore
  if (authStore.currentUser) {
    return authStore.currentUser
  }
  if (!currentUserId.value) return null
  return usersStore.getUserById(currentUserId.value)
})

const userInitials = computed(() => {
  if (!currentUser.value) return '?'
  const names = currentUser.value.name.split(' ')
  if (names.length >= 2) {
    return (names[0][0] + names[names.length - 1][0]).toUpperCase()
  }
  return currentUser.value.name.substring(0, 2).toUpperCase()
})

function getUserInitials(user) {
  const names = user.name.split(' ')
  if (names.length >= 2) {
    return (names[0][0] + names[names.length - 1][0]).toUpperCase()
  }
  return user.name.substring(0, 2).toUpperCase()
}

function toggleDropdown() {
  isOpen.value = !isOpen.value
  if (isOpen.value && users.value.length === 0) {
    usersStore.fetchUsers()
  }
}

function closeDropdown() {
  isOpen.value = false
}

async function selectUser(user) {
  // Only allow user switching if not using real auth
  if (authStore.isAuthenticated && authStore.currentUser?.id !== user.id) {
    // In real auth mode, users can't switch - they're logged in as themselves
    return
  }
  authStore.setCurrentUser(user.id, user)
  notificationsStore.setCurrentUser(user.id)
  closeDropdown()
  
  // Refresh notifications for the new user
  await notificationsStore.refreshNotifications()
}

async function handleLogout() {
  await authStore.logout()
  closeDropdown()
  window.location.href = '/login'
}

onMounted(() => {
  // Load current user from localStorage
  authStore.loadCurrentUser()
  
  // If no user is set but users are available, set first user as default
  if (!authStore.currentUserId && usersStore.users.length > 0) {
    selectUser(usersStore.users[0])
  }
  
  // Load users if not already loaded
  if (usersStore.users.length === 0) {
    usersStore.fetchUsers().then(() => {
      if (!authStore.currentUserId && usersStore.users.length > 0) {
        selectUser(usersStore.users[0])
      }
    })
  }
})

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

