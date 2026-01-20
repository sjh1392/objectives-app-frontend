<template>
  <AppLayout>
    <div class="max-w-full">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-900">Timeline</h1>
        <div class="flex items-center gap-3">
          <!-- View Mode Selector -->
          <div class="flex border border-gray-300 rounded-md overflow-hidden">
            <button
              v-for="mode in viewModes"
              :key="mode.value"
              @click="changeViewMode(mode.value)"
              :class="viewMode === mode.value ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'"
              class="px-4 py-2 text-sm font-medium transition-colors"
            >
              {{ mode.label }}
            </button>
          </div>
          <select
            v-model="selectedQuarter"
            @change="updateQuarter"
            class="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
          >
            <option v-for="quarter in availableQuarters" :key="quarter.value" :value="quarter.value">
              {{ quarter.label }}
            </option>
          </select>
          <button
            @click="goToCurrentPeriod"
            class="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Current {{ viewMode === 'day' ? 'Day' : viewMode === 'week' ? 'Week' : 'Quarter' }}
          </button>
        </div>
      </div>

      <div v-if="objectivesStore.loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>

      <div v-else class="bg-white rounded-lg shadow-md overflow-hidden">
        <div ref="ganttContainer" class="gantt-container"></div>
        <div v-if="ganttTasks.length === 0" class="p-12 text-center text-gray-500">
          <p>No objectives with dates found for this quarter.</p>
          <p class="text-sm mt-2">Create objectives with start and due dates to see them on the timeline.</p>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useObjectivesStore } from '../stores/objectives'
import AppLayout from '../components/layout/AppLayout.vue'
import api from '../services/api'
import { gantt } from 'dhtmlx-gantt'
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css'

const objectivesStore = useObjectivesStore()
const ganttContainer = ref(null)
let ganttInitialized = false
let isUpdating = false

// View mode and period selection
const viewMode = ref('day') // 'day', 'week', or 'month'
const viewModes = [
  { value: 'day', label: 'Days' },
  { value: 'week', label: 'Weeks' },
  { value: 'month', label: 'Months' }
]

const selectedQuarter = ref(getCurrentQuarter())
const quarterStart = ref(null)
const quarterEnd = ref(null)

// Convert objectives to Gantt tasks format
const ganttTasks = computed(() => {
  if (!quarterStart.value || !quarterEnd.value) return []
  
  return objectivesStore.objectives
    .filter(obj => {
      if (!obj.start_date && !obj.due_date) return false
      
      const objStart = obj.start_date ? new Date(obj.start_date) : null
      const objEnd = obj.due_date ? new Date(obj.due_date) : null
      
      if (!objStart && !objEnd) return false
      
      const quarterStartTime = quarterStart.value.getTime()
      const quarterEndTime = quarterEnd.value.getTime()
      
      const startsBeforeQuarterEnd = !objStart || objStart.getTime() <= quarterEndTime
      const endsAfterQuarterStart = !objEnd || objEnd.getTime() >= quarterStartTime
      
      return startsBeforeQuarterEnd && endsAfterQuarterStart
    })
    .map(obj => {
      const startDate = obj.start_date || quarterStart.value.toISOString().split('T')[0]
      const dueDate = obj.due_date || quarterEnd.value.toISOString().split('T')[0]
      
      return {
        id: obj.id,
        text: obj.title,
        start_date: startDate,
        end_date: dueDate,
        progress: (obj.progress_percentage || 0) / 100,
        color: getStatusColor(obj.status),
        status: obj.status
      }
    })
})

function getStatusColor(status) {
  const statusColors = {
    'Active': '#3b82f6',
    'Completed': '#10b981',
    'On Hold': '#f59e0b',
    'Cancelled': '#ef4444',
    'Draft': '#6b7280'
  }
  return statusColors[status] || '#6b7280'
}

function configureGantt() {
  if (!ganttContainer.value) return
  
  // Don't configure if we don't have data yet
  if (!quarterStart.value || !quarterEnd.value) return
  
  // Configure Gantt based on view mode
  gantt.config.date_format = '%Y-%m-%d'
  
  // Set scale unit and step based on view mode
  if (viewMode.value === 'day') {
    gantt.config.scale_unit = 'day'
    gantt.config.step = 1
    gantt.config.date_scale = '%d %M'
    gantt.config.subscales = [
      { unit: 'day', step: 1, date: '%D' }
    ]
  } else if (viewMode.value === 'week') {
    gantt.config.scale_unit = 'week'
    gantt.config.step = 1
    gantt.config.date_scale = 'Week %W'
    gantt.config.subscales = [
      { unit: 'day', step: 1, date: '%j' }
    ]
  } else { // month
    gantt.config.scale_unit = 'month'
    gantt.config.step = 1
    gantt.config.date_scale = '%F %Y'
    gantt.config.subscales = [
      { unit: 'week', step: 1, date: 'Week %W' }
    ]
  }
  
  gantt.config.start_date = quarterStart.value
  gantt.config.end_date = quarterEnd.value
  
  // Enable drag and drop
  gantt.config.drag_resize = true
  gantt.config.drag_move = true
  gantt.config.drag_progress = false
  gantt.config.drag_links = false
  
  // Column configuration
  gantt.config.columns = [
    { name: 'text', label: 'Objective', width: 300, tree: false }
  ]
  
  // Styling
  gantt.config.row_height = 50
  gantt.config.task_height = 30
  gantt.config.scale_height = 50
  
  // Initialize if not already done
  if (!ganttInitialized) {
    gantt.init(ganttContainer.value)
    ganttInitialized = true
    
    // Handle task drag/resize end (this event fires for both drag and resize)
    gantt.attachEvent('onAfterTaskDrag', async function(id, mode, e) {
      const task = gantt.getTask(id)
      if (task) {
        await updateObjectiveDates(id, task.start_date, task.end_date)
      }
    })
  }
  
  // Update data - only if we have tasks
  const tasks = ganttTasks.value || []
  
  if (tasks.length > 0) {
    // Only clear and reparse if we have data to show
    gantt.clearAll()
    gantt.parse({
      data: tasks,
      links: []
    })
  }
  
  // Re-render to apply new configuration
  // Note: dhtmlx-gantt should pick up config changes on render
  gantt.render()
}

