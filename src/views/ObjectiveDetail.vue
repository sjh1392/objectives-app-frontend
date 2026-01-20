<template>
  <AppLayout>
    <div v-if="objectivesStore.loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>

    <div v-else-if="objective" class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <div class="flex justify-between items-start mb-4">
          <div class="flex-1">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ objective.title }}</h1>
            <p class="text-gray-600">{{ objective.description }}</p>
          </div>
          <div class="flex gap-2">
            <button
              @click="toggleSubscription"
              :disabled="subscriptionLoading"
              class="px-4 py-2 border rounded-md transition-colors flex items-center gap-2"
              :class="isSubscribed 
                ? 'border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'"
            >
              <svg 
                v-if="isSubscribed"
                class="w-5 h-5" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <svg 
                v-else
                class="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              <span>{{ isSubscribed ? 'Subscribed' : 'Subscribe' }}</span>
            </button>
            <button
              @click="editObjective"
              class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Edit
            </button>
            <button
              @click="deleteObjective"
              class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>

        <div class="flex flex-wrap gap-4 mb-4">
          <span
            class="px-3 py-1 rounded-full text-sm font-semibold"
            :class="statusColorClass"
          >
            {{ objective.status }}
          </span>
          <span class="px-3 py-1 bg-gray-100 rounded-full text-sm capitalize">
            {{ objective.priority }} Priority
          </span>
          <span class="text-sm text-gray-600">
            Due: {{ formatDate(objective.due_date) }}
          </span>
        </div>

        <!-- Owner and Contributors Section (Compact) -->
        <div class="mb-4 flex items-center gap-4 flex-wrap">
          <!-- Owner -->
          <div v-if="objective.owner_id && owner" class="flex items-center gap-2">
            <span class="text-xs text-gray-500">Owner:</span>
            <router-link
              :to="`/people/${objective.owner_id}`"
              class="flex items-center gap-2 hover:opacity-75"
            >
              <Avatar :name="owner.name" :email="owner.email" size="sm" />
              <span class="text-sm font-medium text-gray-900">{{ owner.name }}</span>
            </router-link>
          </div>

          <!-- Contributors -->
          <div v-if="objective.contributors && objective.contributors.length > 0" class="flex items-center gap-2">
            <span class="text-xs text-gray-500">Contributors:</span>
            <div class="flex items-center gap-2 -space-x-2">
              <router-link
                v-for="contributor in objective.contributors.slice(0, 3)"
                :key="contributor.id"
                :to="`/people/${contributor.id}`"
                class="hover:z-10 hover:scale-110 transition-transform"
              >
                <Avatar :name="contributor.name" :email="contributor.email" size="sm" />
              </router-link>
              <span v-if="objective.contributors.length > 3" class="ml-2 text-xs text-gray-500">
                +{{ objective.contributors.length - 3 }}
              </span>
            </div>
            <button
              @click.stop="showManageContributors = true"
              class="ml-2 px-2 py-1 text-xs border border-gray-300 rounded text-gray-600 hover:bg-gray-50"
            >
              Manage
            </button>
          </div>
        </div>

        <div class="flex flex-wrap gap-2 mb-4">
          <Tag v-for="tag in objective.tags" :key="tag" :tag="tag" />
        </div>

        <ProgressBar
          :percentage="Math.round(objective.progress_percentage || 0)"
          :label="`Progress: ${Math.round(objective.current_value || 0)} / ${Math.round(objective.target_value || 0)}`"
        />
      </div>

      <!-- Key Results -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">Key Results</h2>
            <div class="flex gap-2 items-center">
            <div class="flex border border-gray-300 rounded-md overflow-hidden">
              <button
                @click="keyResultViewMode = 'kanban'"
                :class="keyResultViewMode === 'kanban' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700'"
                class="px-4 py-2 text-sm font-medium hover:bg-gray-50"
                title="Kanban View"
              >
                Kanban
              </button>
              <button
                @click="keyResultViewMode = 'list'"
                :class="keyResultViewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700'"
                class="px-4 py-2 text-sm font-medium hover:bg-gray-50"
                title="List View"
              >
                List
              </button>
            </div>
          </div>
        </div>

        <!-- Kanban View -->
        <div v-if="keyResultViewMode === 'kanban'" class="grid grid-cols-3 gap-4">
          <div
            v-for="column in kanbanColumns"
            :key="column.status"
            :class="[
              'rounded-lg p-4 min-h-[400px] transition-all duration-200',
              draggedOverColumn === column.status 
                ? 'bg-primary-100 border-2 border-primary-500 border-dashed' 
                : 'bg-gray-50 border-2 border-transparent'
            ]"
            @drop="handleDrop(column.status, $event)"
            @dragover.prevent="handleDragOver(column.status)"
            @dragenter.prevent="handleDragEnter(column.status)"
            @dragleave.prevent="handleDragLeave(column.status)"
          >
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold text-gray-700">{{ column.label }}</h3>
              <span class="text-sm text-gray-500 bg-white px-2 py-1 rounded-full">
                {{ getKeyResultsByStatus(column.status).length }}
              </span>
            </div>
            <div class="space-y-3">
              <KeyResultCard
                v-for="kr in getKeyResultsByStatus(column.status)"
                :key="kr.id"
                :key-result="kr"
                @drag-start="handleDragStart"
                @drag-end="handleDragEnd"
              />
              <!-- Add Key Result button in To Do column -->
              <div v-if="column.status === 'Not Started'" class="mt-3">
                <button
                  @click="showKeyResultForm = true; editingKeyResult = null"
                  class="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm transition-colors"
                >
                  + Add Key Result
                </button>
              </div>
              <div v-if="getKeyResultsByStatus(column.status).length === 0 && column.status !== 'Not Started'" class="text-center py-8 text-gray-400 text-sm">
                No key results
              </div>
            </div>
          </div>
        </div>

        <!-- List View -->
        <div v-else-if="keyResultViewMode === 'list'">
          <div v-if="keyResults.length > 0" class="space-y-4">
            <div
              v-for="kr in keyResults"
              :key="kr.id"
              class="border-l-4 border-primary-500 pl-4 py-4 bg-gray-50 rounded-r-lg"
            >
              <div class="flex justify-between items-start mb-3">
                <div class="flex-1">
                  <h3 class="font-medium text-gray-900 mb-1">{{ kr.title }}</h3>
                  <p v-if="kr.description" class="text-sm text-gray-600">{{ kr.description }}</p>
                </div>
                <div class="flex gap-2 items-center">
                  <span class="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                    {{ kr.status }}
                  </span>
                  <button
                    @click="editKeyResult(kr)"
                    class="text-primary-600 hover:text-primary-800 text-sm"
                  >
                    Edit
                  </button>
                </div>
              </div>
              
              <!-- Progress Controls in List View -->
              <div class="mt-3">
                <div class="flex items-center gap-4">
                  <label class="text-sm font-medium text-gray-700 whitespace-nowrap min-w-[100px]">
                    Progress: <span class="text-primary-600 font-semibold">{{ Math.round(kr.progress_percentage || 0) }}%</span>
                  </label>
                  <input
                    type="range"
                    :value="Math.round(kr.progress_percentage || 0)"
                    @change="updateKeyResultProgress(kr, $event.target.value)"
                    min="0"
                    max="100"
                    step="1"
                    class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <span class="text-xs text-gray-500 whitespace-nowrap min-w-[80px] text-right">
                    {{ Math.round(kr.current_value || 0) }} / {{ Math.round(kr.target_value || 0) }} {{ kr.unit || '' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <p v-else class="text-gray-500">No key results defined yet.</p>
        </div>
      </div>

      <!-- Key Result Form Modal -->
      <div v-if="showKeyResultForm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <KeyResultForm
            :key-result="editingKeyResult"
            @submit="handleKeyResultSubmit"
            @cancel="closeKeyResultForm"
          />
        </div>
      </div>

      <!-- Manage Contributors Modal -->
      <div v-if="showManageContributors" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg max-w-md w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
          <h2 class="text-2xl font-bold mb-4">Manage Contributors</h2>
          
          <div v-if="objective.contributors && objective.contributors.length > 0" class="mb-4">
            <h3 class="text-sm font-medium text-gray-700 mb-2">Current Contributors</h3>
            <div class="space-y-2">
              <div
                v-for="contributor in objective.contributors"
                :key="contributor.id"
                class="flex items-center justify-between p-2 bg-gray-50 rounded"
              >
                <div class="flex items-center gap-2">
                  <Avatar :name="contributor.name" :email="contributor.email" size="sm" />
                  <span class="text-sm">{{ contributor.name }}</span>
                </div>
                <button
                  @click="removeContributor(contributor.id)"
                  class="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Add Contributor</label>
            <select
              v-model="selectedContributorId"
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Choose a person...</option>
              <option
                v-for="user in availableUsers"
                :key="user.id"
                :value="user.id"
              >
                {{ user.name }} ({{ user.email }})
              </option>
            </select>
          </div>
          <div class="flex justify-end gap-4">
            <button
              @click="showManageContributors = false; selectedContributorId = null"
              class="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
            <button
              @click="addContributor"
              :disabled="!selectedContributorId"
              class="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      <!-- Add Contributor Modal -->
      <div v-if="showAddContributor" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg max-w-md w-full mx-4 p-6">
          <h2 class="text-2xl font-bold mb-4">Add Contributor</h2>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Select Person</label>
            <select
              v-model="selectedContributorId"
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Choose a person...</option>
              <option
                v-for="user in availableUsers"
                :key="user.id"
                :value="user.id"
              >
                {{ user.name }} ({{ user.email }})
              </option>
            </select>
          </div>
          <div class="flex justify-end gap-4">
            <button
              @click="showAddContributor = false; selectedContributorId = null"
              class="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              @click="addContributor"
              :disabled="!selectedContributorId"
              class="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      <!-- Comments and Activity Feed -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">Comments & Activity</h2>
        
        <!-- Unified Update Form -->
        <form @submit.prevent="submitUpdate" class="mb-6 pb-6 border-b">
          <div class="mb-3 relative">
            <label class="block text-sm font-medium text-gray-700 mb-1">Comment / Note</label>
            <textarea
              ref="commentTextarea"
              v-model="updateForm.comment"
              @input="handleCommentInput"
              @keydown="handleCommentKeydown"
              rows="5"
              placeholder="Add a comment or note... Use @ to mention someone"
              class="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 resize-y"
            ></textarea>
            
            <!-- User Mention Dropdown -->
            <div
              v-if="showMentionDropdown"
              class="mention-dropdown absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto"
              style="top: 100%;"
            >
              <div
                v-for="(user, index) in filteredMentionUsers"
                :key="user.id"
                @click="insertMention(user)"
                :class="[
                  'px-4 py-2 cursor-pointer hover:bg-primary-50 flex items-center gap-2',
                  index === selectedMentionIndex ? 'bg-primary-50' : ''
                ]"
              >
                <Avatar :name="user.name" :email="user.email" size="sm" />
                <div>
                  <div class="text-sm font-medium text-gray-900">{{ user.name }}</div>
                  <div class="text-xs text-gray-500">{{ user.email }}</div>
                </div>
              </div>
              <div v-if="filteredMentionUsers.length === 0" class="px-4 py-2 text-sm text-gray-500">
                No users found
              </div>
            </div>
          </div>
          
          <div class="flex items-center justify-between gap-4">
            <div class="flex-1 max-w-xs">
              <label class="block text-xs text-gray-500 mb-1">
                Update Value (Optional)
                <span v-if="objective.current_value !== undefined" class="text-gray-400">
                  (Current: {{ Math.round(objective.current_value || 0) }})
                </span>
              </label>
              <input
                v-model.number="updateForm.current_value"
                type="number"
                step="0.01"
                :placeholder="`Current: ${Math.round(objective.current_value || 0)}`"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div class="flex-shrink-0">
              <button
                type="submit"
                :disabled="!updateForm.current_value && !updateForm.comment.trim()"
                class="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"
              >
                Update
              </button>
            </div>
          </div>
        </form>

        <!-- Activity Feed -->
        <div class="space-y-4">
          <div
            v-for="item in activityFeed"
            :key="item.id || `update-${item.id}`"
            class="flex gap-3 pb-4 border-b last:border-0"
          >
            <Avatar
              :name="item.user_name || 'Unknown'"
              :email="item.user_email || ''"
              size="sm"
            />
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-sm font-medium text-gray-900">{{ item.user_name || 'System' }}</span>
                <span v-if="!item.user_id" class="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">Webhook</span>
                <span class="text-xs text-gray-500">{{ formatDateTime(item.created_at) }}</span>
              </div>
              <div v-if="item.content" class="text-sm text-gray-700" v-html="formatCommentContent(item.content)"></div>
              <div v-if="item.previous_value !== undefined" class="text-sm text-gray-700">
                Updated progress: <span class="font-medium">{{ item.previous_value }}</span> → 
                <span class="font-medium">{{ item.new_value }}</span>
                <span v-if="item.notes" class="block text-xs text-gray-500 mt-1">{{ item.notes }}</span>
              </div>
            </div>
          </div>
          <div v-if="activityFeed.length === 0" class="text-center py-8 text-gray-500 text-sm">
            No comments or updates yet
          </div>
        </div>
      </div>

    </div>

    <!-- Edit Form Modal -->
    <div v-if="showEditForm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <ObjectiveForm
          :objective="objective"
          @submit="handleUpdate"
          @cancel="showEditForm = false"
        />
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useObjectivesStore } from '../stores/objectives'
import { useUsersStore } from '../stores/users'
import { useAuthStore } from '../stores/auth'
import AppLayout from '../components/layout/AppLayout.vue'
import ProgressBar from '../components/common/ProgressBar.vue'
import Tag from '../components/common/Tag.vue'
import Avatar from '../components/common/Avatar.vue'
import ObjectiveForm from '../components/objectives/ObjectiveForm.vue'
import KeyResultForm from '../components/keyresults/KeyResultForm.vue'
import KeyResultCard from '../components/keyresults/KeyResultCard.vue'
import api from '../services/api'

