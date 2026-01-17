<template>
  <AppLayout>
    <div>
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Objectives</h1>
        <div class="flex gap-3">
          <div class="flex border border-gray-300 rounded-md overflow-hidden">
            <button
              @click="viewMode = 'table'"
              :class="viewMode === 'table' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700'"
              class="px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Table
            </button>
            <button
              @click="viewMode = 'grid'"
              :class="viewMode === 'grid' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700'"
              class="px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Grid
            </button>
            <button
              @click="viewMode = 'bulk-edit'"
              :class="viewMode === 'bulk-edit' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700'"
              class="px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Bulk Edit
            </button>
          </div>
          <div v-if="selectedObjectives.length > 0" class="flex items-center gap-2">
            <span class="text-sm text-gray-600">{{ selectedObjectives.length }} selected</span>
            <button
              v-if="selectedObjectives.length === 1"
              @click="editSelectedObjective"
              class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              title="Edit"
            >
              <span>✏️</span> Edit
            </button>
            <button
              v-if="selectedObjectives.length === 1"
              @click="deleteSelectedObjective"
              class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2"
              title="Delete"
            >
              <span>🗑️</span> Delete
            </button>
            <div v-if="selectedObjectives.length > 1" class="relative">
              <select
                v-model="bulkAction"
                @change="handleBulkAction"
                class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 appearance-none pr-8"
              >
                <option value="">Bulk Actions...</option>
                <option value="delete">Delete Selected</option>
              </select>
            </div>
          </div>
          <button
            @click="showForm = true"
            class="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            + New Objective
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search objectives, descriptions, or owner names..."
              @input="handleSearch"
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              v-model="statusFilter"
              @change="handleFilterChange"
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="On Hold">On Hold</option>
              <option value="Draft">Draft</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tag</label>
            <select
              v-model="tagFilter"
              @change="handleFilterChange"
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Tags</option>
              <option v-for="tag in objectivesStore.tags" :key="tag" :value="tag">
                {{ tag }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Group By</label>
            <select
              v-model="groupBy"
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
            >
              <option value="">None</option>
              <option value="person">Person</option>
              <option value="due_date">Month & Year (Due Date)</option>
              <option value="priority">Priority</option>
              <option value="status">Status</option>
            </select>
          </div>
          <div class="flex items-end">
            <button
              @click="clearFilters"
              class="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <!-- Form Modal -->
      <div v-if="showForm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <ObjectiveForm
            :objective="editingObjective"
            @submit="handleFormSubmit"
            @cancel="closeForm"
          />
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="objectivesStore.loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>

      <!-- Table View - Grouped -->
      <div v-if="viewMode === 'table' && filteredObjectives.length > 0 && groupBy">
        <div v-for="(group, groupKey) in groupedObjectives" :key="groupKey" class="mb-8">
          <h3 class="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
            {{ getGroupLabel(groupKey) }}
            <span class="text-sm font-normal text-gray-500 ml-2">({{ group.length }})</span>
          </h3>
          <div class="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      :checked="selectedObjectives.length === group.length && group.length > 0 && group.every(obj => selectedObjectives.includes(obj.id))"
                      :indeterminate="group.some(obj => selectedObjectives.includes(obj.id)) && !group.every(obj => selectedObjectives.includes(obj.id))"
                      @change="toggleSelectGroup(group)"
                      class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div class="flex items-center gap-1">
                      Due Date
                      <button
                        @click.stop="toggleDueDateSort"
                        class="text-gray-400 hover:text-gray-600"
                        title="Sort by due date"
                      >
                        {{ dueDateSort === 'ASC' ? '↑' : dueDateSort === 'DESC' ? '↓' : '⇅' }}
                      </button>
                    </div>
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div class="flex items-center gap-1">
                      Last Updated
                      <button
                        @click.stop="toggleUpdatedSort"
                        class="text-gray-400 hover:text-gray-600"
                        title="Sort by last updated"
                      >
                        {{ updatedSort === 'ASC' ? '↑' : updatedSort === 'DESC' ? '↓' : '⇅' }}
                      </button>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr
                  v-for="objective in group"
                  :key="objective.id"
                  :class="selectedObjectives.includes(objective.id) ? 'bg-primary-50' : 'hover:bg-gray-50'"
                  class="cursor-pointer"
                  @click="navigateToObjective(objective.id)"
                >
                  <td class="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      :value="objective.id"
                      v-model="selectedObjectives"
                      @click.stop
                      class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </td>
                  <td class="px-6 py-4">
                    <span class="text-sm font-medium text-gray-900">
                      {{ objective.title }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      class="px-2 py-1 text-xs font-semibold rounded-full"
                      :class="{
                        'bg-green-100 text-green-800': objective.status === 'Active',
                        'bg-blue-100 text-blue-800': objective.status === 'Completed',
                        'bg-yellow-100 text-yellow-800': objective.status === 'On Hold',
                        'bg-gray-100 text-gray-800': objective.status === 'Draft',
                        'bg-red-100 text-red-800': objective.status === 'Cancelled'
                      }"
                    >
                      {{ objective.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="w-24 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          class="h-2 rounded-full"
                          :class="{
                            'bg-green-500': objective.progress_percentage >= 80,
                            'bg-blue-500': objective.progress_percentage >= 50 && objective.progress_percentage < 80,
                            'bg-yellow-500': objective.progress_percentage >= 25 && objective.progress_percentage < 50,
                            'bg-red-500': objective.progress_percentage < 25
                          }"
                          :style="{ width: `${Math.min(objective.progress_percentage || 0, 100)}%` }"
                        ></div>
                      </div>
                      <span class="text-sm text-gray-900">{{ Math.round(objective.progress_percentage || 0) }}%</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                    {{ objective.priority }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <router-link
                      v-if="objective.owner_id && getOwner(objective.owner_id)"
                      :to="`/people/${objective.owner_id}`"
                      @click.stop
                      class="flex items-center gap-2"
                    >
                      <Avatar
                        :name="getOwner(objective.owner_id).name"
                        :email="getOwner(objective.owner_id).email"
                        size="sm"
                      />
                      <span class="text-sm text-gray-900">{{ getOwner(objective.owner_id).name }}</span>
                    </router-link>
                    <span v-else class="text-sm text-gray-400 italic">Unassigned</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDate(objective.due_date) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDateTime(objective.updated_at) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Table View - Ungrouped -->
      <div v-else-if="viewMode === 'table' && filteredObjectives.length > 0" class="bg-white rounded-lg shadow-md overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  :checked="selectedObjectives.length === filteredObjectives.length && filteredObjectives.length > 0"
                  :indeterminate="selectedObjectives.length > 0 && selectedObjectives.length < filteredObjectives.length"
                  @change="toggleSelectAll"
                  class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div class="flex items-center gap-1">
                  Due Date
                  <button
                    @click.stop="toggleDueDateSort"
                    class="text-gray-400 hover:text-gray-600"
                    title="Sort by due date"
                  >
                    {{ dueDateSort === 'ASC' ? '↑' : dueDateSort === 'DESC' ? '↓' : '⇅' }}
                  </button>
                </div>
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div class="flex items-center gap-1">
                  Last Updated
                  <button
                    @click.stop="toggleUpdatedSort"
                    class="text-gray-400 hover:text-gray-600"
                    title="Sort by last updated"
                  >
                    {{ updatedSort === 'ASC' ? '↑' : updatedSort === 'DESC' ? '↓' : '⇅' }}
                  </button>
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="objective in filteredObjectives"
              :key="objective.id"
              :class="selectedObjectives.includes(objective.id) ? 'bg-primary-50' : 'hover:bg-gray-50'"
              class="cursor-pointer"
              @click="navigateToObjective(objective.id)"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <input
                  type="checkbox"
                  :value="objective.id"
                  v-model="selectedObjectives"
                  @click.stop
                  class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
              </td>
              <td class="px-6 py-4">
                <span class="text-sm font-medium text-gray-900">
                  {{ objective.title }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="px-2 py-1 text-xs font-semibold rounded-full"
                  :class="{
                    'bg-green-100 text-green-800': objective.status === 'Active',
                    'bg-blue-100 text-blue-800': objective.status === 'Completed',
                    'bg-yellow-100 text-yellow-800': objective.status === 'On Hold',
                    'bg-gray-100 text-gray-800': objective.status === 'Draft',
                    'bg-red-100 text-red-800': objective.status === 'Cancelled'
                  }"
                >
                  {{ objective.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="w-24 bg-gray-200 rounded-full h-2 mr-2">
                    <div
                      class="h-2 rounded-full"
                      :class="{
                        'bg-green-500': objective.progress_percentage >= 80,
                        'bg-blue-500': objective.progress_percentage >= 50 && objective.progress_percentage < 80,
                        'bg-yellow-500': objective.progress_percentage >= 25 && objective.progress_percentage < 50,
                        'bg-red-500': objective.progress_percentage < 25
                      }"
                      :style="{ width: `${Math.min(objective.progress_percentage || 0, 100)}%` }"
                    ></div>
                  </div>
                  <span class="text-sm text-gray-900">{{ Math.round(objective.progress_percentage || 0) }}%</span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                {{ objective.priority }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <router-link
                  v-if="objective.owner_id && getOwner(objective.owner_id)"
                  :to="`/people/${objective.owner_id}`"
                  @click.stop
                  class="flex items-center gap-2"
                >
                  <Avatar
                    :name="getOwner(objective.owner_id).name"
                    :email="getOwner(objective.owner_id).email"
                    size="sm"
                  />
                  <span class="text-sm text-gray-900">{{ getOwner(objective.owner_id).name }}</span>
                </router-link>
                <span v-else class="text-sm text-gray-400 italic">Unassigned</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(objective.due_date) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDateTime(objective.updated_at) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Grid View - Grouped -->
      <div v-if="viewMode === 'grid' && filteredObjectives.length > 0 && groupBy">
        <div v-for="(group, groupKey) in groupedObjectives" :key="groupKey" class="mb-8">
          <h3 class="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
            {{ getGroupLabel(groupKey) }}
            <span class="text-sm font-normal text-gray-500 ml-2">({{ group.length }})</span>
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ObjectiveCard
              v-for="objective in group"
              :key="objective.id"
              :objective="objective"
            />
          </div>
        </div>
      </div>

      <!-- Grid View - Ungrouped -->
      <div v-else-if="viewMode === 'grid' && filteredObjectives.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ObjectiveCard
          v-for="objective in filteredObjectives"
          :key="objective.id"
          :objective="objective"
        />
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredObjectives.length === 0 && viewMode !== 'bulk-edit'" class="text-center py-12 bg-white rounded-lg shadow-md">
        <p class="text-gray-500 text-lg">No objectives found. Create your first objective!</p>
      </div>

      <!-- Bulk Edit View -->
      <div v-if="viewMode === 'bulk-edit'" class="bg-white rounded-lg shadow-md">
        <ObjectiveTableEditor
          :objectives="objectivesStore.objectives"
          :simplified="false"
          @saved="handleBulkEditSaved"
          @data-updated="handleBulkEditUpdated"
        />
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useObjectivesStore } from '../stores/objectives'
import { useUsersStore } from '../stores/users'
import AppLayout from '../components/layout/AppLayout.vue'
import ObjectiveCard from '../components/objectives/ObjectiveCard.vue'
import ObjectiveForm from '../components/objectives/ObjectiveForm.vue'
import ObjectiveTableEditor from '../components/objectives/ObjectiveTableEditor.vue'
import Avatar from '../components/common/Avatar.vue'

const router = useRouter()
const objectivesStore = useObjectivesStore()
const usersStore = useUsersStore()

const showForm = ref(false)
const editingObjective = ref(null)
const searchQuery = ref('')
const statusFilter = ref('')
const tagFilter = ref('')
const groupBy = ref('')
const viewMode = ref('table')
const selectedObjectives = ref([])
const bulkAction = ref('')
const dueDateSort = ref(null) // null, 'ASC', or 'DESC'
const updatedSort = ref('DESC') // 'ASC' or 'DESC'
let searchTimeout = null

const filteredObjectives = computed(() => objectivesStore.filteredObjectives)

const groupedObjectives = computed(() => {
  if (!groupBy.value || filteredObjectives.value.length === 0) {
    return {}
  }

  const groups = {}

  filteredObjectives.value.forEach(objective => {
    let key = ''

    switch (groupBy.value) {
      case 'person':
        key = objective.owner_id || 'unassigned'
        break
      case 'due_date':
        if (objective.due_date) {
          const date = new Date(objective.due_date)
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        } else {
          key = 'no_due_date'
        }
        break
      case 'priority':
        key = objective.priority || 'no_priority'
        break
      case 'status':
        key = objective.status || 'no_status'
        break
    }

    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(objective)
  })

  // Sort groups based on type
  const sortedKeys = Object.keys(groups).sort((a, b) => {
    if (groupBy.value === 'due_date') {
      return b.localeCompare(a) // Most recent first
    } else if (groupBy.value === 'priority') {
      const priorityOrder = { 'High': 0, 'Medium': 1, 'Low': 2, 'no_priority': 3 }
      return (priorityOrder[a] || 99) - (priorityOrder[b] || 99)
    } else if (groupBy.value === 'status') {
      const statusOrder = { 'Active': 0, 'On Hold': 1, 'Draft': 2, 'Completed': 3, 'Cancelled': 4, 'no_status': 5 }
      return (statusOrder[a] || 99) - (statusOrder[b] || 99)
    } else if (groupBy.value === 'person') {
      // Sort by person name
      const userA = usersStore.getUserById(a)
      const userB = usersStore.getUserById(b)
      if (a === 'unassigned') return 1
      if (b === 'unassigned') return -1
      const nameA = userA ? userA.name : 'Unknown'
      const nameB = userB ? userB.name : 'Unknown'
      return nameA.localeCompare(nameB)
    }
    return a.localeCompare(b)
  })

  const sortedGroups = {}
  sortedKeys.forEach(key => {
    sortedGroups[key] = groups[key]
  })

  return sortedGroups
})

function getGroupLabel(groupKey) {
  if (!groupBy.value) return ''

  switch (groupBy.value) {
    case 'person':
      if (groupKey === 'unassigned') {
        return 'Unassigned'
      }
      const user = usersStore.getUserById(groupKey)
      return user ? user.name : 'Unknown Person'
    case 'due_date':
      if (groupKey === 'no_due_date') {
        return 'No Due Date'
      }
      const [year, month] = groupKey.split('-')
      const date = new Date(parseInt(year), parseInt(month) - 1)
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    case 'priority':
      return groupKey === 'no_priority' ? 'No Priority' : groupKey.charAt(0).toUpperCase() + groupKey.slice(1).toLowerCase()
    case 'status':
      return groupKey === 'no_status' ? 'No Status' : groupKey
    default:
      return groupKey
  }
}

onMounted(async () => {
  await usersStore.fetchUsers()
  await usersStore.fetchDepartments()
  await objectivesStore.fetchObjectives()
  await objectivesStore.fetchTags()
})

// Load filters from store
watch(() => objectivesStore.filters, (filters) => {
  searchQuery.value = filters.search || ''
  statusFilter.value = filters.status || ''
  tagFilter.value = filters.tag || ''
}, { immediate: true })

async function handleSearch() {
  // Clear existing timeout
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  // Debounce search - wait 300ms after user stops typing
  searchTimeout = setTimeout(async () => {
    objectivesStore.setFilter('search', searchQuery.value || null)
    // Fetch objectives with search that includes user names
    await objectivesStore.fetchObjectives()
  }, 300)
}

function handleFilterChange() {
  objectivesStore.setFilter('status', statusFilter.value || null)
  objectivesStore.setFilter('tag', tagFilter.value || null)
}

async function clearFilters() {
  searchQuery.value = ''
  statusFilter.value = ''
  tagFilter.value = ''
  groupBy.value = ''
  dueDateSort.value = null
  updatedSort.value = 'DESC'
  objectivesStore.clearFilters()
  await objectivesStore.fetchObjectives()
}

async function handleFormSubmit(formData) {
  try {
    if (editingObjective.value) {
      await objectivesStore.updateObjective(editingObjective.value.id, formData)
    } else {
      await objectivesStore.createObjective(formData)
    }
    closeForm()
    await objectivesStore.fetchObjectives()
    await objectivesStore.fetchTags()
  } catch (error) {
    console.error('Error saving objective:', error)
    alert('Error saving objective. Please try again.')
  }
}

function closeForm() {
  showForm.value = false
  editingObjective.value = null
}

function toggleSelectAll(event) {
  if (event.target.checked) {
    selectedObjectives.value = filteredObjectives.value.map(obj => obj.id)
  } else {
    selectedObjectives.value = []
  }
}

function toggleSelectGroup(group) {
  const groupIds = group.map(obj => obj.id)
  const allSelected = groupIds.every(id => selectedObjectives.value.includes(id))
  
  if (allSelected) {
    // Deselect all in group
    selectedObjectives.value = selectedObjectives.value.filter(id => !groupIds.includes(id))
  } else {
    // Select all in group
    groupIds.forEach(id => {
      if (!selectedObjectives.value.includes(id)) {
        selectedObjectives.value.push(id)
      }
    })
  }
}

async function bulkDelete() {
  const count = selectedObjectives.value.length
  if (confirm(`Are you sure you want to delete ${count} objective(s)?`)) {
    try {
      for (const id of selectedObjectives.value) {
        await objectivesStore.deleteObjective(id)
      }
      selectedObjectives.value = []
      await objectivesStore.fetchObjectives()
    } catch (error) {
      console.error('Error deleting objectives:', error)
      alert('Error deleting objectives. Please try again.')
    }
  }
}

function editObjective(objective) {
  editingObjective.value = objective
  showForm.value = true
}

function deleteObjective(id) {
  if (confirm('Are you sure you want to delete this objective?')) {
    objectivesStore.deleteObjective(id).then(() => {
      objectivesStore.fetchObjectives()
    }).catch(error => {
      console.error('Error deleting objective:', error)
      alert('Error deleting objective. Please try again.')
    })
  }
}

function formatDate(dateString) {
  if (!dateString) return 'No due date'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatDateTime(dateString) {
  if (!dateString) return 'Never'
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
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function toggleDueDateSort() {
  if (dueDateSort.value === null) {
    dueDateSort.value = 'ASC'
  } else if (dueDateSort.value === 'ASC') {
    dueDateSort.value = 'DESC'
  } else {
    dueDateSort.value = null
  }
  updatedSort.value = null
  applySorting()
}

function toggleUpdatedSort() {
  if (updatedSort.value === 'DESC') {
    updatedSort.value = 'ASC'
  } else {
    updatedSort.value = 'DESC'
  }
  dueDateSort.value = null
  applySorting()
}

async function applySorting() {
  // Apply sorting through the store's fetchObjectives with sort params
  // We'll need to temporarily store sort params and use them in fetch
  const currentFilters = { ...objectivesStore.filters }
  
  if (dueDateSort.value) {
    currentFilters.sortBy = 'due_date'
    currentFilters.sortOrder = dueDateSort.value
  } else if (updatedSort.value) {
    currentFilters.sortBy = 'updated_at'
    currentFilters.sortOrder = updatedSort.value
  }

  // Use direct API call with all filters and sort params
  const params = {}
  if (currentFilters.status) params.status = currentFilters.status
  if (currentFilters.tag) params.tag = currentFilters.tag
  if (currentFilters.search) params.search = currentFilters.search
  if (currentFilters.owner_id) params.owner_id = currentFilters.owner_id
  if (currentFilters.department_id) params.department_id = currentFilters.department_id
  if (currentFilters.sortBy) params.sortBy = currentFilters.sortBy
  if (currentFilters.sortOrder) params.sortOrder = currentFilters.sortOrder

  try {
    const response = await api.get('/objectives', { params })
    objectivesStore.objectives = response.data.map(obj => ({
      ...obj,
      tags: obj.tags || []
    }))
  } catch (error) {
    console.error('Error fetching sorted objectives:', error)
  }
}

function getOwner(ownerId) {
  return usersStore.getUserById(ownerId)
}

function navigateToObjective(objectiveId) {
  router.push(`/objectives/${objectiveId}`)
}

function editSelectedObjective() {
  if (selectedObjectives.value.length === 1) {
    const objective = objectivesStore.objectives.find(obj => obj.id === selectedObjectives.value[0])
    if (objective) {
      editObjective(objective)
    }
  }
}

async function deleteSelectedObjective() {
  if (selectedObjectives.value.length === 1) {
    await deleteObjective(selectedObjectives.value[0])
    selectedObjectives.value = []
  }
}

function handleBulkAction() {
  if (bulkAction.value === 'delete') {
    bulkDelete()
  }
  bulkAction.value = ''
}

async function handleBulkEditSaved() {
  await objectivesStore.fetchObjectives()
  await objectivesStore.fetchTags()
  // Optionally switch back to table view after saving
  // viewMode.value = 'table'
}

async function handleBulkEditUpdated() {
  await objectivesStore.fetchObjectives()
  await objectivesStore.fetchTags()
}

async function updateOwner(objectiveId, ownerId) {
  try {
    await objectivesStore.updateObjective(objectiveId, {
      owner_id: ownerId || null
    })
    await objectivesStore.fetchObjectives()
  } catch (error) {
    console.error('Error updating owner:', error)
    alert('Error updating owner. Please try again.')
  }
}

onUnmounted(() => {
  // Clear any pending search timeouts
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
})
</script>

