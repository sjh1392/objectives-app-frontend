<template>
  <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
    <div class="flex justify-between items-start mb-4">
      <div class="flex-1">
        <h3 class="text-lg font-semibold text-gray-900 mb-1">
          <router-link :to="`/objectives/${objective.id}`" class="hover:text-primary-600">
            {{ objective.title }}
          </router-link>
        </h3>
        <p class="text-sm text-gray-600 line-clamp-2">{{ objective.description }}</p>
      </div>
      <span
        class="ml-4 px-3 py-1 rounded-full text-xs font-semibold"
        :class="statusColorClass"
      >
        {{ objective.status }}
      </span>
    </div>

    <ProgressBar
      :percentage="Math.round(objective.progress_percentage || 0)"
      :label="`${objective.current_value || 0} / ${objective.target_value || 0}`"
      class="mb-4"
    />

    <div class="flex flex-wrap gap-2 mb-4">
      <Tag v-for="tag in objective.tags" :key="tag" :tag="tag" />
    </div>

    <div class="mb-4">
      <div v-if="owner" class="flex items-center text-sm">
        <span class="text-gray-600 mr-2">Owner:</span>
        <router-link
          :to="`/people/${objective.owner_id}`"
          class="text-primary-600 hover:text-primary-800 font-medium"
        >
          {{ owner.name }}
        </router-link>
      </div>
      <div v-else class="text-sm text-gray-400 italic">No owner assigned</div>
    </div>

    <div class="flex justify-between items-center text-sm text-gray-500">
      <span>{{ formatDate(objective.due_date) }}</span>
      <span class="capitalize">{{ objective.priority }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUsersStore } from '../../stores/users'
import ProgressBar from '../common/ProgressBar.vue'
import Tag from '../common/Tag.vue'

const props = defineProps({
  objective: {
    type: Object,
    required: true
  }
})

const usersStore = useUsersStore()
const owner = computed(() => {
  if (!props.objective.owner_id) return null
  return usersStore.getUserById(props.objective.owner_id)
})

const statusColorClass = computed(() => {
  const statusColors = {
    'Active': 'bg-green-100 text-green-800',
    'Completed': 'bg-blue-100 text-blue-800',
    'On Hold': 'bg-yellow-100 text-yellow-800',
    'Draft': 'bg-gray-100 text-gray-800',
    'Cancelled': 'bg-red-100 text-red-800'
  }
  return statusColors[props.objective.status] || 'bg-gray-100 text-gray-800'
})

function formatDate(dateString) {
  if (!dateString) return 'No due date'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

