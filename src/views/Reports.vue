<template>
  <AppLayout>
    <div>
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Reports & Analytics</h1>

      <!-- Tag-based Reporting -->
      <div class="mb-8">
        <h2 class="text-xl font-semibold mb-4">Reports by Tag</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="tag in objectivesStore.tags"
            :key="tag"
            class="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
            @click="selectTag(tag)"
          >
            <div class="flex items-center justify-between mb-4">
              <Tag :tag="tag" />
              <span class="text-sm text-gray-500">
                {{ getObjectivesByTag(tag).length }} objectives
              </span>
            </div>
            <div v-if="tagStats[tag]" class="space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Avg Progress:</span>
                <span class="font-semibold">{{ Math.round(tagStats[tag].averageProgress) }}%</span>
              </div>
              <div class="text-sm text-gray-600">
                <div>Active: {{ tagStats[tag].byStatus.Active || 0 }}</div>
                <div>Completed: {{ tagStats[tag].byStatus.Completed || 0 }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Selected Tag Report -->
      <div v-if="selectedTag" class="bg-white rounded-lg shadow-md p-6 mb-8">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-semibold">Report: {{ selectedTag }}</h2>
          <button
            @click="selectedTag = null"
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
        </div>

        <div v-if="tagStats[selectedTag]" class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="text-sm text-gray-600 mb-1">Total Objectives</div>
            <div class="text-2xl font-bold">{{ tagStats[selectedTag].total }}</div>
          </div>
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="text-sm text-gray-600 mb-1">Average Progress</div>
            <div class="text-2xl font-bold text-primary-600">
              {{ Math.round(tagStats[selectedTag].averageProgress) }}%
            </div>
          </div>
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="text-sm text-gray-600 mb-1">Active</div>
            <div class="text-2xl font-bold text-green-600">
              {{ tagStats[selectedTag].byStatus.Active || 0 }}
            </div>
          </div>
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="text-sm text-gray-600 mb-1">Completed</div>
            <div class="text-2xl font-bold text-blue-600">
              {{ tagStats[selectedTag].byStatus.Completed || 0 }}
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ObjectiveCard
            v-for="objective in getObjectivesByTag(selectedTag)"
            :key="objective.id"
            :objective="objective"
          />
        </div>
      </div>

      <!-- Overall Statistics -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold mb-4">Overall Statistics</h2>
        <div v-if="objectivesStore.stats" class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div class="text-sm text-gray-600 mb-1">Total Objectives</div>
            <div class="text-2xl font-bold">{{ objectivesStore.stats.total }}</div>
          </div>
          <div>
            <div class="text-sm text-gray-600 mb-1">Average Progress</div>
            <div class="text-2xl font-bold text-primary-600">
              {{ Math.round(objectivesStore.stats.averageProgress) }}%
            </div>
          </div>
          <div>
            <div class="text-sm text-gray-600 mb-1">Active</div>
            <div class="text-2xl font-bold text-green-600">{{ objectivesStore.stats.active }}</div>
          </div>
          <div>
            <div class="text-sm text-gray-600 mb-1">Completed</div>
            <div class="text-2xl font-bold text-blue-600">{{ objectivesStore.stats.completed }}</div>
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
import ObjectiveCard from '../components/objectives/ObjectiveCard.vue'
import Tag from '../components/common/Tag.vue'

const objectivesStore = useObjectivesStore()
const selectedTag = ref(null)
const tagStats = ref({})

const getObjectivesByTag = (tag) => {
  return objectivesStore.objectives.filter(obj =>
    obj.tags && obj.tags.includes(tag)
  )
}

onMounted(async () => {
  await objectivesStore.fetchObjectives()
  await objectivesStore.fetchTags()
  await objectivesStore.fetchStats()
  await loadTagStats()
})

async function loadTagStats() {
  for (const tag of objectivesStore.tags) {
    try {
      const stats = await objectivesStore.getTagStats(tag)
      tagStats.value[tag] = stats
    } catch (error) {
      console.error(`Error loading stats for tag ${tag}:`, error)
    }
  }
}

async function selectTag(tag) {
  selectedTag.value = tag
  if (!tagStats.value[tag]) {
    try {
      const stats = await objectivesStore.getTagStats(tag)
      tagStats.value[tag] = stats
    } catch (error) {
      console.error(`Error loading stats for tag ${tag}:`, error)
    }
  }
}
</script>