const route = useRoute()
const router = useRouter()
const objectivesStore = useObjectivesStore()
const usersStore = useUsersStore()
const authStore = useAuthStore()

const objective = computed(() => objectivesStore.currentObjective)
const showEditForm = ref(false)
const keyResults = ref([])
const keyResultViewMode = ref('kanban')
const showKeyResultForm = ref(false)
const editingKeyResult = ref(null)
const draggedKeyResult = ref(null)
const draggedOverColumn = ref(null)
const showAddContributor = ref(false)
const showManageContributors = ref(false)
const selectedContributorId = ref(null)
const comments = ref([])
const isSubscribed = ref(false)
const subscriptionLoading = ref(false)
const progressUpdates = ref([])
const updateForm = ref({
  current_value: null,
  comment: ''
})
const commentTextarea = ref(null)
const showMentionDropdown = ref(false)
const mentionQuery = ref('')
const mentionStartPos = ref(-1)
const selectedMentionIndex = ref(0)

const kanbanColumns = [
  { status: 'Not Started', label: 'To Do' },
  { status: 'In Progress', label: 'In Progress' },
  { status: 'Completed', label: 'Completed' }
]

const statusColorClass = computed(() => {
  const statusColors = {
    'Active': 'bg-green-100 text-green-800',
    'Completed': 'bg-blue-100 text-blue-800',
    'On Hold': 'bg-yellow-100 text-yellow-800',
    'Draft': 'bg-gray-100 text-gray-800',
    'Cancelled': 'bg-red-100 text-red-800'
  }
  return statusColors[objective.value?.status] || 'bg-gray-100 text-gray-800'
})

