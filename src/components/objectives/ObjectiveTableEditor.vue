<template>
  <div class="bg-white rounded-lg shadow-md overflow-hidden">
    <div class="p-4 bg-gray-50 border-b flex justify-between items-center">
      <h3 class="text-lg font-semibold text-gray-900">Objectives</h3>
      <button
        @click="addNewRow"
        class="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm font-medium"
      >
        {{ simplified ? '+ Add Objective' : '+ Add Row' }}
      </button>
    </div>

    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
              Title *
            </th>
            <th v-if="!simplified" scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Description
            </th>
            <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Owner *
            </th>
            <th v-if="!simplified" scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Team
            </th>
            <th v-if="!simplified" scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th v-if="!simplified" scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Priority
            </th>
            <th v-if="!simplified" scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Start Date
            </th>
            <th v-if="!simplified" scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Due Date
            </th>
            <th v-if="!simplified" scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Current Value
            </th>
            <th v-if="!simplified" scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Target Value
            </th>
            <th scope="col" class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr
            v-for="(row, index) in tableData"
            :key="row._tempId || row.id"
            :class="[
              'hover:bg-gray-50',
              !row.id && 'bg-blue-50'
            ]"
          >
            <!-- Title -->
            <td class="px-4 py-3 whitespace-nowrap sticky left-0 bg-white z-10">
              <input
                v-model="row.title"
                type="text"
                :data-row-id="row._tempId || row.id"
                data-field="title"
                :data-row-index="index"
                placeholder="Enter title..."
                required
                class="w-full px-2 py-1 text-sm bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-primary-500 rounded"
                :class="{ 'bg-red-50': !row.title && row._hasChanges }"
                @keydown="handleKeydown($event, index, 'title')"
              />
            </td>

            <!-- Description -->
            <td v-if="!simplified" class="px-4 py-3">
              <textarea
                v-model="row.description"
                :data-row-id="row._tempId || row.id"
                data-field="description"
                :data-row-index="index"
                placeholder="Enter description..."
                rows="2"
                class="w-full px-2 py-1 text-sm bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-primary-500 rounded resize-none"
                @keydown="handleKeydown($event, index, 'description')"
              ></textarea>
            </td>

            <!-- Owner -->
            <td class="px-4 py-3 whitespace-nowrap">
              <select
                v-model="row.owner_id"
                :data-row-id="row._tempId || row.id"
                data-field="owner"
                :data-row-index="index"
                required
                class="w-full px-2 py-1 text-sm bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-primary-500 rounded appearance-none cursor-pointer"
                :class="{ 'bg-red-50': !row.owner_id && row._hasChanges }"
                @keydown="handleKeydown($event, index, 'owner')"
              >
                <option value="">Select Owner *</option>
                <option v-for="user in users" :key="user.id" :value="user.id">
                  {{ user.name }}
                </option>
              </select>
            </td>

            <!-- Team -->
            <td v-if="!simplified" class="px-4 py-3 whitespace-nowrap">
              <select
                v-model="row.team_id"
                :data-row-id="row._tempId || row.id"
                data-field="team"
                :data-row-index="index"
                class="w-full px-2 py-1 text-sm bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-primary-500 rounded appearance-none cursor-pointer"
                @keydown="handleKeydown($event, index, 'team')"
              >
                <option value="">Select...</option>
                <option v-for="team in teams" :key="team.id" :value="team.id">
                  {{ team.name }}
                </option>
              </select>
            </td>

            <!-- Status -->
            <td v-if="!simplified" class="px-4 py-3 whitespace-nowrap">
              <select
                v-model="row.status"
                :data-row-id="row._tempId || row.id"
                data-field="status"
                :data-row-index="index"
                class="w-full px-2 py-1 text-sm bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-primary-500 rounded appearance-none cursor-pointer"
                @keydown="handleKeydown($event, index, 'status')"
              >
                <option value="Draft">Draft</option>
                <option value="Active">Active</option>
                <option value="On Hold">On Hold</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </td>

            <!-- Priority -->
            <td v-if="!simplified" class="px-4 py-3 whitespace-nowrap">
              <select
                v-model="row.priority"
                :data-row-id="row._tempId || row.id"
                data-field="priority"
                :data-row-index="index"
                class="w-full px-2 py-1 text-sm bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-primary-500 rounded appearance-none cursor-pointer"
                @keydown="handleKeydown($event, index, 'priority')"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </td>

            <!-- Start Date -->
            <td v-if="!simplified" class="px-4 py-3 whitespace-nowrap">
              <input
                v-model="row.start_date"
                type="date"
                :data-row-id="row._tempId || row.id"
                data-field="start_date"
                :data-row-index="index"
                class="w-full px-2 py-1 text-sm bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-primary-500 rounded"
                @keydown="handleKeydown($event, index, 'start_date')"
              />
            </td>

            <!-- Due Date -->
            <td v-if="!simplified" class="px-4 py-3 whitespace-nowrap">
              <div class="flex flex-col">
                <input
                  v-model="row.due_date"
                  type="date"
                  :data-row-id="row._tempId || row.id"
                  data-field="due_date"
                  :data-row-index="index"
                  class="w-full px-2 py-1 text-sm bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-primary-500 rounded"
                  @keydown="handleKeydown($event, index, 'due_date')"
                />
                <button
                  type="button"
                  @click="row.due_date = getEndOfQuarter()"
                  class="mt-0.5 text-xs text-primary-600 hover:text-primary-800 underline text-left"
                >
                  End of Quarter
                </button>
              </div>
            </td>

            <!-- Current Value -->
            <td v-if="!simplified" class="px-4 py-3 whitespace-nowrap">
              <input
                v-model.number="row.current_value"
                type="number"
                step="0.01"
                placeholder="0.00"
                :data-row-id="row._tempId || row.id"
                data-field="current_value"
                :data-row-index="index"
                class="w-full px-2 py-1 text-sm bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-primary-500 rounded"
                @keydown="handleKeydown($event, index, 'current_value')"
              />
            </td>

            <!-- Target Value -->
            <td v-if="!simplified" class="px-4 py-3 whitespace-nowrap">
              <input
                v-model.number="row.target_value"
                type="number"
                step="0.01"
                placeholder="0.00"
                :data-row-id="row._tempId || row.id"
                data-field="target_value"
                :data-row-index="index"
                class="w-full px-2 py-1 text-sm bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-primary-500 rounded"
                @keydown="handleKeydown($event, index, 'target_value')"
              />
            </td>

            <!-- Actions -->
            <td class="px-4 py-3 whitespace-nowrap text-center">
              <button
                v-if="row.id"
                @click="removeRow(index)"
                class="text-red-600 hover:text-red-800 text-sm"
                title="Remove"
              >
                ×
              </button>
              <button
                v-else
                @click="removeRow(index)"
                class="text-red-600 hover:text-red-800 text-sm"
                title="Cancel"
              >
                ×
              </button>
            </td>
          </tr>

          <!-- Empty state -->
          <tr v-if="tableData.length === 0">
            <td :colspan="simplified ? 3 : 11" class="px-4 py-8 text-center text-gray-500">
              No objectives yet. Click "+ Add Row" to create one.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="p-4 bg-gray-50 border-t flex justify-between items-center">
      <div class="text-sm text-gray-600">
        {{ tableData.length }} objective(s)
        <span v-if="unsavedCount > 0" class="ml-2 text-orange-600">
          ({{ unsavedCount }} unsaved)
        </span>
      </div>
      <div class="flex gap-2">
        <button
          @click="discardChanges"
          :disabled="unsavedCount === 0"
          class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          Discard Changes
        </button>
        <button
          @click="saveAll"
          :disabled="unsavedCount === 0 || saving"
          class="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {{ saving ? 'Saving...' : `Save All (${unsavedCount})` }}
        </button>
      </div>
    </div>

    <!-- Messages -->
    <div v-if="successMessage" class="mx-4 mt-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-800 text-sm">
      {{ successMessage }}
    </div>
    <div v-if="errorMessage" class="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useUsersStore } from '../../stores/users'
