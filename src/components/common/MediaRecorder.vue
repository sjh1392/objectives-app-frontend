<template>
  <div class="media-recorder">
    <!-- Recording Controls -->
    <div v-if="!isRecording && !recordedBlob && !uploadedUrl" class="flex gap-2">
      <button
        @click="startRecording('audio')"
        type="button"
        class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
        :disabled="isUploading"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
        <span>Record Voice</span>
      </button>
      <button
        @click="startRecording('video', 'camera')"
        type="button"
        class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
        :disabled="isUploading"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        <span>Record Webcam</span>
      </button>
      <button
        @click="startRecording('video', 'screen')"
        type="button"
        class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
        :disabled="isUploading"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <span>Record Screen</span>
      </button>
    </div>

    <!-- Recording Status -->
    <div v-if="isRecording" class="space-y-4">
      <!-- Video Preview (for video recording) -->
      <div v-if="mediaType === 'video'" class="relative bg-black rounded-lg overflow-hidden">
        <video
          ref="previewVideo"
          autoplay
          muted
          playsinline
          class="w-full max-w-2xl mx-auto"
          style="max-height: 400px; object-fit: contain;"
        ></video>
        <div class="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1.5 rounded-md">
          <div class="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <span class="text-sm font-medium">Recording</span>
          <span class="text-sm">{{ formatTime(recordingTime) }}</span>
        </div>
      </div>
      
      <!-- Audio Recording Status -->
      <div v-else class="flex items-center gap-4 p-4 bg-red-50 border border-red-200 rounded-md">
        <div class="flex items-center gap-3 flex-1">
          <div class="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
          <span class="text-sm font-medium text-red-700">Recording...</span>
          <span class="text-sm text-red-600">{{ formatTime(recordingTime) }}</span>
          
          <!-- Audio Wave Visualization -->
          <div class="flex items-end gap-2 ml-4" style="height: 40px;">
            <div class="w-2 bg-red-500 rounded-full wave-bar" style="animation-delay: 0s;"></div>
            <div class="w-2 bg-red-500 rounded-full wave-bar" style="animation-delay: 0.1s;"></div>
            <div class="w-2 bg-red-500 rounded-full wave-bar" style="animation-delay: 0.2s;"></div>
            <div class="w-2 bg-red-500 rounded-full wave-bar" style="animation-delay: 0.3s;"></div>
            <div class="w-2 bg-red-500 rounded-full wave-bar" style="animation-delay: 0.4s;"></div>
            <div class="w-2 bg-red-500 rounded-full wave-bar" style="animation-delay: 0.5s;"></div>
            <div class="w-2 bg-red-500 rounded-full wave-bar" style="animation-delay: 0.6s;"></div>
            <div class="w-2 bg-red-500 rounded-full wave-bar" style="animation-delay: 0.7s;"></div>
          </div>
        </div>
        <button
          @click="stopRecording"
          type="button"
          class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm transition-colors"
        >
          Stop
        </button>
      </div>
      
      <!-- Stop button for video (shown below preview) -->
      <div v-if="mediaType === 'video'" class="flex justify-center">
        <button
          @click="stopRecording"
          type="button"
          class="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium transition-colors"
        >
          Stop Recording
        </button>
      </div>
    </div>

    <!-- Recorded Media Preview -->
    <div v-if="recordedBlob && !isUploading" class="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-md">
      <div class="flex items-center justify-between mb-3">
        <span class="text-sm font-medium text-gray-700">
          {{ currentMediaType === 'audio' ? 'Voice Note' : 'Video Note' }} ({{ formatTime(recordingDuration) }})
        </span>
        <div class="flex gap-2">
          <button
            @click="playPreview"
            type="button"
            class="px-3 py-1 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            {{ isPlaying ? 'Pause' : 'Play' }}
          </button>
          <button
            @click="deleteRecording"
            type="button"
            class="px-3 py-1 text-sm border border-red-300 rounded-md text-red-700 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>
      
      <!-- Audio Player -->
      <audio
        v-if="currentMediaType === 'audio'"
        ref="audioPlayer"
        :src="previewUrl"
        @timeupdate="updatePlaybackTime"
        @ended="isPlaying = false"
        class="w-full"
      ></audio>
      
      <!-- Video Player -->
      <video
        v-if="currentMediaType === 'video'"
        ref="videoPlayer"
        :src="previewUrl"
        @timeupdate="updatePlaybackTime"
        @ended="isPlaying = false"
        controls
        class="w-full rounded-md"
      ></video>
    </div>

    <!-- Uploading Status -->
    <div v-if="isUploading" class="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
      <div class="flex items-center gap-2">
        <div class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span class="text-sm text-blue-700">Uploading {{ currentMediaType }}...</span>
      </div>
    </div>

    <!-- Uploaded Media -->
    <div v-if="uploadedUrl && !isUploading" class="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
      <div class="flex items-center justify-between mb-3">
        <span class="text-sm font-medium text-green-700">
          {{ currentMediaType === 'audio' ? 'Voice Note' : 'Video Note' }} uploaded
        </span>
        <button
          @click="removeMedia"
          type="button"
          class="px-3 py-1 text-sm border border-red-300 rounded-md text-red-700 hover:bg-red-50"
        >
          Remove
        </button>
      </div>
      
      <!-- Audio Player -->
      <audio
        v-if="currentMediaType === 'audio'"
        :src="uploadedUrl"
        controls
        class="w-full"
      ></audio>
      
      <!-- Video Player -->
      <video
        v-if="currentMediaType === 'video'"
        :src="uploadedUrl"
        controls
        class="w-full rounded-md"
      ></video>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