const owner = computed(() => {
  if (!objective.value?.owner_id) return null
  return usersStore.getUserById(objective.value.owner_id)
})

const availableUsers = computed(() => {
  const contributorIds = objective.value?.contributors?.map(c => c.id) || []
  const ownerId = objective.value?.owner_id
  return usersStore.users.filter(user => 
    user.id !== ownerId && !contributorIds.includes(user.id)
  )
})

// All users for mentions (including owner and contributors)
const allUsersForMentions = computed(() => {
  return usersStore.users
})

const filteredMentionUsers = computed(() => {
  if (!mentionQuery.value) {
    return allUsersForMentions.value.slice(0, 5) // Show first 5 if no query
  }
  const query = mentionQuery.value.toLowerCase()
  return allUsersForMentions.value.filter(user => 
    user.name.toLowerCase().includes(query) || 
    user.email.toLowerCase().includes(query)
  ).slice(0, 5)
})

const activityFeed = computed(() => {
  const items = []
  // Add comments
  comments.value.forEach(comment => {
    items.push({
      ...comment,
      type: 'comment'
    })
  })
  // Add progress updates
  progressUpdates.value.forEach(update => {
    items.push({
      ...update,
      type: 'progress_update'
    })
  })
  // Sort by created_at descending
  return items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
})

