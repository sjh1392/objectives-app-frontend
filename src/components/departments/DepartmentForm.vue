<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h2 class="text-2xl font-bold mb-6">{{ isEditing ? 'Edit Department' : 'Add New Department' }}</h2>
    
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Name *</label>
        <input
          v-model="formData.name"
          type="text"
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          v-model="formData.description"
          rows="3"
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        ></textarea>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Manager</label>
        <select
          v-model="formData.manager_id"
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
        >
          <option :value="null">No Manager</option>
          <option v-for="user in managers" :key="user.id" :value="user.id">
            {{ user.name }}
          </option>
        </select>
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

const props = defineProps({
  department: {
    type: Object,
    default: null
  },
  users: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['submit', 'cancel'])

const isEditing = computed(() => !!props.department)

const formData = ref({
  name: '',
  description: '',
  manager_id: null
})

const managers = computed(() => {
  return props.users.filter(user => 
    user.role === 'Manager' || user.role === 'Admin'
  )
})

watch(() => props.department, (newDepartment) => {
  if (newDepartment) {
    formData.value = {
      name: newDepartment.name || '',
      description: newDepartment.description || '',
      manager_id: newDepartment.manager_id || null
    }
  } else {
    formData.value = {
      name: '',
      description: '',
      manager_id: null
    }
  }
}, { immediate: true })

function handleSubmit() {
  emit('submit', { ...formData.value })
}
</script>

