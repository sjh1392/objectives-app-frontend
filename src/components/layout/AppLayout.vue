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
              v-if="companyStore.logoUrl"
              :src="companyStore.logoUrl"
              alt="Company logo"
              class="h-10 max-w-[200px] object-contain"
            />
            <h1 v-if="companyStore.name" class="text-xl font-bold text-gray-800">
              {{ companyStore.name }}
            </h1>
            <div v-else class="h-7 w-32 bg-gray-200 rounded animate-pulse"></div>
          </router-link>
        </div>
        
        <!-- Search Trigger Button -->
        <button
          @click="openCommandPalette"
          class="flex-1 max-w-2xl px-4 py-2 pl-10 border border-gray-300 rounded-lg text-left text-gray-500 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 relative"
        >
          <span>Search objectives, departments, or users...</span>
          <div class="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1 text-xs text-gray-400">
            <kbd class="px-1.5 py-0.5 text-xs font-semibold text-gray-600 bg-gray-100 border border-gray-300 rounded">⌘</kbd>
            <kbd class="px-1.5 py-0.5 text-xs font-semibold text-gray-600 bg-gray-100 border border-gray-300 rounded">K</kbd>
          </div>
        </button>
      </div>
      
      <!-- Right side: Notifications, Logout, and User Menu -->
      <div class="flex items-center gap-3 flex-shrink-0">
        <NotificationBell />
        <button
          @click="handleLogout"
          class="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
          title="Sign Out"
        >
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span class="hidden md:inline text-sm font-medium">Sign Out</span>
        </button>
        <UserMenu />
      </div>
    </header>

    <div class="flex flex-1 overflow-hidden">
      <!-- Sidebar -->
      <aside class="w-64 bg-white border-r border-gray-200 overflow-y-auto flex flex-col">
        <div class="p-6">
          <h1 v-if="companyStore.name" class="text-2xl font-bold text-gray-800">{{ companyStore.name }}</h1>
          <div v-else class="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
          <p class="text-sm text-gray-500 mt-1">Management System</p>
        </div>
        <nav class="mt-8 flex-1">
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
        
        <!-- Sidebar Footer with Deploy Time -->
        <div class="mt-auto px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div class="text-xs text-gray-500">
            <div class="font-medium text-gray-600 mb-1">Build Info</div>
            <div v-if="buildTime" class="text-gray-500">
              Deployed: {{ formatBuildTime(buildTime) }}
            </div>
            <div v-else class="text-gray-400 italic">
              Local development
            </div>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 overflow-auto">
        <div class="container mx-auto px-8 py-8">
          <slot />
        </div>
      </main>
    </div>
    
    <!-- Command Palette -->
    <CommandPalette ref="commandPaletteRef" />
  </div>
</template>

<script setup>
import NotificationBell from '@/components/common/NotificationBell.vue'
import UserMenu from '@/components/common/UserMenu.vue'
import CommandPalette from '@/components/common/CommandPalette.vue'
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useObjectivesStore } from '../../stores/objectives'
import { useUsersStore } from '../../stores/users'
import { useAuthStore } from '../../stores/auth'
import { useCompanyStore } from '../../stores/company'

const router = useRouter()
const route = useRoute()
const objectivesStore = useObjectivesStore()
const usersStore = useUsersStore()
const authStore = useAuthStore()
const companyStore = useCompanyStore()

const commandPaletteRef = ref(null)

// Get build time from Vite define (injected at build time)
// @ts-ignore - __BUILD_TIME__ is injected by Vite at build time
const buildTime = typeof __BUILD_TIME__ !== 'undefined' ? __BUILD_TIME__ : null

const navItems = [
  { path: '/', label: 'Dashboard', icon: 'grid' },
  { path: '/objectives', label: 'Objectives', icon: 'target' },
  { path: '/timeline', label: 'Timeline', icon: 'calendar' },
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
    calendar: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>',
    chart: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>',
    plug: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"/></svg>',
    rocket: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>'
  }
  return icons[iconName] || ''
}

function formatBuildTime(timestamp) {
  try {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    
    // Format as relative time if recent, otherwise absolute
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    
    // For older deployments, show formatted date
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (e) {
    return timestamp
  }
}

function openCommandPalette() {
  if (commandPaletteRef.value) {
    commandPaletteRef.value.open()
  }
}

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}

function handleKeyDown(event) {
  // Cmd+K (Mac) or Ctrl+K (Windows/Linux) - now handled by CommandPalette component
  // This is kept here in case we want to add other shortcuts
}

async function loadCompanyData() {
  // Only fetch if we don't have data in store
  if (!companyStore.hasCompanyData) {
    await companyStore.fetchCompanyData()
  }
}

onMounted(() => {
  // Load company data from storage first (instant, no flash)
  companyStore.loadFromStorage()
  
  // Then fetch fresh data in background (only if not already loaded)
  loadCompanyData()
  
  // Reload company data when window regains focus (in case it was updated in another tab/window)
  window.addEventListener('focus', () => {
    // Only fetch if we don't have data, or do a background refresh
    if (!companyStore.hasCompanyData) {
      loadCompanyData()
    }
  })
  
  // Only load users if not already loaded (to avoid blocking)
  if (usersStore.users.length === 0) {
    usersStore.fetchUsers().catch(err => console.error('Error loading users:', err))
  }
  // Load departments in background for search
  if (usersStore.departments.length === 0) {
    usersStore.fetchDepartments().catch(err => console.error('Error loading departments:', err))
  }
  
  // Reload company data when route changes (especially after onboarding updates)
  watch(() => route.path, (newPath, oldPath) => {
    // Reload if navigating away from onboarding (company might have been updated)
    if (oldPath === '/onboarding' && newPath !== '/onboarding') {
      companyStore.fetchCompanyData()
    }
  })
})

onUnmounted(() => {
  window.removeEventListener('focus', loadCompanyData)
})
</script>