function handleClickOutside(event) {
  if (commentTextarea.value && !commentTextarea.value.contains(event.target)) {
    // Check if click is outside the dropdown too
    const dropdown = document.querySelector('.mention-dropdown')
    if (dropdown && !dropdown.contains(event.target)) {
      showMentionDropdown.value = false
    }
  }
}

// Auto-refresh interval for webhook updates
let refreshInterval = null

onMounted(async () => {
  try {
    // Only fetch users if not already loaded (avoid duplicate requests)
    if (usersStore.users.length === 0) {
      await usersStore.fetchUsers().catch(err => {
        console.error('Failed to load users:', err)
        // Continue loading page even if users fail to load
      })
    }
    
    // Load other data - continue even if some requests fail
    await Promise.allSettled([
      loadObjective().catch(err => console.error('Failed to load objective:', err)),
      loadKeyResults().catch(err => console.error('Failed to load key results:', err)),
      loadComments().catch(err => console.error('Failed to load comments:', err)),
      loadProgressUpdates().catch(err => console.error('Failed to load progress updates:', err)),
      checkSubscriptionStatus().catch(err => console.error('Failed to check subscription:', err))
    ])
    
    document.addEventListener('click', handleClickOutside)
    
    // Set up auto-refresh to catch webhook updates (every 10 seconds)
    refreshInterval = setInterval(async () => {
      try {
        await loadObjective()
        await loadProgressUpdates()
        await loadComments()
      } catch (error) {
        console.error('Error refreshing objective data:', error)
      }
    }, 10000)
  } catch (error) {
    console.error('Error in onMounted:', error)
    // Ensure click handler is still added even on error
    document.addEventListener('click', handleClickOutside)
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})

async function loadObjective() {
  await objectivesStore.fetchObjective(route.params.id)
}

async function loadKeyResults() {
  try {
    const response = await api.get(`/objectives/${route.params.id}/key-results`)
    keyResults.value = response.data
  } catch (error) {
    console.error('Error loading key results:', error)
  }
}

async function loadComments() {
  try {
    const response = await api.get(`/objectives/${route.params.id}/comments`)
    comments.value = response.data
  } catch (error) {
    console.error('Error loading comments:', error)
  }
}

async function loadProgressUpdates() {
  try {
    const response = await api.get(`/objectives/${route.params.id}/progress-updates`)
    progressUpdates.value = response.data
  } catch (error) {
    console.error('Error loading progress updates:', error)
  }
}

function formatDate(dateString) {
  if (!dateString) return 'No due date'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function editObjective() {
  showEditForm.value = true
}

async function handleUpdate(formData) {
  try {
    await objectivesStore.updateObjective(route.params.id, formData)
    showEditForm.value = false
    await loadObjective()
  } catch (error) {
    console.error('Error updating objective:', error)
    alert('Error updating objective. Please try again.')
  }
}

async function deleteObjective() {
  if (confirm('Are you sure you want to delete this objective?')) {
    try {
      await objectivesStore.deleteObjective(route.params.id)
      router.push('/objectives')
    } catch (error) {
      console.error('Error deleting objective:', error)
      alert('Error deleting objective. Please try again.')
    }
  }
}

function formatCommentContent(content) {
  // Replace @mentions with styled links to user profiles
  if (!content) return ''
  // Escape HTML entities to prevent XSS, then format mentions
  const escapeHtml = (text) => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }
  const escaped = escapeHtml(content)
  // Convert newlines to <br> for proper display
  const withBreaks = escaped.replace(/\n/g, '<br>')
  // Match @ followed by username (allows spaces and common characters in names)
  return withBreaks.replace(/@([\w\s]+?)(?=\s|$|<br>|,|\.|!|\?)/g, (match, username) => {
    // Trim username and find matching user
    const trimmedName = username.trim()
    const user = usersStore.users.find(u => 
      u.name.toLowerCase() === trimmedName.toLowerCase() ||
      u.name.toLowerCase().includes(trimmedName.toLowerCase())
    )
    
    if (user) {
      return `<a href="/people/${user.id}" class="text-accent-600 underline cursor-pointer hover:text-accent-700">@${trimmedName}</a>`
    }
    // If user not found, still style it but without link
    return `<span class="text-accent-600 underline">@${trimmedName}</span>`
  })
}

function formatDateTime(dateString) {
  if (!dateString) return ''
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

function handleCommentInput(event) {
  const text = event.target.value
  const cursorPos = event.target.selectionStart
  
  // Find @ symbol before cursor
  const textBeforeCursor = text.substring(0, cursorPos)
  const lastAtIndex = textBeforeCursor.lastIndexOf('@')
  
  if (lastAtIndex !== -1) {
    // Check if there's a space after @ (meaning @ is not active)
    const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1)
    if (!textAfterAt.includes(' ') && !textAfterAt.includes('\n')) {
      // We're in a mention
      mentionStartPos.value = lastAtIndex
      mentionQuery.value = textAfterAt
      showMentionDropdown.value = true
      selectedMentionIndex.value = 0
      return
    }
  }
  
  // Hide dropdown if @ is not active
  showMentionDropdown.value = false
  mentionQuery.value = ''
  mentionStartPos.value = -1
}

function handleCommentKeydown(event) {
  // Handle Cmd+Enter or Ctrl+Enter to submit form (when mention dropdown is not open)
  if (!showMentionDropdown.value && (event.metaKey || event.ctrlKey) && event.key === 'Enter') {
    event.preventDefault()
    if (updateForm.value.current_value || updateForm.value.comment.trim()) {
      submitUpdate()
    }
    return
  }
  
  // Handle mention dropdown navigation
  if (!showMentionDropdown.value) return
  
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    selectedMentionIndex.value = Math.min(selectedMentionIndex.value + 1, filteredMentionUsers.value.length - 1)
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    selectedMentionIndex.value = Math.max(selectedMentionIndex.value - 1, 0)
  } else if (event.key === 'Enter' && filteredMentionUsers.value.length > 0) {
    event.preventDefault()
    insertMention(filteredMentionUsers.value[selectedMentionIndex.value])
  } else if (event.key === 'Escape') {
    showMentionDropdown.value = false
    mentionQuery.value = ''
    mentionStartPos.value = -1
  }
}