import { useAuthStore } from '../../stores/auth'
import api from '../../services/api'

const emit = defineEmits(['saved', 'data-updated'])

const props = defineProps({
  objectives: {
    type: Array,
    default: () => []
  },
  simplified: {
    type: Boolean,
    default: false // When true, only show Title and Owner columns
  },
  hideExisting: {
    type: Boolean,
    default: false // When true, hide existing objectives (only show new rows being added)
  }
})

const usersStore = useUsersStore()
const authStore = useAuthStore()
const tableData = ref([])
const originalData = ref([])
const saving = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
let tempIdCounter = 0

const users = computed(() => usersStore.users)
const teams = computed(() => {
  // Try teams first, fallback to departments for backward compatibility
  return usersStore.teams && usersStore.teams.length > 0 
    ? usersStore.teams 
    : usersStore.departments || []
})

const unsavedCount = computed(() => {
  return tableData.value.filter(row => {
    if (!row.id) {
      // New row - must have both title and owner to be considered for saving
      return row.title && row.owner_id
    } else {
      // Existing row - check if it changed
      const original = originalData.value.find(o => o.id === row.id)
      if (!original) return true
      return JSON.stringify(normalizeRow(row)) !== JSON.stringify(normalizeRow(original))
    }
  }).length
})

function normalizeRow(row) {
  // Normalize empty strings to null for optional fields
  const normalizeValue = (val) => {
    if (val === '' || val === undefined) return null
    return val
  }

  // Use team_id if available, otherwise department_id
  const teamOrDeptId = row.team_id || row.department_id
  const normalizedTeamId = normalizeValue(teamOrDeptId)

  return {
    id: row.id,
    title: row.title || '',
    description: row.description || '',
    owner_id: normalizeValue(row.owner_id),
    team_id: normalizedTeamId, // Send team_id to backend
    status: row.status || 'Active',
    priority: row.priority || 'Medium',
    start_date: normalizeValue(row.start_date),
    due_date: normalizeValue(row.due_date),
    target_value: normalizeValue(row.target_value),
    current_value: normalizeValue(row.current_value),
    tags: row.tags || []
  }
}

