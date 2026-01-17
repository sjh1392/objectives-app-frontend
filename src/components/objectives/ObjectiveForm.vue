<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h2 class="text-2xl font-bold mb-6">{{ isEditing ? 'Edit Objective' : 'Create New Objective' }}</h2>
    
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Title *</label>
        <input
          v-model="formData.title"
          type="text"
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          v-model="formData.description"
          rows="4"
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        ></textarea>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            v-model="formData.status"
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
          >
            <option value="Draft">Draft</option>
            <option value="Active">Active</option>
            <option value="On Hold">On Hold</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select
            v-model="formData.priority"
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <input
            v-model="formData.start_date"
            type="date"
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
          <input
            v-model="formData.due_date"
            type="date"
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
          />
          <button
            type="button"
            @click="setEndOfQuarter"
            class="mt-1 text-xs text-primary-600 hover:text-primary-800 underline"
          >
            End of Quarter
          </button>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Target Value</label>
          <input
            v-model.number="formData.target_value"
            type="number"
            step="0.01"
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Current Value</label>
          <input
            v-model.number="formData.current_value"
            type="number"
            step="0.01"
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Owner</label>
          <select
            v-model="formData.owner_id"
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select Owner</option>
            <option v-for="user in users" :key="user.id" :value="user.id">
              {{ user.name }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Team</label>
          <select
            v-model="formData.department_id"
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select Team</option>
            <option v-for="dept in departments" :key="dept.id" :value="dept.id">
              {{ dept.name }}
            </option>
          </select>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Tags</label>
        <div class="flex flex-wrap gap-2 mb-2">
          <span
            v-for="tag in formData.tags"
            :key="tag"
            @click="removeTag(tag)"
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer hover:opacity-75 text-gray-700 border border-gray-300"
          >
            {{ tag }}
            <span class="ml-1">×</span>
          </span>
        </div>
        <input
          v-model="tagInput"
          type="text"
          placeholder="Type a tag and press Enter"
          @keydown.enter.prevent="addTag"
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
        />
        <p class="text-xs text-gray-500 mt-1">Press Enter to add a tag, click a tag to remove it</p>
      </div>

      <div class="flex justify-end gap-4">
        <button
          type="button"
          @click="$emit('cancel')"
          class="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          class="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          {{ isEditing ? 'Update' : 'Create' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useUsersStore } from '../../stores/users'
import { useAuthStore } from '../../stores/auth'

const props = defineProps({
  objective: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['submit', 'cancel'])

const usersStore = useUsersStore()
const authStore = useAuthStore()
const isEditing = computed(() => !!props.objective)

// Get current user ID as default owner
const getCurrentUserId = () => {
  return authStore.currentUserId || authStore.currentUser?.id || ''
}

// Get current user's team/department ID
const getCurrentUserTeamId = () => {
  const currentUserId = getCurrentUserId()
  if (!currentUserId) return ''
  
  // Find the current user in the users store to get their department/team
  const currentUser = usersStore.getUserById(currentUserId)
  return currentUser?.department || ''
}

function getToday() {
  return new Date().toISOString().split('T')[0]
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

const formData = ref({
  title: '',
  description: '',
  status: 'Active',
  priority: 'Medium',
  start_date: getToday(), // Default to today
  due_date: '',
  target_value: 100, // Default target value
  current_value: 0, // Default current value
  owner_id: getCurrentUserId(), // Default to current user
  department_id: getCurrentUserTeamId(), // Default to current user's team
  tags: []
})

const tagInput = ref('')

const users = computed(() => usersStore.users)
const departments = computed(() => usersStore.departments)

watch(() => props.objective, (newObjective) => {
  if (newObjective) {
    formData.value = {
      title: newObjective.title || '',
      description: newObjective.description || '',
      status: newObjective.status || 'Active',
      priority: newObjective.priority || 'Medium',
      start_date: newObjective.start_date || '',
      due_date: newObjective.due_date || '',
      target_value: newObjective.target_value || null,
      current_value: newObjective.current_value || null,
      owner_id: newObjective.owner_id || '',
      department_id: newObjective.department_id || '',
      tags: newObjective.tags || []
    }
  } else {
    // Reset form when creating new objective
    formData.value = {
      title: '',
      description: '',
      status: 'Active',
      priority: 'Medium',
      start_date: getToday(), // Default to today
      due_date: '',
      target_value: 100, // Default target value
      current_value: 0, // Default current value
      owner_id: getCurrentUserId(), // Default to current user
      department_id: getCurrentUserTeamId(), // Default to current user's team
      tags: []
    }
  }
}, { immediate: true })

onMounted(async () => {
  // Ensure auth store is loaded
  if (!authStore.currentUser) {
    authStore.loadFromStorage()
  }
  
  // Ensure users are loaded so we can get the current user's team
  if (usersStore.users.length === 0) {
    await usersStore.fetchUsers()
  }
  
  // Set defaults if creating new objective
  if (!isEditing.value) {
    if (!formData.value.owner_id) {
      formData.value.owner_id = getCurrentUserId()
    }
    if (!formData.value.department_id) {
      formData.value.department_id = getCurrentUserTeamId()
    }
    // Ensure target and current values are set
    if (formData.value.target_value === null || formData.value.target_value === undefined) {
      formData.value.target_value = 100
    }
    if (formData.value.current_value === null || formData.value.current_value === undefined) {
      formData.value.current_value = 0
    }
  }
})

function setEndOfQuarter() {
  formData.value.due_date = getEndOfQuarter()
}

function addTag() {
  const tag = tagInput.value.trim()
  if (tag && !formData.value.tags.includes(tag)) {
    formData.value.tags.push(tag)
    tagInput.value = ''
  }
}

function removeTag(tag) {
  formData.value.tags = formData.value.tags.filter(t => t !== tag)
}

function handleSubmit() {
  // Convert empty strings to null for optional fields
  const submitData = {
    ...formData.value,
    owner_id: formData.value.owner_id || null,
    department_id: formData.value.department_id || null
  }
  emit('submit', submitData)
}
</script>

