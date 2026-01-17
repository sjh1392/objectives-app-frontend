<template>
  <div class="flex flex-col h-screen bg-gray-50" style="background-color: #f8f9fa;">
    <!-- Top Navigation with Search -->
    <header class="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between gap-4">
      <!-- Left side: Logo and Search -->
      <div class="flex items-center gap-4 flex-1">
        <!-- Company Logo and Name -->
        <div class="flex items-center gap-3 flex-shrink-0">
          <router-link to="/" class="flex items-center gap-3">
            <img
              v-if="companyLogo"
              :src="companyLogo"
              alt="Company logo"
              class="h-10 max-w-[200px] object-contain"
            />
            <h1 class="text-xl font-bold text-gray-800">
              {{ companyName || 'Objectives' }}
            </h1>
          </router-link>
        </div>
        
        <!-- Search -->
        <div class="flex-1 max-w-2xl relative">
          <div class="relative">
            <input
              ref="searchInput"
              v-model="searchQuery"
              @input="handleSearch"
              @keydown.escape="closeSearch"
              type="text"
              placeholder="Search objectives, departments, or users... (⌘K)"
              class="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
          
          <!-- Search Results Dropdown -->
          <div v-if="showSearchResults && searchResults.length > 0" class="absolute z-50 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-y-auto">
            <div
              v-for="result in searchResults"
              :key="result.id"
              @click="handleResultClick(result)"
              class="px-4 py-3 cursor-pointer hover:bg-purple-50 border-b border-gray-100 last:border-0"
            >
              <div class="flex items-center gap-3">
                <span class="text-gray-400" v-html="getResultIcon(result.type)"></span>
                <div class="flex-1">
                  <div class="font-medium text-gray-900">{{ result.title }}</div>
                  <div class="text-sm text-gray-500">{{ result.subtitle }}</div>
                </div>
                <span class="text-xs text-gray-400 uppercase">{{ result.type }}</span>
              </div>
            </div>
          </div>
          <div v-if="showSearchResults && searchQuery && searchResults.length === 0" class="absolute z-50 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-sm text-gray-500 text-center">
            No results found
          </div>
        </div>
      </div>
      
      <!-- Right side: Notifications and User Menu -->
      <div class="flex items-center gap-3 flex-shrink-0">
        <NotificationBell />
        <UserMenu />
      </div>
    </header>

    <div class="flex flex-1 overflow-hidden">
      <!-- Sidebar -->
      <aside class="w-64 bg-white border-r border-gray-200 overflow-y-auto">
        <div class="p-6">
          <h1 class="text-2xl font-bold text-gray-800">{{ companyName || 'Objectives' }}</h1>
          <p class="text-sm text-gray-500 mt-1">Management System</p>
        </div>
        <nav class="mt-8">
          <router-link
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="flex items-center px-6 py-3 text-gray-600 hover:bg-purple-50 transition-colors"
            active-class="bg-purple-50 text-purple-700 border-r-4 border-purple-600 font-medium"
          >
            <span class="mr-3" v-html="getIcon(item.icon)"></span>
            <span>{{ item.label }}</span>
          </router-link>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 overflow-auto">
        <div class="container mx-auto px-8 py-8">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import NotificationBell from '@/components/common/NotificationBell.vue'
import UserMenu from '@/components/common/UserMenu.vue'
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useObjectivesStore } from '../../stores/objectives'
import { useUsersStore } from '../../stores/users'
import api from '../../services/api'

const router = useRouter()
const route = useRoute()
const objectivesStore = useObjectivesStore()
const usersStore = useUsersStore()

const searchInput = ref(null)
const searchQuery = ref('')
const showSearchResults = ref(false)
const searchResults = ref([])
const companyLogo = ref(null)
const companyName = ref(null)
let searchTimeout = null
let searchAbortController = null // For cancelling in-flight requests

const navItems = [
  { path: '/', label: 'Dashboard', icon: 'grid' },
  { path: '/objectives', label: 'Objectives', icon: 'target' },
  { path: '/people', label: 'People', icon: 'users' },
  { path: '/departments', label: 'Departments', icon: 'building' },
  { path: '/structure', label: 'Structure', icon: 'tree' },
  { path: '/reports', label: 'Reports', icon: 'chart' },
  { path: '/integrations', label: 'Integrations', icon: 'plug' },
  { path: '/onboarding', label: 'Get Started', icon: 'rocket' }
]

function getIcon(iconName) {
  const icons = {
    grid: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>',
    target: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
    users: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>',
    building: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>',
    tree: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>',
    chart: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>',
    plug: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"/></svg>',
    rocket: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>'
  }
  return icons[iconName] || ''
}

function getResultIcon(type) {
  const icons = {
    objective: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
    user: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>',
    department: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>'
  }
  return icons[type] || ''
}