import api from '../../services/api'

const props = defineProps({
  modelValue: {
    type: String,
    default: null
  },
  mediaType: {
    type: String,
    default: null // 'audio' or 'video'
  }
})

const emit = defineEmits(['update:modelValue', 'update:mediaType'])

const isRecording = ref(false)
const recordedBlob = ref(null)
const previewUrl = ref(null)
const uploadedUrl = ref(props.modelValue)
const isUploading = ref(false)
const isPlaying = ref(false)
const recordingTime = ref(0)
const recordingDuration = ref(0)
const playbackTime = ref(0)

let mediaRecorder = null
let recordingStream = null
let recordingInterval = null
let recordingChunks = [] // Store chunks outside function scope
const audioPlayer = ref(null)
const videoPlayer = ref(null)
const previewVideo = ref(null)

let mediaType = ref(null)
let videoSource = ref(null) // 'camera' or 'screen'

const currentMediaType = computed(() => props.mediaType || mediaType.value)

async function startRecording(type, source = 'camera') {
  try {
    mediaType.value = type
    videoSource.value = source
    
    let stream
    
    if (type === 'video') {
      if (source === 'screen') {
        // Screen recording with audio
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            cursor: 'always'
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        })
        
        // Try to add microphone audio if screen share audio isn't available
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true })
          const audioTrack = audioStream.getAudioTracks()[0]
          if (audioTrack) {
            stream.addTrack(audioTrack)
          }
        } catch (audioError) {
          console.warn('Could not add microphone audio to screen recording:', audioError)
        }
      } else {
        // Webcam recording
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        })
      }
      
      // Show video preview - use nextTick to ensure ref is available
      setTimeout(() => {
        if (previewVideo.value) {
          previewVideo.value.srcObject = stream
          previewVideo.value.play().catch(err => {
            console.warn('Could not autoplay preview:', err)
          })
        }
      }, 100)
    } else {
      // Audio only
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    }
    
    recordingStream = stream
    recordingChunks = [] // Reset chunks array
    
    // Determine MIME type based on browser support
    const options = { mimeType: 'video/webm;codecs=vp8,opus' }
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      options.mimeType = 'video/webm'
    }
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      options.mimeType = '' // Let browser choose
    }
    
    mediaRecorder = new MediaRecorder(stream, options)
    
    let wasRecordingStarted = false // Track if recording actually started
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        console.log('Data available:', event.data.size, 'bytes')
        recordingChunks.push(event.data)
      } else {
        console.log('Data available event fired but data is empty or size is 0')
      }
    }
    
    mediaRecorder.onerror = (event) => {
      console.error('MediaRecorder error:', event.error)
      alert('Recording error occurred. Please try again.')
      stopRecording()
    }
    
    mediaRecorder.onstop = () => {
      // Only process if recording was actually started
      if (!wasRecordingStarted) {
        console.log('Recording stopped before it could start (likely cancelled)')
        // Clean up silently without showing error
        isRecording.value = false
        if (previewVideo.value) {
          previewVideo.value.srcObject = null
        }
        if (recordingStream) {
          recordingStream.getTracks().forEach(track => track.stop())
          recordingStream = null
        }
        recordingChunks = []
        mediaType.value = null
        videoSource.value = null
        return
      }
      
      // Wait a bit for any final data chunks to arrive
      setTimeout(() => {
        try {
          console.log('Recording stopped. Chunks:', recordingChunks.length)
          const totalSize = recordingChunks.reduce((sum, chunk) => sum + (chunk?.size || 0), 0)
          console.log('Total size:', totalSize, 'bytes')
          
          if (recordingChunks.length === 0 || totalSize === 0) {
            console.warn('No recording chunks available or all chunks empty')
            // Only show error if recording was actually attempted (not cancelled immediately)
            if (recordingTime.value >= 1) {
              alert('Recording failed - no data captured. This might happen if the recording was too short. Please try recording for at least 1-2 seconds.')
            }
            isRecording.value = false
            
            // Clean up
            if (previewVideo.value) {
              previewVideo.value.srcObject = null
            }
            if (recordingStream) {
              recordingStream.getTracks().forEach(track => track.stop())
              recordingStream = null
            }
            recordingChunks = []
            mediaType.value = null
            videoSource.value = null
            return
          }
          
          recordedBlob.value = new Blob(recordingChunks, { 
            type: type === 'video' ? (options.mimeType || 'video/webm') : 'audio/webm' 
          })
          console.log('Created blob:', recordedBlob.value.size, 'bytes', 'Type:', recordedBlob.value.type)
          previewUrl.value = URL.createObjectURL(recordedBlob.value)
          recordingDuration.value = recordingTime.value
          recordingTime.value = 0
          
          // Clear video preview
          if (previewVideo.value) {
            previewVideo.value.srcObject = null
          }
          
          // Stop all tracks
          if (recordingStream) {
            recordingStream.getTracks().forEach(track => track.stop())
            recordingStream = null
          }
          
          videoSource.value = null
          recordingChunks = [] // Clear chunks after creating blob
          
          // Auto-upload after recording stops
          uploadRecording()
        } catch (error) {
          console.error('Error processing recording:', error)
          alert('Error processing recording. Please try again.')
          isRecording.value = false
        }
      }, 200) // Small delay to ensure all data chunks are received
    }
    
    // Start recording with timeslice to ensure data is captured
    // Use a smaller timeslice for more frequent data collection
    try {
      mediaRecorder.start(250) // Request data every 250ms
      wasRecordingStarted = true
      isRecording.value = true
      recordingTime.value = 0
      
      // Handle screen share stop event (user stops sharing from browser UI)
      // Set this up AFTER recording has started
      if (source === 'screen' && stream) {
        const videoTrack = stream.getVideoTracks()[0]
        if (videoTrack) {
          videoTrack.addEventListener('ended', () => {
            console.log('Screen share ended by user')
            // Only stop if we're actually recording
            if (isRecording.value && mediaRecorder && mediaRecorder.state === 'recording') {
              stopRecording()
            }
          })
        }
      }
    } catch (startError) {
      console.error('Error starting MediaRecorder:', startError)
      alert('Failed to start recording. Please try again.')
      isRecording.value = false
      if (recordingStream) {
        recordingStream.getTracks().forEach(track => track.stop())
        recordingStream = null
      }
      throw startError
    }
    
    // Update recording time
    recordingInterval = setInterval(() => {
      recordingTime.value++
    }, 1000)
    
  } catch (error) {
    console.error('Error starting recording:', error)
    isRecording.value = false
    mediaType.value = null
    videoSource.value = null
    
    // Clean up any partial streams
    if (recordingStream) {
      recordingStream.getTracks().forEach(track => track.stop())
      recordingStream = null
    }
    
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      alert(`Permission denied. Please allow ${type === 'video' ? (source === 'screen' ? 'screen sharing' : 'camera') : 'microphone'} access and try again.`)
    } else if (error.name === 'NotFoundError') {
      alert(`No ${type === 'video' ? (source === 'screen' ? 'screen' : 'camera') : 'microphone'} found. Please check your device.`)
    } else {
      alert(`Failed to start ${type} recording: ${error.message}`)
    }
  }
}