function insertMention(user) {
  if (!commentTextarea.value || mentionStartPos.value === -1) return
  
  const text = updateForm.value.comment
  const textBefore = text.substring(0, mentionStartPos.value)
  const textAfter = text.substring(mentionStartPos.value + 1 + mentionQuery.value.length)
  
  // Insert @username
  const mentionText = `@${user.name} `
  updateForm.value.comment = textBefore + mentionText + textAfter
  
  // Reset mention state
  showMentionDropdown.value = false
  mentionQuery.value = ''
  mentionStartPos.value = -1
  selectedMentionIndex.value = 0
  
  // Set cursor position after mention
  setTimeout(() => {
    if (commentTextarea.value) {
      const newPos = textBefore.length + mentionText.length
      commentTextarea.value.setSelectionRange(newPos, newPos)
      commentTextarea.value.focus()
    }
  }, 0)
}

async function submitUpdate() {
  if (updateForm.value.current_value === null && !updateForm.value.comment.trim()) return
  
  const commentText = updateForm.value.comment.trim()
  const currentValue = updateForm.value.current_value
  // Get current user from auth store
  const currentUserId = authStore.currentUserId || usersStore.users[0]?.id || null
  
  // Store original state for potential rollback
  const originalComments = [...comments.value]
  const originalObjective = { ...objective.value }
  
  try {
    // If value is provided, update progress (comment becomes notes)
    if (currentValue !== null && currentValue !== '') {
      // Optimistically update objective progress
      if (objective.value) {
        objectivesStore.currentObjective = {
          ...objective.value,
          current_value: currentValue,
          progress_percentage: objective.value.target_value > 0 
            ? (currentValue / objective.value.target_value) * 100 
            : 0
        }
      }
      
      await objectivesStore.updateProgress(
        route.params.id,
        currentValue,
        commentText || '',
        currentUserId
      )
      
      // If comment text is also provided, create a separate comment
      if (commentText && commentText.trim()) {
        if (!currentUserId) {
          console.error('Cannot save comment: user_id is not set')
        } else {
          // Create comment optimistically
          const tempComment = {
            id: `temp-${Date.now()}`,
            objective_id: route.params.id,
            user_id: currentUserId,
            content: commentText,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            user_name: usersStore.users.find(u => u.id === currentUserId)?.name || 'Unknown',
            user_email: usersStore.users.find(u => u.id === currentUserId)?.email || ''
          }
          
          // Add comment optimistically to the top of the list
          comments.value = [tempComment, ...comments.value]
          
          // Send comment to server
          try {
            const commentResponse = await api.post(`/objectives/${route.params.id}/comments`, {
              user_id: currentUserId,
              content: commentText
            })
            
            if (commentResponse.data) {
              const commentIndex = comments.value.findIndex(c => c.id === tempComment.id)
              if (commentIndex !== -1) {
                comments.value[commentIndex] = commentResponse.data
              } else {
                comments.value = [commentResponse.data, ...comments.value.filter(c => c.id !== tempComment.id)]
              }
            }
          } catch (commentError) {
            console.error('Error creating comment:', commentError)
            // Remove temp comment on error
            comments.value = comments.value.filter(c => c.id !== tempComment.id)
          }
        }
      }
      
      // Reset form
      updateForm.value.comment = ''
      updateForm.value.current_value = null
      
      // Reload data in background
      Promise.all([
        loadObjective(),
        loadComments(),
        loadProgressUpdates()
      ]).catch(err => {
        console.error('Background refresh failed:', err)
        // Revert on error
        comments.value = originalComments
        if (objective.value) {
          objectivesStore.currentObjective = originalObjective
        }
      })
    } else if (commentText) {
      // If only comment is provided (no value), create a comment optimistically
      const tempComment = {
        id: `temp-${Date.now()}`,
        objective_id: route.params.id,
        user_id: currentUserId,
        content: commentText,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_name: usersStore.users.find(u => u.id === currentUserId)?.name || 'Unknown',
        user_email: usersStore.users.find(u => u.id === currentUserId)?.email || ''
      }
      
      // Add comment optimistically to the top of the list
      comments.value = [tempComment, ...comments.value]
      
      // Send to server
      if (!currentUserId) {
        console.error('Cannot save comment: user_id is not set')
        alert('Error: User not identified. Please refresh the page.')
        comments.value = originalComments
        return
      }
      
      const response = await api.post(`/objectives/${route.params.id}/comments`, {
        user_id: currentUserId,
        content: commentText
      })
      
      if (!response.data) {
        console.error('Comment API returned no data:', response)
        throw new Error('Comment saved but no data returned')
      }
      
      // Replace temp comment with real one from server
      if (response.data) {
        const commentIndex = comments.value.findIndex(c => c.id === tempComment.id)
        if (commentIndex !== -1) {
          comments.value[commentIndex] = response.data
        } else {
          // If temp comment not found, add the real one at the top
          comments.value = [response.data, ...comments.value.filter(c => c.id !== tempComment.id)]
        }
      } else {
        console.warn('Comment saved but no data returned from server')
      }
      
      // Reset form
      updateForm.value.comment = ''
      updateForm.value.current_value = null
      
      // Refresh other data in background, but keep the comment we just added
      Promise.all([
        loadObjective(),
        loadProgressUpdates()
      ]).catch(err => {
        console.error('Background refresh failed:', err)
      })
      
      // Reload comments after a short delay to ensure it's in the database and synced
      setTimeout(() => {
        loadComments().catch(err => {
          console.error('Failed to reload comments:', err)
          // Don't revert - keep the optimistic update if reload fails
        })
      }, 500)
    } else {
      // Reset form
      updateForm.value.comment = ''
      updateForm.value.current_value = null
      
      // Silently refresh data in background
      Promise.all([
        loadObjective(),
        loadComments(),
        loadProgressUpdates()
      ]).catch(err => {
        console.error('Background refresh failed:', err)
        // Revert on error
        comments.value = originalComments
        if (objective.value) {
          objectivesStore.currentObjective = originalObjective
        }
      })
    }
  } catch (error) {
    console.error('Error submitting update:', error)
    
    // Revert optimistic updates
    comments.value = originalComments
    if (objective.value) {
      objectivesStore.currentObjective = originalObjective
    }
    
    alert('Error submitting update. Please try again.')
  }
}