function initializeData() {
  // Filter objectives if hideExisting is true (only show new objectives being created)
  const objectivesToShow = props.hideExisting 
    ? [] // Don't show any existing objectives
    : props.objectives
  
  // Convert objectives to table format
  tableData.value = objectivesToShow.map(obj => ({
    id: obj.id,
    title: obj.title || '',
    description: obj.description || '',
    owner_id: obj.owner_id || '',
    team_id: obj.team_id || obj.department_id || '',
    department_id: obj.team_id || obj.department_id || '', // Keep for backward compatibility
    status: obj.status || 'Active',
    priority: obj.priority || 'Medium',
    start_date: obj.start_date || getToday(), // Default to today if empty
    due_date: obj.due_date || '',
    target_value: obj.target_value || null,
    current_value: obj.current_value || null,
    tags: obj.tags || [],
    _hasChanges: false
  }))
  
  // Deep copy for comparison
  originalData.value = JSON.parse(JSON.stringify(tableData.value))
}

function getEndOfQuarter() {
  const now = new Date()
  const currentMonth = now.getMonth() // 0-11
  const currentYear = now.getFullYear()
  
  // Calculate which quarter we're in (0-3)
  const quarter = Math.floor(currentMonth / 3)
  
  // Calculate the last month of the current quarter
  const lastMonthOfQuarter = (quarter + 1) * 3 - 1 // 2, 5, 8, or 11
  
  // Create date for last day of current quarter
  const endOfQuarter = new Date(currentYear, lastMonthOfQuarter + 1, 0) // Day 0 = last day of previous month
  
  // Format as YYYY-MM-DD
  return endOfQuarter.toISOString().split('T')[0]
}