function stopRecording() {
  try {
    console.log('Stop recording called. MediaRecorder state:', mediaRecorder?.state)
    console.log('Current chunks:', recordingChunks.length)
    
    if (mediaRecorder) {
      if (mediaRecorder.state === 'recording') {
        // Request final data before stopping
        mediaRecorder.requestData()
        mediaRecorder.stop()
      } else if (mediaRecorder.state === 'paused') {
        mediaRecorder.requestData()
        mediaRecorder.stop()
      } else if (mediaRecorder.state === 'inactive') {
        console.warn('MediaRecorder already stopped')
      }
    }
    
    // Don't set isRecording to false immediately - let onstop handle it
    // This ensures the UI doesn't disappear before data is processed
    
    // Stop the timer
    if (recordingInterval) {
      clearInterval(recordingInterval)
      recordingInterval = null
    }
    
    // Note: Don't stop tracks or clear preview here - let onstop do it
    // This ensures we don't interrupt data collection
  } catch (error) {
    console.error('Error stopping recording:', error)
    // Force cleanup even if there's an error
    isRecording.value = false
    if (recordingStream) {
      recordingStream.getTracks().forEach(track => track.stop())
      recordingStream = null
    }
    if (previewVideo.value) {
      previewVideo.value.srcObject = null
    }
    if (recordingInterval) {
      clearInterval(recordingInterval)
      recordingInterval = null
    }
  }
}