function getKeyResultsByStatus(status) {
  return keyResults.value.filter(kr => kr.status === status)
}

function handleDragStart({ keyResult }) {
  draggedKeyResult.value = keyResult
}

function handleDragEnd() {
  // Clear drag-over highlighting
  draggedOverColumn.value = null
  // Only clear if drop was successful (handled by handleDrop)
  // If drop failed or was cancelled, handleDrop will reset draggedKeyResult
  // This prevents clearing state prematurely
}

function handleDragEnter(status) {
  if (draggedKeyResult.value) {
    draggedOverColumn.value = status
  }
}

function handleDragOver(status) {
  if (draggedKeyResult.value) {
    draggedOverColumn.value = status
  }
}

function handleDragLeave(status) {
  // Only clear if we're actually leaving (not just moving to a child element)
  // Use a small timeout to debounce rapid enter/leave events
  setTimeout(() => {
    if (draggedOverColumn.value === status) {
      draggedOverColumn.value = null
    }
  }, 50)
}

function getProgressForStatus(status) {
  const statusProgressMap = {
    'Not Started': 0,
    'In Progress': 50,
    'Completed': 100
  }
  return statusProgressMap[status] || 0
}

function calculateCurrentValueFromProgress(progressPercent, targetValue) {
  if (!targetValue || targetValue === 0) return 0
  return (progressPercent / 100) * targetValue
}

