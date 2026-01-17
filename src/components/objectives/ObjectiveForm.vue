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
          <label class="block text-sm font-medium text-gray-700 mb-1">Department</label>
          <select
            v-model="formData.department_id"
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select Department</option>
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
import { ref, computed, watch } from 'vue'
import { useUsersStore } from '../../stores/users'

const props = defineProps({
  objective: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['submit', 'cancel'])

const usersStore = useUsersStore()
const isEditing = computed(() => !!props.objective)

const formData = ref({
  title: '',
  description: '',
  status: 'Active',
  priority: 'Medium',
  start_date: '',
  due_date: '',
  target_value: null,
  current_value: null,
  owner_id: '',
  department_id: '',
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
      start_date: '',
      due_date: '',
      target_value: null,
      current_value: null,
      owner_id: '',
      department_id: '',
      tags: []
    }
  }
}, { immediate: true })

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