function deleteRecording() {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
  recordedBlob.value = null
  previewUrl.value = null
  recordingDuration.value = 0
  mediaType.value = null
  emit('update:mediaType', null)
}

function playPreview() {
  const player = currentMediaType.value === 'audio' ? audioPlayer.value : videoPlayer.value
  if (!player) return
  
  if (isPlaying.value) {
    player.pause()
  } else {
    player.play()
  }
  isPlaying.value = !isPlaying.value
}

function updatePlaybackTime() {
  const player = currentMediaType.value === 'audio' ? audioPlayer.value : videoPlayer.value
  if (player) {
    playbackTime.value = player.currentTime
  }
}

async function uploadRecording() {
  if (!recordedBlob.value) return
  
  isUploading.value = true
  
  try {
    const formData = new FormData()
    const fileExtension = currentMediaType.value === 'video' ? '.webm' : '.webm'
    const fileName = `${currentMediaType.value}-${Date.now()}${fileExtension}`
    
    // Create a File object from the Blob with proper MIME type
    const mimeType = currentMediaType.value === 'video' ? 'video/webm' : 'audio/webm'
    const file = new File([recordedBlob.value], fileName, { 
      type: mimeType
    })
    
    formData.append('file', file, fileName) // Explicitly set filename
    formData.append('type', currentMediaType.value)
    
    const response = await api.post('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
    uploadedUrl.value = response.data.url
    emit('update:modelValue', response.data.url)
    emit('update:mediaType', currentMediaType.value)
    
    // Emit event that media was uploaded successfully
    emit('media-uploaded', {
      url: response.data.url,
      type: currentMediaType.value
    })
    
    // Clean up preview URL
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value)
      previewUrl.value = null
    }
    recordedBlob.value = null
    
  } catch (error) {
    console.error('Error uploading media:', error)
    alert(`Failed to upload ${currentMediaType.value || 'media'}: ${error.response?.data?.error || error.message}`)
  } finally {
    isUploading.value = false
  }
}

function removeMedia() {
  uploadedUrl.value = null
  emit('update:modelValue', null)
  emit('update:mediaType', null)
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

onBeforeUnmount(() => {
  // Clean up
  if (recordingStream) {
    recordingStream.getTracks().forEach(track => track.stop())
  }
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
  if (recordingInterval) {
    clearInterval(recordingInterval)
  }
})
</script>

<style scoped>
.media-recorder {
  margin-top: 1rem;
}

/* Audio Wave Animation */
.wave-bar {
  height: 100%;
  min-height: 8px;
  max-height: 40px;
  animation: wave 1.2s ease-in-out infinite;
}

@keyframes wave {
  0%, 100% {
    height: 8px;
    opacity: 0.6;
  }
  50% {
    height: 40px;
    opacity: 1;
  }
}
</style>