async function updateObjectiveDates(objectiveId, startDate, endDate) {
  // Store original task state for rollback on error
  const originalTask = gantt.getTask(objectiveId)
  isUpdating = true
  
  try {
    // Format dates as YYYY-MM-DD
    // dhtmlx-gantt returns Date objects, so we need to format them
    const formatDate = (date) => {
      if (!date) return null
      const d = new Date(date)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
    
    const formattedStart = formatDate(startDate)
    const formattedEnd = formatDate(endDate)
    
    // Update via API
    await api.put(`/objectives/${objectiveId}`, {
      start_date: formattedStart,
      due_date: formattedEnd
    })
    
    // Refresh objectives
    await objectivesStore.fetchObjectives()
    isUpdating = false
    
    // Manually trigger re-render after update completes
    await nextTick()
    if (ganttInitialized && ganttContainer.value) {
      configureGantt()
    }
  } catch (error) {
    console.error('Error updating objective dates:', error)
    console.error('Error details:', error.response?.data || error.message)
    
    // Restore original task state
    if (originalTask) {
      gantt.updateTask(objectiveId, originalTask)
    }
    
    // Re-fetch to restore original state on error
    await objectivesStore.fetchObjectives()
    isUpdating = false
    
    alert(`Failed to update objective dates: ${error.response?.data?.error || error.message}`)
  }
}

function changeViewMode(mode) {
  if (viewMode.value === mode) return // No change needed
  viewMode.value = mode
  
  // Force reconfiguration
  if (ganttInitialized && ganttContainer.value) {
    nextTick(() => {
      configureGantt()
    })
  }
}

// Quarter selection functions
function getCurrentQuarter() {
  const now = new Date()
  const month = now.getMonth()
  const year = now.getFullYear()
  
  if (month < 3) return `Q1-${year}`
  if (month < 6) return `Q2-${year}`
  if (month < 9) return `Q3-${year}`
  return `Q4-${year}`
}

function updateQuarterDates() {
  const [quarter, year] = selectedQuarter.value.split('-')
  const quarterNum = parseInt(quarter[1])
  const yearNum = parseInt(year)
  
  const month = (quarterNum - 1) * 3
  quarterStart.value = new Date(yearNum, month, 1)
  
  // End of quarter
  const nextQuarterMonth = month + 3
  quarterEnd.value = new Date(yearNum, nextQuarterMonth, 0)
}

const availableQuarters = computed(() => {
  const quarters = []
  const now = new Date()
  const currentYear = now.getFullYear()
  
  for (let year = currentYear - 2; year <= currentYear + 2; year++) {
    for (let q = 1; q <= 4; q++) {
      quarters.push({
        value: `Q${q}-${year}`,
        label: `Q${q} ${year}`
      })
    }
  }
  return quarters
})

function updateQuarter() {
  updateQuarterDates()
  nextTick(() => {
    configureGantt()
  })
}

function goToCurrentPeriod() {
  selectedQuarter.value = getCurrentQuarter()
  updateQuarterDates()
  nextTick(() => {
    configureGantt()
  })
}

// Watch for changes in tasks to update Gantt
watch([ganttTasks, quarterStart, quarterEnd, viewMode], () => {
  // Don't reconfigure during updates to prevent blank chart
  if (isUpdating) return
  
  if (ganttInitialized && ganttContainer.value && quarterStart.value && quarterEnd.value) {
    // Use nextTick to ensure reactive updates have completed
    nextTick(() => {
      configureGantt()
    })
  }
}, { deep: true })

onMounted(async () => {
  updateQuarterDates()
  await objectivesStore.fetchObjectives()
  
  await nextTick()
  configureGantt()
})

onBeforeUnmount(() => {
  if (ganttInitialized) {
    gantt.clearAll()
    gantt.destructor()
    ganttInitialized = false
  }
})
</script>

<style scoped>
.gantt-container {
  width: 100%;
  height: calc(100vh - 300px);
  min-height: 600px;
}

/* Override dhtmlx-gantt styles to match our design */
:deep(.gantt_task_line) {
  border-radius: 5px;
}

:deep(.gantt_task_progress) {
  border-radius: 5px 0 0 5px;
}
</style>

