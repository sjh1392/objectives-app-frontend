<template>
  <!-- Command Palette Modal -->
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4"
        @click.self="close"
      >
        <!-- Backdrop with blur -->
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" @click="close"></div>
        
        <!-- Search Modal -->
        <div class="relative w-full max-w-2xl bg-white rounded-lg shadow-2xl overflow-hidden">
          <!-- Search Input -->
          <div class="border-b border-gray-200 p-4">
            <input
              ref="searchInputRef"
              v-model="query"
              type="text"
              placeholder="Search objectives, people, teams..."
              class="w-full px-4 py-3 text-lg border-0 focus:ring-0 focus:outline-none placeholder-gray-400"
              @keydown.esc="close"
              @keydown.down.prevent="navigateDown"
              @keydown.up.prevent="navigateUp"
              @keydown.enter.prevent="selectItem"
            />
            <div class="flex items-center justify-between mt-2 text-xs text-gray-500">
              <div class="flex items-center gap-4">
                <span v-if="results.length > 0">{{ results.length }} result(s)</span>
                <span v-else-if="query && !loading">No results found</span>
              </div>
              <div class="flex items-center gap-2">
                <kbd class="px-2 py-1 text-xs font-semibold text-gray-600 bg-gray-100 border border-gray-300 rounded">↑↓</kbd>
                <span>navigate</span>
                <kbd class="px-2 py-1 text-xs font-semibold text-gray-600 bg-gray-100 border border-gray-300 rounded">↵</kbd>
                <span>select</span>
                <kbd class="px-2 py-1 text-xs font-semibold text-gray-600 bg-gray-100 border border-gray-300 rounded">Esc</kbd>
                <span>close</span>
              </div>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="p-8 text-center text-gray-500">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>

          <!-- Results -->
          <div v-else-if="query && results.length > 0" class="max-h-[60vh] overflow-y-auto">
            <div
              v-for="(group, groupIndex) in groupedResults"
              :key="groupIndex"
              class="border-b border-gray-100 last:border-0"
            >
              <div class="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                {{ group.type }}
              </div>
              <button
                v-for="(item, itemIndex) in group.items"
                :key="item.id"
                :class="[
                  'w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors',
                  selectedIndex === getItemIndex(groupIndex, itemIndex) ? 'bg-primary-50 border-l-4 border-primary-600' : ''
                ]"
                @click="selectItem(item)"
                @mouseenter="setSelectedIndex(getItemIndex(groupIndex, itemIndex))"
              >
                <div class="flex items-center gap-3">
                  <div class="flex-shrink-0">
                    <component :is="getIcon(item.type)" v-if="item.type" />
                    <span v-else class="w-5 h-5"></span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium text-gray-900 truncate">{{ item.title || 'Untitled' }}</div>
                    <div v-if="item.subtitle" class="text-xs text-gray-500 truncate">{{ item.subtitle }}</div>
                  </div>
                  <div v-if="item.meta" class="flex-shrink-0 text-xs text-gray-400">
                    {{ item.meta }}
                  </div>
                </div>
              </button>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else-if="query && !loading && results.length === 0" class="p-8 text-center text-gray-500">
            <p>No results found for "{{ query }}"</p>
          </div>

          <!-- Initial State -->
          <div v-else class="p-8 text-center text-gray-400">
            <p class="mb-2">Start typing to search...</p>
            <p class="text-xs">Search for objectives, people, or teams</p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useObjectivesStore } from '../../stores/objectives'
import { useUsersStore } from '../../stores/users'
import api from '../../services/api'

const router = useRouter()
const objectivesStore = useObjectivesStore()
const usersStore = useUsersStore()

const isOpen = ref(false)
const query = ref('')
const results = ref([])
const loading = ref(false)
const selectedIndex = ref(-1)
const searchInputRef = ref(null)

// Keyboard shortcut listener
function handleKeyDown(event) {
  // Cmd+K (Mac) or Ctrl+K (Windows/Linux)
  if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
    event.preventDefault()
    toggle()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
})

watch(isOpen, (newValue) => {
  if (newValue) {
    // Focus input when opened
    nextTick(() => {
      searchInputRef.value?.focus()
    })
    query.value = ''
    results.value = []
    selectedIndex.value = -1
  }
})

// Search with debounce
let searchTimeout = null
watch(query, (newQuery) => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  
  if (!newQuery.trim()) {
    results.value = []
    selectedIndex.value = -1
    return
  }

  loading.value = true
  searchTimeout = setTimeout(() => {
    performSearch(newQuery)
  }, 200)
})