async function handleDrop(newStatus, event) {
  event.preventDefault()
  event.stopPropagation()
  
  if (!draggedKeyResult.value) return

  const originalKeyResult = { ...draggedKeyResult.value }
  const originalObjective = { ...objective.value }

  try {
    // Build update data with only the fields we need to update
    const updateData = {
      status: newStatus
    }

    // Optimistically update the UI immediately - this makes it feel instant
    const keyResultId = draggedKeyResult.value.id
    const keyResultIndex = keyResults.value.findIndex(kr => kr.id === keyResultId)
    if (keyResultIndex !== -1) {
      // Update the key result immediately in the UI (only status, not progress)
      keyResults.value[keyResultIndex] = {
        ...keyResults.value[keyResultIndex],
        status: newStatus
      }
    }

    // Clear the dragged state immediately for smooth UX
    draggedKeyResult.value = null
    draggedOverColumn.value = null

    // Save to server asynchronously in the background (non-blocking)
    // Don't await - let it happen in the background without blocking UI
    api.put(`/key-results/${keyResultId}`, updateData)
      .then(() => {
        // Success - data is already updated optimistically, no refresh needed
        // Optionally sync progress updates in background without UI refresh
        loadProgressUpdates().catch(err => console.error('Failed to sync progress updates:', err))
      })
      .catch(err => {
        console.error('Error saving to server:', err)
        // Revert optimistic update on error
        if (keyResultIndex !== -1) {
          keyResults.value[keyResultIndex] = originalKeyResult
        }
        if (objective.value) {
          objectivesStore.currentObjective = originalObjective
        }
        // Show user-friendly error but don't revert the drag visually
        const errorMsg = err.response?.data?.error || err.message || 'Failed to save. Changes will revert.'
        console.error('Error updating key result status:', errorMsg)
        // Optionally show a toast notification instead of alert for better UX
        alert(`Failed to save: ${errorMsg}`)
      })
  } catch (error) {
    // This catch block should rarely be hit since we're not awaiting the API call
    // But handle it just in case
    console.error('Error in handleDrop:', error)
    
    // Revert optimistic update on error
    const keyResultIndex = keyResults.value.findIndex(kr => kr.id === originalKeyResult.id)
    if (keyResultIndex !== -1) {
      keyResults.value[keyResultIndex] = originalKeyResult
    }
    if (objective.value) {
      objectivesStore.currentObjective = originalObjective
    }
    
    // Reset dragged state on error
    draggedKeyResult.value = null
    draggedOverColumn.value = null
    
    // Show user-friendly error message
    const errorMsg = error.message || 'Network error - please check if the backend server is running'
    alert(`Error updating key result status: ${errorMsg}`)
  }
}

function editKeyResult(keyResult) {
  editingKeyResult.value = keyResult
  showKeyResultForm.value = true
}

function closeKeyResultForm() {
  showKeyResultForm.value = false
  editingKeyResult.value = null
}

async function handleKeyResultSubmit(formData) {
  try {
    let progressPercent = formData.progress_percentage || 0
    let currentValue = formData.current_value || 0

    if (keyResultViewMode.value === 'kanban') {
      // In kanban mode, progress is auto-set based on status
      progressPercent = getProgressForStatus(formData.status || 'Not Started')
      const targetValue = formData.target_value || 100
      currentValue = calculateCurrentValueFromProgress(progressPercent, targetValue)
    } else if (keyResultViewMode.value === 'list') {
      // In list view, use the progress_percentage from form if editing, or calculate from current_value
      if (editingKeyResult.value && formData.progress_percentage !== undefined) {
        progressPercent = formData.progress_percentage
        const targetValue = formData.target_value || 100
        currentValue = calculateCurrentValueFromProgress(progressPercent, targetValue)
      } else if (formData.current_value !== null && formData.current_value !== undefined && formData.target_value > 0) {
        progressPercent = (formData.current_value / formData.target_value) * 100
        currentValue = formData.current_value
      }
    }

    const keyResultData = {
      ...formData,
      progress_percentage: progressPercent,
      current_value: currentValue,
      objective_id: route.params.id,
      auto_update_progress: true // Default to true for new key results
    }

    if (editingKeyResult.value) {
      await api.put(`/key-results/${editingKeyResult.value.id}`, keyResultData)
    } else {
      await api.post(`/objectives/${route.params.id}/key-results`, keyResultData)
    }
    closeKeyResultForm()
    await Promise.all([
      loadKeyResults(),
      loadObjective(),
      loadProgressUpdates()
    ])
  } catch (error) {
    console.error('Error saving key result:', error)
    console.error('Error details:', error.response?.data)
    const errorMsg = error.response?.data?.error || error.message || 'Network error - please check if the backend server is running'
    alert(`Error saving key result: ${errorMsg}`)
  }
}