async function handleSearch() {
  // Cancel any in-flight search requests
  if (searchAbortController) {
    searchAbortController.abort()
  }
  
  // Clear existing timeout
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  if (!searchQuery.value.trim()) {
    showSearchResults.value = false
    searchResults.value = []
    return
  }

  // Debounce search - wait 300ms after user stops typing
  searchTimeout = setTimeout(async () => {
    const query = searchQuery.value.toLowerCase().trim()
    if (!query) return

    // Create new abort controller for this search
    searchAbortController = new AbortController()
    const signal = searchAbortController.signal

    const results = []

    try {
      // Search objectives (only if query is at least 2 characters)
      if (query.length >= 2) {
        const objectivesResponse = await api.get('/objectives', { 
          params: { search: searchQuery.value },
          signal // Allow request cancellation
        })
        objectivesResponse.data.slice(0, 5).forEach(obj => {
          results.push({
            id: obj.id,
            type: 'objective',
            title: obj.title,
            subtitle: obj.description || `Status: ${obj.status}`,
            path: `/objectives/${obj.id}`
          })
        })
      }

      // Search users (client-side filter from already loaded users)
      if (usersStore.users.length > 0) {
        const users = usersStore.users.filter(user => 
          user.name.toLowerCase().includes(query) || 
          user.email.toLowerCase().includes(query)
        ).slice(0, 3)
        users.forEach(user => {
          results.push({
            id: user.id,
            type: 'user',
            title: user.name,
            subtitle: user.email,
            path: `/people/${user.id}`
          })
        })
      }

      // Search departments (client-side if already loaded, otherwise API call)
      if (usersStore.departments && usersStore.departments.length > 0) {
        const filteredDepts = usersStore.departments.filter(dept => 
          dept.name.toLowerCase().includes(query) ||
          (dept.description && dept.description.toLowerCase().includes(query))
        ).slice(0, 2)
        filteredDepts.forEach(dept => {
          results.push({
            id: dept.id,
            type: 'department',
            title: dept.name,
            subtitle: dept.description || 'Department',
            path: `/departments`
          })
        })
      } else if (query.length >= 2) {
        // Only fetch departments if not already loaded and query is long enough
        const departmentsResponse = await api.get('/departments', { signal })
        const filteredDepts = departmentsResponse.data.filter(dept => 
          dept.name.toLowerCase().includes(query) ||
          (dept.description && dept.description.toLowerCase().includes(query))
        ).slice(0, 2)
        filteredDepts.forEach(dept => {
          results.push({
            id: dept.id,
            type: 'department',
            title: dept.name,
            subtitle: dept.description || 'Department',
            path: `/departments`
          })
        })
      }

      searchResults.value = results.slice(0, 10) // Limit to 10 results
      showSearchResults.value = true
    } catch (error) {
      // Don't log aborted requests (they're cancelled intentionally)
      if (error.name !== 'CanceledError' && error.name !== 'AbortError') {
        console.error('Error searching:', error)
      }
    } finally {
      searchAbortController = null
    }
  }, 300) // 300ms debounce
}

function handleResultClick(result) {
  router.push(result.path)
  closeSearch()
}

function closeSearch() {
  searchQuery.value = ''
  showSearchResults.value = false
  searchResults.value = []
  searchInput.value?.blur()
}

function handleKeyDown(event) {
  // Cmd+K (Mac) or Ctrl+K (Windows/Linux)
  if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
    event.preventDefault()
    searchInput.value?.focus()
    searchInput.value?.select()
  }
  
  // Escape to close search
  if (event.key === 'Escape' && showSearchResults.value) {
    closeSearch()
  }
}

async function loadCompanyData() {
  try {
    const response = await api.get('/company')
    if (response.data) {
      if (response.data.logo_url) {
        companyLogo.value = response.data.logo_url
      }
      if (response.data.name) {
        companyName.value = response.data.name
        // Update page title
        document.title = `${response.data.name} - Objectives Management`
      } else {
        document.title = 'Objectives Management'
      }
    } else {
      document.title = 'Objectives Management'
    }
  } catch (error) {
    console.error('Error loading company data:', error)
    document.title = 'Objectives Management'
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
  // Reload company data when window regains focus (in case it was updated in another tab/window)
  window.addEventListener('focus', loadCompanyData)
  
  // Only load users if not already loaded (to avoid blocking)
  if (usersStore.users.length === 0) {
    usersStore.fetchUsers().catch(err => console.error('Error loading users:', err))
  }
  // Load departments in background for search
  if (usersStore.departments.length === 0) {
    usersStore.fetchDepartments().catch(err => console.error('Error loading departments:', err))
  }
  // Load company data (logo and name)
  loadCompanyData()
  
  // Reload company data when route changes (especially after onboarding updates)
  watch(() => route.path, (newPath, oldPath) => {
    // Reload if navigating away from onboarding (company might have been updated)
    if (oldPath === '/onboarding' && newPath !== '/onboarding') {
      loadCompanyData()
    }
  })
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('focus', loadCompanyData)
  // Clear any pending search timeouts
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  // Cancel any in-flight search requests
  if (searchAbortController) {
    searchAbortController.abort()
  }
})
</script>