async function performSearch(searchQuery) {
  try {
    loading.value = true
    const searchTerm = searchQuery.toLowerCase().trim()
    const allResults = []

    // Search objectives
    try {
      const objectivesResponse = await api.get('/objectives', {
        params: { search: searchTerm }
      })
      const objectives = objectivesResponse.data || []
      objectives.forEach(obj => {
        if (obj && obj.id) {
          const owner = obj.owner_id ? usersStore.getUserById(obj.owner_id) : null
          allResults.push({
            id: `objective-${obj.id}`,
            type: 'objective',
            title: obj.title || 'Untitled Objective',
            subtitle: obj.description || `Status: ${obj.status || 'Unknown'}`,
            meta: owner?.name || 'Unassigned',
            url: `/objectives/${obj.id}`
          })
        }
      })
    } catch (error) {
      console.error('Error searching objectives:', error)
    }

    // Search people
    try {
      const users = usersStore.users || []
      users.forEach(user => {
        if (user && user.id) {
          const nameMatch = user.name?.toLowerCase().includes(searchTerm)
          const emailMatch = user.email?.toLowerCase().includes(searchTerm)
          if (nameMatch || emailMatch) {
            const department = user.department ? usersStore.getDepartmentById(user.department) : null
            allResults.push({
              id: `user-${user.id}`,
              type: 'person',
              title: user.name || 'Unnamed User',
              subtitle: user.email || '',
              meta: department?.name || 'Unassigned',
              url: `/people/${user.id}`
            })
          }
        }
      })
    } catch (error) {
      console.error('Error searching users:', error)
    }

    // Search teams/departments
    try {
      await usersStore.fetchDepartments()
      const teams = usersStore.departments || []
      teams.forEach(team => {
        if (team && team.id && team.name?.toLowerCase().includes(searchTerm)) {
          allResults.push({
            id: `team-${team.id}`,
            type: 'team',
            title: team.name || 'Unnamed Team',
            subtitle: `${team.users?.length || 0} members`,
            meta: null,
            url: `/structure`
          })
        }
      })
    } catch (error) {
      console.error('Error searching teams:', error)
    }

    results.value = allResults.slice(0, 20) // Limit to 20 results
    selectedIndex.value = -1
  } catch (error) {
    console.error('Search error:', error)
    results.value = []
  } finally {
    loading.value = false
  }
}

const groupedResults = computed(() => {
  const groups = {
    objective: { type: 'Objectives', items: [] },
    person: { type: 'People', items: [] },
    team: { type: 'Teams', items: [] }
  }

  results.value.forEach(item => {
    if (groups[item.type]) {
      groups[item.type].items.push(item)
    }
  })

  // Return only non-empty groups
  return Object.values(groups).filter(group => group.items.length > 0)
})

function getItemIndex(groupIndex, itemIndex) {
  if (!groupedResults.value || groupIndex < 0 || groupIndex >= groupedResults.value.length) {
    return -1
  }
  let index = 0
  for (let i = 0; i < groupIndex; i++) {
    if (groupedResults.value[i] && groupedResults.value[i].items) {
      index += groupedResults.value[i].items.length
    }
  }
  const group = groupedResults.value[groupIndex]
  if (group && group.items && itemIndex >= 0 && itemIndex < group.items.length) {
    return index + itemIndex
  }
  return -1
}

function navigateDown() {
  if (results.value.length === 0) {
    selectedIndex.value = -1
    return
  }
  if (selectedIndex.value < results.value.length - 1) {
    selectedIndex.value++
  } else {
    selectedIndex.value = 0
  }
}

function navigateUp() {
  if (results.value.length === 0) {
    selectedIndex.value = -1
    return
  }
  if (selectedIndex.value > 0) {
    selectedIndex.value--
  } else {
    selectedIndex.value = results.value.length - 1
  }
}

function setSelectedIndex(index) {
  if (index >= 0 && index < results.value.length) {
    selectedIndex.value = index
  } else {
    selectedIndex.value = -1
  }
}

function selectItem(item = null) {
  const selectedItem = item || (selectedIndex.value >= 0 && selectedIndex.value < results.value.length ? results.value[selectedIndex.value] : null)
  if (selectedItem && selectedItem.url) {
    close()
    router.push(selectedItem.url)
  }
}

function toggle() {
  isOpen.value = !isOpen.value
}

function open() {
  isOpen.value = true
}

function close() {
  isOpen.value = false
  query.value = ''
  results.value = []
  selectedIndex.value = -1
}

// Expose methods for parent component
defineExpose({
  open,
  close,
  toggle
})

// Icon components
const ObjectiveIcon = {
  template: `
    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
  `
}

const PersonIcon = {
  template: `
    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
    </svg>
  `
}

const TeamIcon = {
  template: `
    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
    </svg>
  `
}

function getIcon(type) {
  const icons = {
    objective: ObjectiveIcon,
    person: PersonIcon,
    team: TeamIcon
  }
  return icons[type] || 'span'
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Custom scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>