async function updateKeyResultProgress(keyResult, progressPercent) {
  const originalKeyResult = { ...keyResult }
  const originalObjective = { ...objective.value }
  
  try {
    const progress = parseFloat(progressPercent)
    const targetValue = keyResult.target_value || 100
    const currentValue = calculateCurrentValueFromProgress(progress, targetValue)

    // Optimistically update UI
    const keyResultIndex = keyResults.value.findIndex(kr => kr.id === keyResult.id)
    if (keyResultIndex !== -1) {
      keyResults.value[keyResultIndex] = {
        ...keyResults.value[keyResultIndex],
        progress_percentage: progress,
        current_value: currentValue
      }
    }

    // Optimistically update objective progress
    if (objective.value) {
      const allKeyResults = keyResults.value
      const totalProgress = allKeyResults.reduce((sum, kr) => {
        const krProgress = kr.id === keyResult.id ? progress : (kr.progress_percentage || 0)
        return sum + krProgress
      }, 0)
      const averageProgress = allKeyResults.length > 0 ? totalProgress / allKeyResults.length : 0
      const objTargetValue = objective.value.target_value || 100
      const objCurrentValue = (averageProgress / 100) * objTargetValue
      
      objectivesStore.currentObjective = {
        ...objective.value,
        progress_percentage: averageProgress,
        current_value: objCurrentValue
      }
    }

    // Send update to server in background
    await api.put(`/key-results/${keyResult.id}`, {
      ...keyResult,
      progress_percentage: progress,
      current_value: currentValue
    })
    
    // Silently refresh in background
    Promise.all([
      loadKeyResults(),
      loadObjective(),
      loadProgressUpdates()
    ]).catch(err => {
      console.error('Background refresh failed:', err)
      // Revert on error
      if (keyResultIndex !== -1) {
        keyResults.value[keyResultIndex] = originalKeyResult
      }
      if (objective.value) {
        objectivesStore.currentObjective = originalObjective
      }
    })
  } catch (error) {
    console.error('Error updating key result progress:', error)
    
    // Revert optimistic update
    const keyResultIndex = keyResults.value.findIndex(kr => kr.id === originalKeyResult.id)
    if (keyResultIndex !== -1) {
      keyResults.value[keyResultIndex] = originalKeyResult
    }
    if (objective.value) {
      objectivesStore.currentObjective = originalObjective
    }
    
    const errorMsg = error.message || 'Network error - please check if the backend server is running'
    alert(`Error updating progress: ${errorMsg}`)
  }
}

async function addContributor() {
  if (!selectedContributorId.value) return
  
  try {
    await api.post(`/objectives/${route.params.id}/contributors`, {
      user_id: selectedContributorId.value
    })
    await loadObjective()
    if (showAddContributor.value) {
      showAddContributor.value = false
    }
    if (showManageContributors.value) {
      // Keep modal open to add more
    }
    selectedContributorId.value = null
  } catch (error) {
    console.error('Error adding contributor:', error)
    alert(error.response?.data?.error || 'Error adding contributor. Please try again.')
  }
}

async function removeContributor(userId) {
  if (!confirm('Remove this contributor?')) return
  
  try {
    await api.delete(`/objectives/${route.params.id}/contributors/${userId}`)
    await loadObjective()
  } catch (error) {
    console.error('Error removing contributor:', error)
    alert('Error removing contributor. Please try again.')
  }
}

async function checkSubscriptionStatus() {
  if (!authStore.isAuthenticated) {
    isSubscribed.value = false
    return
  }
  
  try {
    const response = await api.get(`/objectives/${route.params.id}/subscribe`)
    isSubscribed.value = response.data.subscribed || false
  } catch (error) {
    console.error('Error checking subscription status:', error)
    isSubscribed.value = false
  }
}

async function toggleSubscription() {
  if (!authStore.isAuthenticated) {
    alert('Please log in to subscribe to objectives')
    router.push('/login')
    return
  }
  
  subscriptionLoading.value = true
  
  try {
    if (isSubscribed.value) {
      // Unsubscribe
      await api.delete(`/objectives/${route.params.id}/subscribe`)
      isSubscribed.value = false
    } else {
      // Subscribe
      await api.post(`/objectives/${route.params.id}/subscribe`)
      isSubscribed.value = true
    }
  } catch (error) {
    console.error('Error toggling subscription:', error)
    alert(error.response?.data?.error || 'Error updating subscription. Please try again.')
  } finally {
    subscriptionLoading.value = false
  }
}
</script>

