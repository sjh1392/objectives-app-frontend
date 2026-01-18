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
              @click="viewMode = mode.value"
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
        <!-- Timeline Header -->
        <div class="border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
          <div class="flex">
            <div class="w-64 p-4 border-r border-gray-200 font-semibold text-gray-700">
              Objective
            </div>
            <div class="flex-1 overflow-x-auto">
              <div class="flex" :style="{ width: `${timelineWidth}px` }">
                <div
                  v-for="period in timelinePeriods"
                  :key="period.key"
                  :class="getPeriodClass(period)"
                  :style="{ width: `${getPeriodWidth(period)}px`, minWidth: `${getPeriodMinWidth()}px` }"
                  class="p-2 border-r border-gray-200 text-center"
                >
                  <div v-if="viewMode === 'day'" class="text-xs text-gray-500">{{ period.monthName }}</div>
                  <div v-if="viewMode === 'day'" class="text-sm font-semibold text-gray-900">{{ period.day }}</div>
                  <div v-if="viewMode === 'day'" class="text-xs text-gray-400">{{ period.dayName }}</div>
                  
                  <div v-if="viewMode === 'week'" class="text-xs text-gray-500">{{ period.weekLabel }}</div>
                  <div v-if="viewMode === 'week'" class="text-sm font-semibold text-gray-900">{{ period.weekNumber }}</div>
                  <div v-if="viewMode === 'week'" class="text-xs text-gray-400">{{ period.dateRange }}</div>
                  
                  <div v-if="viewMode === 'month'" class="text-sm font-semibold text-gray-900">{{ period.monthName }}</div>
                  <div v-if="viewMode === 'month'" class="text-xs text-gray-400">{{ period.year }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Timeline Rows -->
        <div class="overflow-x-auto max-h-[calc(100vh-300px)]">
          <div
            v-for="objective in objectivesWithDates"
            :key="objective.id"
            class="border-b border-gray-200 hover:bg-gray-50 transition-colors"
            :style="{ height: '60px' }"
          >
            <div class="flex relative" :style="{ width: `${timelineWidth + 256}px` }">
              <!-- Objective Name -->
              <div class="w-64 p-4 border-r border-gray-200 flex items-center flex-shrink-0">
                <router-link
                  :to="`/objectives/${objective.id}`"
                  class="font-medium text-gray-900 hover:text-primary-600 truncate"
                  :title="objective.title"
                >
                  {{ objective.title }}
                </router-link>
              </div>

              <!-- Timeline Bar Area -->
              <div class="flex-1 relative" :style="{ width: `${timelineWidth}px` }">
                <!-- Grid Lines -->
                <div class="absolute inset-0 flex">
                  <div
                    v-for="period in timelinePeriods"
                    :key="period.key"
                    class="border-r border-gray-100"
                    :style="{ width: `${getPeriodWidth(period)}px` }"
                  ></div>
                </div>

                <!-- Objective Bar -->
                <div
                  v-if="objective.start_date && objective.due_date"
                  class="absolute top-2 h-10 rounded-md cursor-move flex items-center justify-between px-2 group transition-all"
                  :style="getBarStyle(objective)"
                  :class="getBarColorClass(objective)"
                  @mousedown="startDrag(objective, $event)"
                  draggable="false"
                >
                  <div class="w-2 h-2 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity cursor-ew-resize resize-handle-left" @mousedown.stop="startResize(objective, 'start', $event)"></div>
                  <span class="text-xs font-medium text-white px-2 truncate flex-1 text-center">
                    {{ getBarLabel(objective) }}
                  </span>
                  <div class="w-2 h-2 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity cursor-ew-resize resize-handle-right" @mousedown.stop="startResize(objective, 'end', $event)"></div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="objectivesWithDates.length === 0" class="p-12 text-center text-gray-500">
            <p>No objectives with dates found for this quarter.</p>
            <p class="text-sm mt-2">Create objectives with start and due dates to see them on the timeline.</p>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useObjectivesStore } from '../stores/objectives'
import AppLayout from '../components/layout/AppLayout.vue'
import api from '../services/api'