function getToday() {
  return new Date().toISOString().split('T')[0]
}

function addNewRow() {
  // Get current user ID as default owner
  const currentUserId = authStore.currentUserId || authStore.currentUser?.id
  
  // Get current user's team/department
  let currentUserTeamId = ''
  if (currentUserId) {
    const currentUser = usersStore.getUserById(currentUserId)
    currentUserTeamId = currentUser?.department || ''
  }
  
  const newRow = {
    _tempId: `temp-${tempIdCounter++}`,
    title: '',
    description: '',
    owner_id: currentUserId || '', // Default to current user
    team_id: currentUserTeamId, // Default to current user's team
    department_id: currentUserTeamId, // Keep for backward compatibility
    status: 'Active',
    priority: 'Medium',
    start_date: getToday(), // Default to today
    due_date: getEndOfQuarter(), // Default to end of current quarter
    target_value: 100, // Default target value
    current_value: 0, // Default current value
    tags: [],
    _hasChanges: true
  }
  
  // Add to bottom of list
  tableData.value.push(newRow)
  
  // Focus the title field of the new row after a brief delay
  setTimeout(() => {
    const titleInput = document.querySelector(`input[data-row-id="${newRow._tempId}"][data-field="title"]`)
    if (titleInput) {
      titleInput.focus()
      titleInput.select()
      // Scroll to the new row
      titleInput.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, 50)
}

function removeRow(index) {
  const row = tableData.value[index]
  if (row.id) {
    // Mark existing row for deletion - could implement soft delete here
    if (confirm('Are you sure you want to remove this objective?')) {
      tableData.value.splice(index, 1)
    }
  } else {
    // Just remove new row
    tableData.value.splice(index, 1)
  }
}

async function saveAll() {
  if (saving.value) return
  
  // Validate required fields - title and owner are required for new objectives
  const invalidRows = tableData.value.filter(row => {
    if (!row.id) {
      // New rows must have both title and owner
      return !row.title || !row.owner_id
    }
    // Existing rows must have title
    return !row.title
  })
  
  if (invalidRows.length > 0) {
    const newRowsMissing = invalidRows.filter(r => !r.id && (!r.title || !r.owner_id))
    const existingRowsMissing = invalidRows.filter(r => r.id && !r.title)
    
    let errorMsg = ''
    if (newRowsMissing.length > 0) {
      errorMsg = `Please provide both title and owner for ${newRowsMissing.length} new objective(s).`
    }
    if (existingRowsMissing.length > 0) {
      errorMsg += (errorMsg ? ' ' : '') + `Please provide titles for ${existingRowsMissing.length} existing objective(s).`
    }
    
    errorMessage.value = errorMsg
    setTimeout(() => { errorMessage.value = '' }, 5000)
    return
  }

  saving.value = true
  successMessage.value = ''
  errorMessage.value = ''

  try {
    const newRows = tableData.value.filter(row => !row.id)
    const updatedRows = tableData.value.filter(row => {
      if (!row.id) return false
      const original = originalData.value.find(o => o.id === row.id)
      if (!original) return false
      return JSON.stringify(normalizeRow(row)) !== JSON.stringify(normalizeRow(original))
    })

    // Save new objectives
    for (const row of newRows) {
      // Skip rows missing required fields (shouldn't happen due to validation, but safety check)
      if (!row.title || !row.owner_id) continue
      
      const data = normalizeRow(row)
      // Remove id if present (shouldn't be for new rows, but just in case)
      if (data.id) {
        delete data.id
      }
      
      try {
        const response = await api.post('/objectives', data)
        // Replace temp row with saved row
        const index = tableData.value.findIndex(r => r._tempId === row._tempId)
        if (index !== -1) {
          const saved = response.data
          tableData.value[index] = {
            ...saved,
            team_id: saved.team_id || saved.department_id || '',
            department_id: saved.team_id || saved.department_id || ''
          }
          delete tableData.value[index]._tempId
        }
      } catch (error) {
        console.error('Error creating objective:', error)
        console.error('Data sent:', data)
        const errorMsg = error.response?.data?.error || error.message || 'Unknown error'
        throw new Error(`Failed to create objective "${row.title}": ${errorMsg}`)
      }
    }

    // Update existing objectives
    for (const row of updatedRows) {
      const data = normalizeRow(row)
      // Don't send id in the body for updates
      const updateData = { ...data }
      delete updateData.id
      
      try {
        await api.put(`/objectives/${row.id}`, updateData)
      } catch (error) {
        console.error('Error updating objective:', error)
        console.error('Data sent:', updateData)
        const errorMsg = error.response?.data?.error || error.message || 'Unknown error'
        throw new Error(`Failed to update objective "${row.title}": ${errorMsg}`)
      }
    }

    // Refresh original data
    originalData.value = JSON.parse(JSON.stringify(tableData.value))
    
    successMessage.value = `Successfully saved ${newRows.length + updatedRows.length} objective(s)!`
    setTimeout(() => { successMessage.value = '' }, 5000)
    
    emit('saved')
    emit('data-updated')
  } catch (error) {
    const errorMsg = error.message || error.response?.data?.error || 'Failed to save objectives. Please try again.'
    errorMessage.value = errorMsg
    console.error('Error saving objectives:', error)
    console.error('Full error object:', error)
    if (error.response) {
      console.error('Response status:', error.response.status)
      console.error('Response data:', error.response.data)
    }
    setTimeout(() => { errorMessage.value = '' }, 8000)
  } finally {
    saving.value = false
  }
}

function discardChanges() {
  if (confirm('Are you sure you want to discard all unsaved changes?')) {
    initializeData()
  }
}

// Define field order for navigation (simplified and full versions)
const simplifiedFields = ['title', 'owner']
const fullFields = ['title', 'description', 'owner', 'team', 'status', 'priority', 'start_date', 'due_date', 'current_value', 'target_value']

function getFieldOrder() {
  return props.simplified ? simplifiedFields : fullFields
}

function handleKeydown(event, rowIndex, currentField) {
  const fields = getFieldOrder()
  const currentFieldIndex = fields.indexOf(currentField)
  
  if (event.key === 'Tab') {
    event.preventDefault()
    
    if (event.shiftKey) {
      // Shift+Tab: move to previous field
      if (currentFieldIndex > 0) {
        navigateToField(rowIndex, fields[currentFieldIndex - 1])
      } else if (rowIndex > 0) {
        // Move to last field of previous row
        const prevRowFields = getFieldOrder()
        navigateToField(rowIndex - 1, prevRowFields[prevRowFields.length - 1])
      }
    } else {
      // Tab: move to next field
      if (currentFieldIndex < fields.length - 1) {
        navigateToField(rowIndex, fields[currentFieldIndex + 1])
      } else if (rowIndex < tableData.value.length - 1) {
        // Move to first field of next row
        navigateToField(rowIndex + 1, fields[0])
      } else {
        // At end, add new row and focus title
        addNewRow()
      }
    }
  } else if (event.key === 'Enter' && event.target.tagName !== 'TEXTAREA') {
    event.preventDefault()
    // Enter: move to next row, same field
    if (rowIndex < tableData.value.length - 1) {
      navigateToField(rowIndex + 1, currentField)
    } else {
      // At last row, add new row and focus same field
      addNewRow()
      setTimeout(() => {
        const lastIndex = tableData.value.length - 1
        navigateToField(lastIndex, currentField)
      }, 50)
    }
  } else if (event.key === 'ArrowRight') {
    if (event.target.selectionStart === event.target.value?.length || event.target.tagName === 'SELECT') {
      event.preventDefault()
      // Move to next field if at end of input
      if (currentFieldIndex < fields.length - 1) {
        navigateToField(rowIndex, fields[currentFieldIndex + 1])
      }
    }
  } else if (event.key === 'ArrowLeft') {
    if (event.target.selectionStart === 0 || event.target.tagName === 'SELECT') {
      event.preventDefault()
      // Move to previous field if at start of input
      if (currentFieldIndex > 0) {
        navigateToField(rowIndex, fields[currentFieldIndex - 1])
      }
    }
  } else if (event.key === 'ArrowDown') {
    if (event.target.tagName === 'SELECT' || event.target.tagName === 'TEXTAREA') {
      // Allow default behavior for selects and textareas
      return
    }
    event.preventDefault()
    // Move down to same field in next row
    if (rowIndex < tableData.value.length - 1) {
      navigateToField(rowIndex + 1, currentField)
    } else {
      // Add new row if at bottom
      addNewRow()
      setTimeout(() => {
        const lastIndex = tableData.value.length - 1
        navigateToField(lastIndex, currentField)
      }, 50)
    }
  } else if (event.key === 'ArrowUp') {
    if (event.target.tagName === 'SELECT' || event.target.tagName === 'TEXTAREA') {
      // Allow default behavior for selects and textareas
      return
    }
    event.preventDefault()
    // Move up to same field in previous row
    if (rowIndex > 0) {
      navigateToField(rowIndex - 1, currentField)
    }
  }
}

function navigateToField(rowIndex, fieldName) {
  const rowId = tableData.value[rowIndex]?._tempId || tableData.value[rowIndex]?.id
  if (!rowId) return
  
  setTimeout(() => {
    const field = document.querySelector(`[data-row-id="${rowId}"][data-field="${fieldName}"]`)
    if (field) {
      field.focus()
      if (field.tagName === 'INPUT' && field.type !== 'date' && field.type !== 'number') {
        field.select()
      }
    }
  }, 10)
}

watch(() => props.objectives, () => {
  initializeData()
}, { immediate: true, deep: true })

onMounted(async () => {
  // Ensure auth store is loaded
  if (!authStore.currentUser) {
    authStore.loadFromStorage()
  }
  
  await usersStore.fetchUsers()
  // Try to fetch teams, fallback to departments
  try {
    if (usersStore.fetchTeams) {
      await usersStore.fetchTeams()
    } else {
      await usersStore.fetchDepartments()
    }
  } catch (error) {
    // Fallback to departments
    await usersStore.fetchDepartments()
  }
  initializeData()
})
</script>

<style scoped>
/* Make first column sticky */
thead th:first-child,
tbody td:first-child {
  position: sticky;
  left: 0;
  z-index: 10;
}

thead th:first-child {
  z-index: 20;
}

/* Ensure sticky columns have proper background */
thead th:first-child {
  background-color: rgb(249 250 251); /* bg-gray-50 */
}

tbody td:first-child {
  background-color: white;
}

tbody tr:hover td:first-child {
  background-color: rgb(249 250 251); /* hover:bg-gray-50 */
}

tbody tr.bg-blue-50 td:first-child {
  background-color: rgb(239 246 255); /* bg-blue-50 */
}

/* Hide input borders and make them blend with table */
tbody td input,
tbody td select,
tbody td textarea {
  transition: background-color 0.15s ease;
}

tbody td input:focus,
tbody td select:focus,
tbody td textarea:focus {
  background-color: rgba(249, 250, 251, 0.8);
}

/* Style for select dropdowns */
tbody td select {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.25rem center;
  background-repeat: no-repeat;
  background-size: 1.25em 1.25em;
  padding-right: 2rem;
}

tbody td select:focus {
  background-color: rgba(249, 250, 251, 0.8);
}

/* Hover state for table cells with inputs */
tbody tr:hover td input,
tbody tr:hover td select,
tbody tr:hover td textarea {
  background-color: rgba(249, 250, 251, 0.5);
}

/* Remove default date input styling */
tbody td input[type="date"]::-webkit-calendar-picker-indicator {
  cursor: pointer;
  opacity: 0.6;
}

tbody td input[type="date"]::-webkit-calendar-picker-indicator:hover {
  opacity: 1;
}
</style>

