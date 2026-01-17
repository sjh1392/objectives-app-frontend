<template>
  <AppLayout>
    <div>
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Integrations</h1>
          <p class="text-gray-600 mt-2">Connect third-party services and sync objective progress automatically</p>
        </div>
        <button
          @click="showAddForm = true"
          class="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          + Add Integration
        </button>
      </div>

      <!-- Integrations List -->
      <div v-if="integrations.length > 0" class="space-y-4 mb-8">
        <div
          v-for="integration in integrations"
          :key="integration.id"
          class="bg-white rounded-lg shadow-md p-6"
        >
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <h3 class="text-xl font-semibold text-gray-900">{{ integration.name }}</h3>
                <span
                  class="px-3 py-1 rounded-full text-xs font-semibold"
                  :class="integration.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
                >
                  {{ integration.status === 'active' ? 'Active' : 'Inactive' }}
                </span>
                <span class="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {{ integration.service_type }}
                </span>
              </div>
              <p class="text-gray-600 mb-4">{{ integration.description }}</p>
              
              <!-- Webhook Configuration -->
              <div class="mt-4 mb-4">
                <div class="flex justify-between items-center mb-3">
                  <h4 class="text-sm font-medium text-gray-700">Webhook Integrations:</h4>
                  <button
                    @click="createWebhook(integration.id)"
                    class="px-3 py-1.5 text-xs border border-primary-600 text-primary-600 rounded-md hover:bg-primary-50 font-medium"
                  >
                    + Add Webhook
                  </button>
                </div>
                <div v-if="integration.webhooks && integration.webhooks.length > 0" class="space-y-3">
                  <div
                    v-for="webhook in integration.webhooks"
                    :key="webhook.id"
                    class="p-4 bg-blue-50 border border-blue-200 rounded-md"
                  >
                    <div class="flex justify-between items-start mb-2">
                      <div class="flex-1">
                        <div class="flex items-center gap-2 mb-2">
                          <span class="font-medium text-gray-900">{{ webhook.objective_title }}</span>
                          <span
                            class="px-2 py-1 rounded-full text-xs font-semibold"
                            :class="webhook.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
                          >
                            {{ webhook.status }}
                          </span>
                        </div>
                        <div class="space-y-2">
                          <div class="flex items-center gap-2">
                            <label class="text-xs font-medium text-gray-600 w-24">Webhook ID:</label>
                            <code class="flex-1 text-xs bg-white px-2 py-1 rounded border border-gray-300 font-mono">{{ webhook.id }}</code>
                            <button
                              @click="copyToClipboard(webhook.id)"
                              class="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
                              title="Copy Webhook ID"
                            >
                              📋 Copy ID
                            </button>
                          </div>
                          <div class="flex items-center gap-2">
                            <label class="text-xs font-medium text-gray-600 w-24">Webhook URL:</label>
                            <code class="flex-1 text-xs bg-white px-2 py-1 rounded border border-gray-300 font-mono break-all">{{ webhook.webhook_url }}</code>
                            <button
                              @click="copyToClipboard(webhook.webhook_url)"
                              class="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
                              title="Copy Full URL"
                            >
                              📋 Copy URL
                            </button>
                          </div>
                        </div>
                      </div>
                      <button
                        @click="viewWebhookEvents(webhook.id)"
                        class="px-3 py-1 text-xs border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                      >
                        View Events
                      </button>
                      <button
                        @click="deleteWebhook(webhook.id)"
                        class="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                    <button
                      @click="editWebhook(webhook)"
                      class="mt-2 px-3 py-1 text-xs border border-primary-600 text-primary-600 rounded hover:bg-primary-50"
                    >
                      Edit Field Mapping
                    </button>
                  </div>
                </div>
                <div v-else class="text-center py-6 bg-gray-50 rounded-md border border-dashed border-gray-300">
                  <p class="text-sm text-gray-500 mb-2">No webhooks configured yet</p>
                  <p class="text-xs text-gray-400">Click "+ Add Webhook" above to create one</p>
                </div>
              </div>
              
              <!-- Linked Objectives (Legacy) -->
              <div v-if="integration.linked_objectives && integration.linked_objectives.length > 0" class="mt-4">
                <h4 class="text-sm font-medium text-gray-700 mb-2">Linked Objectives:</h4>
                <div class="space-y-2">
                  <div
                    v-for="link in integration.linked_objectives"
                    :key="link.objective_id"
                    class="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                  >
                    <div class="flex-1">
                      <router-link
                        :to="`/objectives/${link.objective_id}`"
                        class="font-medium text-primary-600 hover:text-primary-800"
                      >
                        {{ getObjectiveName(link.objective_id) }}
                      </router-link>
                      <p class="text-sm text-gray-500 mt-1">
                        Syncs: {{ link.field_mapping || 'Progress percentage' }}
                      </p>
                    </div>
                    <button
                      @click="removeObjectiveLink(integration.id, link.objective_id)"
                      class="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                    >
                      Unlink
                    </button>
                  </div>
                </div>
              </div>
              <div v-else class="text-sm text-gray-400 italic mt-2">
                No objectives linked to this integration
              </div>
              <button
                @click="linkObjective(integration.id)"
                class="mt-3 px-4 py-2 text-sm border border-primary-600 text-primary-600 rounded-md hover:bg-primary-50"
              >
                + Link Objective
              </button>
            </div>
            
            <div class="flex gap-2 ml-4">
              <button
                @click="editIntegration(integration)"
                class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Edit
              </button>
              <button
                @click="deleteIntegration(integration.id)"
                class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="bg-white rounded-lg shadow-md p-12 text-center">
        <div class="text-6xl mb-4">🔌</div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">No Integrations Yet</h3>
        <p class="text-gray-600 mb-6">Connect your third-party services to automatically sync objective progress</p>
        <button
          @click="showAddForm = true"
          class="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          Add Your First Integration
        </button>
      </div>

      <!-- Add/Edit Integration Modal -->
      <div
        v-if="showAddForm"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        @click.self="closeForm"
      >
        <div class="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">
            {{ editingIntegration ? 'Edit Integration' : 'Add Integration' }}
          </h2>

          <form @submit.prevent="saveIntegration" class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Service Type <span class="text-red-500">*</span>
              </label>
              <select
                v-model="form.service_type"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select a service...</option>
                <option value="API">Custom API</option>
                <option value="Slack">Slack</option>
                <option value="Jira">Jira</option>
                <option value="Asana">Asana</option>
                <option value="Trello">Trello</option>
                <option value="Google Sheets">Google Sheets</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Integration Name <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.name"
                type="text"
                required
                placeholder="e.g., Production API"
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                v-model="form.description"
                rows="3"
                placeholder="Brief description of this integration..."
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                API Endpoint / Connection URL
              </label>
              <input
                v-model="form.api_endpoint"
                type="url"
                placeholder="https://api.example.com/data"
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
              />
              <p class="text-xs text-gray-500 mt-1">URL endpoint for fetching data</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                API Key / Authentication Token
              </label>
              <input
                v-model="form.api_key"
                type="password"
                placeholder="Enter API key or token"
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
              />
              <p class="text-xs text-gray-500 mt-1">Secure authentication credentials</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Sync Frequency
              </label>
              <select
                v-model="form.sync_frequency"
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
              >
                <option value="manual">Manual</option>
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>

            <div>
              <label class="flex items-center gap-2">
                <input
                  v-model="form.status"
                  type="checkbox"
                  true-value="active"
                  false-value="inactive"
                  class="rounded border-gray-300"
                />
                <span class="text-sm font-medium text-gray-700">Active</span>
              </label>
            </div>

            <div class="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                @click="closeForm"
                class="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                {{ editingIntegration ? 'Update' : 'Create' }} Integration
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Link Objective Modal -->
      <div
        v-if="showLinkObjective"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        @click.self="showLinkObjective = false"
      >
        <div class="bg-white rounded-lg shadow-xl p-8 max-w-lg w-full mx-4">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Link Objective to Integration</h2>

          <form @submit.prevent="saveObjectiveLink" class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Objective <span class="text-red-500">*</span>
              </label>
              <select
                v-model="linkForm.objective_id"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select an objective...</option>
                <option
                  v-for="objective in availableObjectives"
                  :key="objective.id"
                  :value="objective.id"
                >
                  {{ objective.title }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Field Mapping
              </label>
              <select
                v-model="linkForm.field_mapping"
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
              >
                <option value="progress_percentage">Progress Percentage</option>
                <option value="current_value">Current Value</option>
                <option value="target_value">Target Value</option>
              </select>
              <p class="text-xs text-gray-500 mt-1">Which field should sync from the integration?</p>
            </div>

            <div class="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                @click="showLinkObjective = false"
                class="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Link Objective
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Webhook Form Modal -->
      <div
        v-if="showWebhookForm"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        @click.self="closeWebhookForm"
      >
        <div class="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">
            {{ editingWebhook ? 'Edit Webhook' : 'Create Webhook' }}
          </h2>

          <form @submit.prevent="saveWebhook" class="space-y-6">
            <div v-if="!editingWebhook">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Objective <span class="text-red-500">*</span>
              </label>
              <select
                v-model="webhookForm.objective_id"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select an objective...</option>
                <option
                  v-for="objective in availableObjectives"
                  :key="objective.id"
                  :value="objective.id"
                >
                  {{ objective.title }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Field Mapping
              </label>
              <p class="text-xs text-gray-500 mb-3">Map payload fields to objective fields using dot notation (e.g., payload.progress)</p>
              
              <div class="space-y-3">
                <div>
                  <label class="block text-xs text-gray-600 mb-1">Progress Percentage</label>
                  <input
                    v-model="webhookForm.field_mapping.progress_percentage"
                    type="text"
                    placeholder="payload.progress_percentage"
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label class="block text-xs text-gray-600 mb-1">Current Value</label>
                  <input
                    v-model="webhookForm.field_mapping.current_value"
                    type="text"
                    placeholder="payload.current_value"
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label class="block text-xs text-gray-600 mb-1">Target Value</label>
                  <input
                    v-model="webhookForm.field_mapping.target_value"
                    type="text"
                    placeholder="payload.target_value"
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label class="block text-xs text-gray-600 mb-1">Comment (Optional)</label>
                  <input
                    v-model="webhookForm.field_mapping.comment"
                    type="text"
                    placeholder="payload.comment or payload.message"
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                  />
                  <p class="text-xs text-gray-400 mt-1">Comment to add to activity feed when webhook updates</p>
                </div>
              </div>
            </div>

            <div class="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                @click="closeWebhookForm"
                class="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                {{ editingWebhook ? 'Update' : 'Create' }} Webhook
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Webhook Events Modal -->
      <div
        v-if="showWebhookEvents"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        @click.self="showWebhookEvents = false"
      >
        <div class="bg-white rounded-lg shadow-xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Webhook Events</h2>

          <div v-if="webhookEvents.length > 0" class="space-y-3">
            <div
              v-for="event in webhookEvents"
              :key="event.id"
              class="p-4 border rounded-md"
              :class="event.processed ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'"
            >
              <div class="flex justify-between items-start mb-2">
                <div>
                  <span class="font-medium text-gray-900">
                    {{ new Date(event.created_at).toLocaleString() }}
                  </span>
                  <span
                    class="ml-2 px-2 py-1 rounded-full text-xs font-semibold"
                    :class="event.processed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                  >
                    {{ event.processed ? 'Processed' : 'Failed' }}
                  </span>
                </div>
                <div v-if="event.value_before !== null && event.value_after !== null" class="text-sm text-gray-600">
                  Value: {{ event.value_before }} → {{ event.value_after }}
                </div>
              </div>
              <div v-if="event.error_message" class="text-sm text-red-600 mt-2">
                Error: {{ event.error_message }}
              </div>
              <details class="mt-2">
                <summary class="text-sm text-gray-600 cursor-pointer hover:text-gray-900">View Payload</summary>
                <pre class="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">{{ JSON.stringify(event.payload, null, 2) }}</pre>
              </details>
            </div>
          </div>
          <div v-else class="text-center py-8 text-gray-500">
            No events yet
          </div>

          <div class="flex justify-end mt-6 pt-4 border-t">
            <button
              @click="showWebhookEvents = false"
              class="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useObjectivesStore } from '../stores/objectives'
import AppLayout from '../components/layout/AppLayout.vue'
import api from '../services/api'

const objectivesStore = useObjectivesStore()
const integrations = ref([])
const showAddForm = ref(false)
const showLinkObjective = ref(false)
const editingIntegration = ref(null)
const linkingIntegrationId = ref(null)

const form = ref({
  service_type: '',
  name: '',
  description: '',
  api_endpoint: '',
  api_key: '',
  sync_frequency: 'manual',
  status: 'active'
})

const linkForm = ref({
  objective_id: '',
  field_mapping: 'progress_percentage'
})

const availableObjectives = computed(() => {
  return objectivesStore.objectives.filter(obj => obj.status !== 'Completed')
})

onMounted(async () => {
  await objectivesStore.fetchObjectives()
  await loadIntegrations()
})

async function loadIntegrations() {
  try {
    // Load from localStorage (legacy support)
    const stored = localStorage.getItem('integrations')
    integrations.value = stored ? JSON.parse(stored) : []
    
    // Load all webhooks and assign them to integrations
    try {
      const allWebhooksResponse = await api.get('/webhooks')
      const allWebhooks = allWebhooksResponse.data || []
      
      // Load webhooks for each integration
      for (const integration of integrations.value) {
        try {
          // Try to load webhooks using integration.id
          const response = await api.get(`/integrations/${integration.id}/webhooks`)
          integration.webhooks = response.data || []
        } catch (error) {
          // Fallback: assign webhooks with null integration_id to this integration
          // or webhooks that don't have a matching integration_id
          integration.webhooks = allWebhooks.filter(
            w => !w.integration_id || w.integration_id === integration.id
          ) || []
          console.log(`Loaded ${integration.webhooks.length} webhooks for integration:`, integration.id)
        }
      }
    } catch (error) {
      console.error('Error loading webhooks:', error)
      // Set empty webhooks array for all integrations
      integrations.value.forEach(integration => {
        integration.webhooks = integration.webhooks || []
      })
    }
  } catch (error) {
    console.error('Error loading integrations:', error)
    integrations.value = []
  }
}

async function saveIntegration() {
  try {
    if (editingIntegration.value) {
      // Update existing
      const index = integrations.value.findIndex(i => i.id === editingIntegration.value.id)
      if (index !== -1) {
        integrations.value[index] = { ...editingIntegration.value, ...form.value }
      }
    } else {
      // Create new
      const newIntegration = {
        id: Date.now().toString(),
        ...form.value,
        linked_objectives: [],
        created_at: new Date().toISOString()
      }
      integrations.value.push(newIntegration)
    }
    
    // Save to localStorage (in production, use API)
    localStorage.setItem('integrations', JSON.stringify(integrations.value))
    
    closeForm()
  } catch (error) {
    console.error('Error saving integration:', error)
    alert('Error saving integration. Please try again.')
  }
}

function editIntegration(integration) {
  editingIntegration.value = integration
  form.value = { ...integration }
  showAddForm.value = true
}

async function deleteIntegration(id) {
  if (!confirm('Are you sure you want to delete this integration?')) return
  
  try {
    integrations.value = integrations.value.filter(i => i.id !== id)
    localStorage.setItem('integrations', JSON.stringify(integrations.value))
  } catch (error) {
    console.error('Error deleting integration:', error)
    alert('Error deleting integration. Please try again.')
  }
}

function closeForm() {
  showAddForm.value = false
  editingIntegration.value = null
  form.value = {
    service_type: '',
    name: '',
    description: '',
    api_endpoint: '',
    api_key: '',
    sync_frequency: 'manual',
    status: 'active'
  }
}

function linkObjective(integrationId) {
  linkingIntegrationId.value = integrationId
  linkForm.value = {
    objective_id: '',
    field_mapping: 'progress_percentage'
  }
  showLinkObjective.value = true
}

async function saveObjectiveLink() {
  try {
    const integration = integrations.value.find(i => i.id === linkingIntegrationId.value)
    if (!integration) return

    if (!integration.linked_objectives) {
      integration.linked_objectives = []
    }

    // Check if already linked
    if (integration.linked_objectives.some(link => link.objective_id === linkForm.value.objective_id)) {
      alert('This objective is already linked to this integration.')
      return
    }

    integration.linked_objectives.push({
      objective_id: linkForm.value.objective_id,
      field_mapping: linkForm.value.field_mapping
    })

    localStorage.setItem('integrations', JSON.stringify(integrations.value))
    showLinkObjective.value = false
    linkingIntegrationId.value = null
  } catch (error) {
    console.error('Error linking objective:', error)
    alert('Error linking objective. Please try again.')
  }
}

function removeObjectiveLink(integrationId, objectiveId) {
  if (!confirm('Unlink this objective from the integration?')) return
  
  const integration = integrations.value.find(i => i.id === integrationId)
  if (integration && integration.linked_objectives) {
    integration.linked_objectives = integration.linked_objectives.filter(
      link => link.objective_id !== objectiveId
    )
    localStorage.setItem('integrations', JSON.stringify(integrations.value))
  }
}

function getObjectiveName(objectiveId) {
  const objective = objectivesStore.objectives.find(obj => obj.id === objectiveId)
  return objective ? objective.title : 'Unknown Objective'
}

// Webhook functions
const showWebhookForm = ref(false)
const showWebhookEvents = ref(false)
const editingWebhook = ref(null)
const creatingWebhookForIntegration = ref(null)
const webhookEvents = ref([])
const viewingWebhookId = ref(null)

const webhookForm = ref({
  objective_id: '',
  field_mapping: {
    progress_percentage: 'payload.progress_percentage',
    current_value: 'payload.current_value',
    target_value: 'payload.target_value',
    comment: ''
  }
})

async function createWebhook(integrationId) {
  creatingWebhookForIntegration.value = integrationId
  webhookForm.value = {
    objective_id: '',
    field_mapping: {
      progress_percentage: 'payload.progress_percentage',
      current_value: 'payload.current_value',
      target_value: 'payload.target_value',
      comment: ''
    }
  }
  showWebhookForm.value = true
}

async function saveWebhook() {
  try {
    const integrationId = creatingWebhookForIntegration.value || editingWebhook.value?.integration_id
    
    let webhookResponse
    if (editingWebhook.value) {
      // Update existing webhook
      webhookResponse = await api.put(`/webhooks/${editingWebhook.value.id}`, {
        field_mapping: webhookForm.value.field_mapping
      })
    } else {
      // Create new webhook
      webhookResponse = await api.post('/webhooks', {
        integration_id: integrationId,
        objective_id: webhookForm.value.objective_id,
        field_mapping: webhookForm.value.field_mapping
      })
    }
    
    // Reload integrations to get updated webhooks
    await loadIntegrations()
    closeWebhookForm()
  } catch (error) {
    console.error('Error saving webhook:', error)
    console.error('Error details:', error.response?.data)
    alert('Error saving webhook: ' + (error.response?.data?.error || error.message))
  }
}

function editWebhook(webhook) {
  editingWebhook.value = webhook
  webhookForm.value = {
    objective_id: webhook.objective_id,
    field_mapping: webhook.field_mapping || {
      progress_percentage: 'payload.progress_percentage',
      current_value: 'payload.current_value',
      target_value: 'payload.target_value',
      comment: ''
    }
  }
  // Ensure comment field exists
  if (!webhookForm.value.field_mapping.comment) {
    webhookForm.value.field_mapping.comment = ''
  }
  showWebhookForm.value = true
}

async function deleteWebhook(webhookId) {
  if (!confirm('Are you sure you want to delete this webhook?')) return
  
  try {
    await api.delete(`/webhooks/${webhookId}`)
    await loadIntegrations()
  } catch (error) {
    console.error('Error deleting webhook:', error)
    alert('Error deleting webhook. Please try again.')
  }
}

async function viewWebhookEvents(webhookId) {
  viewingWebhookId.value = webhookId
  try {
    const response = await api.get(`/webhooks/${webhookId}/events?limit=50`)
    webhookEvents.value = response.data || []
    showWebhookEvents.value = true
  } catch (error) {
    console.error('Error loading webhook events:', error)
    alert('Error loading webhook events.')
  }
}

function closeWebhookForm() {
  showWebhookForm.value = false
  editingWebhook.value = null
  creatingWebhookForIntegration.value = null
  webhookForm.value = {
    objective_id: '',
    field_mapping: {
      progress_percentage: 'payload.progress_percentage',
      current_value: 'payload.current_value',
      target_value: 'payload.target_value',
      comment: ''
    }
  }
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert('Copied to clipboard!')
  }).catch(err => {
    console.error('Failed to copy:', err)
  })
}
</script>