const objectivesStore = useObjectivesStore()

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

// Drag state
const draggingObjective = ref(null)
const dragStartX = ref(0)
const dragOffsetX = ref(0)
const isDragging = ref(false)
const resizeType = ref(null) // 'start' or 'end'

// Initialize quarter dates
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
  quarterEnd.value = new Date(yearNum, nextQuarterMonth, 0) // Last day of last month in quarter
}

const availableQuarters = computed(() => {
  const quarters = []
  const now = new Date()
  const currentYear = now.getFullYear()
  
  // Generate last 2 years and next 2 years
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

const timelinePeriods = computed(() => {
  if (!quarterStart.value || !quarterEnd.value) return []
  
  if (viewMode.value === 'day') {
    return getDays()
  } else if (viewMode.value === 'week') {
    return getWeeks()
  } else {
    return getMonths()
  }
})

function getDays() {
  const days = []
  const current = new Date(quarterStart.value)
  const end = new Date(quarterEnd.value)
  
  while (current <= end) {
    const dateStr = current.toISOString().split('T')[0]
    days.push({
      key: dateStr,
      type: 'day',
      date: dateStr,
      day: current.getDate(),
      monthName: current.toLocaleDateString('en-US', { month: 'short' }),
      dayName: current.toLocaleDateString('en-US', { weekday: 'short' }),
      isWeekend: current.getDay() === 0 || current.getDay() === 6,
      isToday: dateStr === new Date().toISOString().split('T')[0],
      timestamp: current.getTime(),
      startTimestamp: current.getTime(),
      endTimestamp: current.getTime() + (24 * 60 * 60 * 1000) - 1
    })
    current.setDate(current.getDate() + 1)
  }
  
  return days
}

function getWeeks() {
  const weeks = []
  const current = new Date(quarterStart.value)
  const end = new Date(quarterEnd.value)
  
  // Start from the beginning of the week (Monday)
  const dayOfWeek = current.getDay()
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  current.setDate(current.getDate() + diffToMonday)
  
  let weekNumber = 1
  while (current <= end) {
    const weekStart = new Date(current)
    const weekEnd = new Date(current)
    weekEnd.setDate(weekEnd.getDate() + 6)
    
    // Clamp to quarter bounds
    if (weekEnd > quarterEnd.value) {
      weekEnd.setTime(quarterEnd.value.getTime())
    }
    if (weekStart < quarterStart.value) {
      weekStart.setTime(quarterStart.value.getTime())
    }
    
    const weekStartStr = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const weekEndStr = weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    
    weeks.push({
      key: `week-${weekNumber}`,
      type: 'week',
      weekNumber: weekNumber,
      weekLabel: `Week ${weekNumber}`,
      dateRange: `${weekStartStr} - ${weekEndStr}`,
      startTimestamp: weekStart.getTime(),
      endTimestamp: weekEnd.getTime() + (24 * 60 * 60 * 1000) - 1,
      timestamp: weekStart.getTime()
    })
    
    current.setDate(current.getDate() + 7)
    weekNumber++
  }
  
  return weeks
}

function getMonths() {
  const months = []
  const current = new Date(quarterStart.value)
  const end = new Date(quarterEnd.value)
  
  while (current <= end) {
    const monthStart = new Date(current.getFullYear(), current.getMonth(), 1)
    const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0)
    
    // Clamp to quarter bounds
    if (monthStart < quarterStart.value) {
      monthStart.setTime(quarterStart.value.getTime())
    }
    if (monthEnd > quarterEnd.value) {
      monthEnd.setTime(quarterEnd.value.getTime())
    }
    
    months.push({
      key: `${current.getFullYear()}-${current.getMonth()}`,
      type: 'month',
      monthName: current.toLocaleDateString('en-US', { month: 'long' }),
      year: current.getFullYear(),
      monthIndex: current.getMonth(),
      startTimestamp: monthStart.getTime(),
      endTimestamp: monthEnd.getTime() + (24 * 60 * 60 * 1000) - 1,
      timestamp: monthStart.getTime()
    })
    
    // Move to next month
    current.setMonth(current.getMonth() + 1)
    current.setDate(1)
  }
  
  return months
}

const timelineWidth = computed(() => {
  if (viewMode.value === 'day') {
    return timelinePeriods.value.length * 80 // 80px per day
  } else if (viewMode.value === 'week') {
    return timelinePeriods.value.length * 120 // 120px per week
  } else {
    return timelinePeriods.value.length * 200 // 200px per month
  }
})

function getPeriodWidth(period) {
  if (viewMode.value === 'day') return 80
  if (viewMode.value === 'week') return 120
  return 200
}

function getPeriodMinWidth() {
  if (viewMode.value === 'day') return 80
  if (viewMode.value === 'week') return 120
  return 200
}

function getPeriodClass(period) {
  const classes = []
  if (period.isToday) classes.push('bg-blue-50')
  if (period.isWeekend) classes.push('bg-gray-100')
  return classes.join(' ')
}

const objectivesWithDates = computed(() => {
  return objectivesStore.objectives.filter(obj => {
    if (!obj.start_date && !obj.due_date) return false
    
    // Check if objective overlaps with quarter
    const objStart = obj.start_date ? new Date(obj.start_date) : null
    const objEnd = obj.due_date ? new Date(obj.due_date) : null
    
    if (!objStart && !objEnd) return false
    
    const quarterStartTime = quarterStart.value.getTime()
    const quarterEndTime = quarterEnd.value.getTime()
    
    // Objective overlaps if it starts before quarter ends and ends after quarter starts
    const startsBeforeQuarterEnd = !objStart || objStart.getTime() <= quarterEndTime
    const endsAfterQuarterStart = !objEnd || objEnd.getTime() >= quarterStartTime
    
    return startsBeforeQuarterEnd && endsAfterQuarterStart
  })
})

function getBarStyle(objective) {
  const startDate = objective.start_date ? new Date(objective.start_date) : quarterStart.value
  const dueDate = objective.due_date ? new Date(objective.due_date) : quarterEnd.value
  
  // Calculate position based on view mode
  const quarterStartTime = quarterStart.value.getTime()
  const startTime = Math.max(startDate.getTime(), quarterStartTime)
  const endTime = Math.min(dueDate.getTime(), quarterEnd.value.getTime())
  
  let left = 0
  let width = 0
  const pixelsPerUnit = viewMode.value === 'day' ? 80 : viewMode.value === 'week' ? 120 : 200
  
  if (viewMode.value === 'day') {
    const daysFromStart = (startTime - quarterStartTime) / (24 * 60 * 60 * 1000)
    const duration = (endTime - startTime) / (24 * 60 * 60 * 1000) + 1
    left = daysFromStart * pixelsPerUnit
    width = duration * pixelsPerUnit
  } else if (viewMode.value === 'week') {
    // Find which week period contains start and end
    let startWeekIndex = 0
    let endWeekIndex = 0
    
    for (let i = 0; i < timelinePeriods.value.length; i++) {
      const period = timelinePeriods.value[i]
      if (startTime >= period.startTimestamp && startTime <= period.endTimestamp) {
        startWeekIndex = i
      }
      if (endTime >= period.startTimestamp && endTime <= period.endTimestamp) {
        endWeekIndex = i
      }
    }
    
    left = startWeekIndex * pixelsPerUnit
    const weekSpan = endWeekIndex - startWeekIndex + 1
    width = weekSpan * pixelsPerUnit
  } else {
    // Month view
    let startMonthIndex = 0
    let endMonthIndex = 0
    
    for (let i = 0; i < timelinePeriods.value.length; i++) {
      const period = timelinePeriods.value[i]
      if (startTime >= period.startTimestamp && startTime <= period.endTimestamp) {
        startMonthIndex = i
      }
      if (endTime >= period.startTimestamp && endTime <= period.endTimestamp) {
        endMonthIndex = i
      }
    }
    
    left = startMonthIndex * pixelsPerUnit
    const monthSpan = endMonthIndex - startMonthIndex + 1
    width = monthSpan * pixelsPerUnit
  }
  
  return {
    left: `${left}px`,
    width: `${width}px`,
    minWidth: '60px'
  }
}

function getBarColorClass(objective) {
  const statusColors = {
    'Active': 'bg-blue-500',
    'Completed': 'bg-green-500',
    'On Hold': 'bg-yellow-500',
    'Cancelled': 'bg-red-500',
    'Draft': 'bg-gray-400'
  }
  return statusColors[objective.status] || 'bg-gray-500'
}

function getBarLabel(objective) {
  const startDate = objective.start_date ? new Date(objective.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No start'
  const dueDate = objective.due_date ? new Date(objective.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No due date'
  return `${startDate} - ${dueDate}`
}

function startDrag(objective, event) {
  if (resizeType.value) return // Don't start drag if resizing
  
  isDragging.value = true
  draggingObjective.value = objective
  
  const bar = event.currentTarget
  const timelineContainer = bar.closest('.relative')
  if (!timelineContainer) return
  
  const timelineRect = timelineContainer.getBoundingClientRect()
  const barRect = bar.getBoundingClientRect()
  
  // Calculate initial mouse position relative to timeline
  dragStartX.value = event.clientX - timelineRect.left
  // Store initial bar position relative to timeline
  dragOffsetX.value = barRect.left - timelineRect.left
  
  document.addEventListener('mousemove', handleDrag)
  document.addEventListener('mouseup', endDrag)
  event.preventDefault()
}

function startResize(objective, type, event) {
  resizeType.value = type
  draggingObjective.value = objective
  dragStartX.value = event.clientX
  
  const startDate = objective.start_date ? new Date(objective.start_date).getTime() : null
  const dueDate = objective.due_date ? new Date(objective.due_date).getTime() : null
  
  if (type === 'start' && startDate) {
    dragOffsetX.value = startDate
  } else if (type === 'end' && dueDate) {
    dragOffsetX.value = dueDate
  }
  
  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', endDrag)
  event.preventDefault()
  event.stopPropagation()
}

function handleDrag(event) {
  if (!isDragging.value || !draggingObjective.value) return
  
  const timelineContainer = document.querySelector('.relative')
  if (!timelineContainer) return
  
  const timelineRect = timelineContainer.getBoundingClientRect()
  const currentX = event.clientX - timelineRect.left
  
  // Calculate how many units to move based on view mode
  const pixelsPerUnit = viewMode.value === 'day' ? 80 : viewMode.value === 'week' ? 120 : 200
  const pixelsDiff = currentX - dragStartX.value
  const unitsDiff = Math.round(pixelsDiff / pixelsPerUnit)
  
  // Convert units to days
  let daysDiff = 0
  if (viewMode.value === 'day') {
    daysDiff = unitsDiff
  } else if (viewMode.value === 'week') {
    daysDiff = unitsDiff * 7
  } else {
    // Approximate months as 30 days
    daysDiff = unitsDiff * 30
  }
  
  if (daysDiff !== 0) {
    const currentStart = draggingObjective.value.start_date ? new Date(draggingObjective.value.start_date) : new Date(quarterStart.value)
    const currentDue = draggingObjective.value.due_date ? new Date(draggingObjective.value.due_date) : new Date(quarterStart.value)
    
    // Calculate duration in days
    const duration = Math.ceil((currentDue.getTime() - currentStart.getTime()) / (24 * 60 * 60 * 1000))
    
    // Calculate new dates
    const newStart = new Date(currentStart)
    newStart.setDate(newStart.getDate() + daysDiff)
    
    const newDue = new Date(newStart)
    newDue.setDate(newDue.getDate() + duration)
    
    // Clamp to quarter bounds
    if (newStart < quarterStart.value) {
      newStart.setTime(quarterStart.value.getTime())
      newDue.setTime(newStart.getTime() + duration * (24 * 60 * 60 * 1000))
    }
    if (newDue > quarterEnd.value) {
      newDue.setTime(quarterEnd.value.getTime())
      newStart.setTime(newDue.getTime() - duration * (24 * 60 * 60 * 1000))
      // Re-clamp start if needed
      if (newStart < quarterStart.value) {
        newStart.setTime(quarterStart.value.getTime())
      }
    }
    
    // Update locally for preview
    draggingObjective.value.start_date = newStart.toISOString().split('T')[0]
    draggingObjective.value.due_date = newDue.toISOString().split('T')[0]
    
    // Update dragStartX to prevent accumulating offset
    dragStartX.value = currentX
  }
}

function handleResize(event) {
  if (!resizeType.value || !draggingObjective.value) return
  
  const timelineContainer = document.querySelector('.relative')
  if (!timelineContainer) return
  
  const timelineRect = timelineContainer.getBoundingClientRect()
  const x = event.clientX - timelineRect.left
  
  if (x < 0 || x > timelineRect.width) return
  
  const pixelsPerUnit = viewMode.value === 'day' ? 80 : viewMode.value === 'week' ? 120 : 200
  const unitIndex = Math.max(0, Math.min(Math.floor(x / pixelsPerUnit), timelinePeriods.value.length - 1))
  const targetPeriod = timelinePeriods.value[unitIndex]
  
  // Determine target date based on view mode and resize type
  let targetDate = new Date(targetPeriod.timestamp)
  if (resizeType.value === 'end') {
    // For end resize, use the end of the period
    targetDate = new Date(targetPeriod.endTimestamp)
  } else {
    // For start resize, use the start of the period
    targetDate = new Date(targetPeriod.startTimestamp)
  }
  
  if (resizeType.value === 'start') {
    const currentDue = draggingObjective.value.due_date ? new Date(draggingObjective.value.due_date) : new Date()
    // Ensure start doesn't go past end or before quarter start
    if (targetDate < currentDue && targetDate >= quarterStart.value) {
      draggingObjective.value.start_date = targetDate.toISOString().split('T')[0]
    }
  } else if (resizeType.value === 'end') {
    const currentStart = draggingObjective.value.start_date ? new Date(draggingObjective.value.start_date) : new Date()
    // Ensure end doesn't go before start or after quarter end
    if (targetDate > currentStart && targetDate <= quarterEnd.value) {
      draggingObjective.value.due_date = targetDate.toISOString().split('T')[0]
    }
  }
}

async function endDrag(event) {
  if (!draggingObjective.value) {
    isDragging.value = false
    resizeType.value = null
    return
  }
  
  const objective = draggingObjective.value
  const originalObjective = objectivesStore.objectives.find(obj => obj.id === objective.id)
  
  // Check if dates changed
  const startChanged = objective.start_date !== originalObjective.start_date
  const dueChanged = objective.due_date !== originalObjective.due_date
  
  if (startChanged || dueChanged) {
    try {
      // Update via API
      await api.put(`/objectives/${objective.id}`, {
        start_date: objective.start_date,
        due_date: objective.due_date
      })
      
      // Update in store
      await objectivesStore.fetchObjectives()
    } catch (error) {
      console.error('Error updating objective dates:', error)
      // Revert on error
      objective.start_date = originalObjective.start_date
      objective.due_date = originalObjective.due_date
      alert('Failed to update objective dates. Please try again.')
    }
  }
  
  isDragging.value = false
  draggingObjective.value = null
  resizeType.value = null
  
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', endDrag)
}

function updateQuarter() {
  updateQuarterDates()
}

function goToCurrentPeriod() {
  const now = new Date()
  
  if (viewMode.value === 'month') {
    // For month view, select current quarter
    selectedQuarter.value = getCurrentQuarter()
  } else {
    // For day/week view, select current quarter
    selectedQuarter.value = getCurrentQuarter()
  }
  
  updateQuarterDates()
}

onMounted(async () => {
  updateQuarterDates()
  await objectivesStore.fetchObjectives()
})

onUnmounted(() => {
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', endDrag)
})
</script>

<style scoped>
.resize-handle-left,
.resize-handle-right {
  width: 8px;
  height: 8px;
}

.resize-handle-left {
  margin-left: -4px;
}

.resize-handle-right {
  margin-right: -4px;
}
</style>

