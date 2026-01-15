<script setup lang="ts">
import { Play, X, ExternalLink, Instagram, Youtube } from 'lucide-vue-next'

interface GalleryItem {
  id: string
  type: 'image' | 'video'
  platform: 'instagram' | 'youtube'
  embedUrl: string
  externalUrl: string
  thumbnail: string
  title: string
  aspectRatio: 'portrait' | 'landscape' | 'square'
}

// Fetch gallery data
const { data: galleryData } = await useAsyncData('gallery', () => 
  queryCollection('gallery').all()
)

// Extract the actual gallery array from meta.body
const items = computed(() => {
  if (!galleryData.value || galleryData.value.length === 0) return []
  return (galleryData.value[0]?.meta?.body || []) as GalleryItem[]
})

// Modal state
const selectedItem = ref<GalleryItem | null>(null)
const isModalOpen = computed(() => selectedItem.value !== null)

const openModal = (item: GalleryItem) => {
  selectedItem.value = item
  document.body.style.overflow = 'hidden'
}

const closeModal = () => {
  selectedItem.value = null
  document.body.style.overflow = ''
}

// Close on escape key
onMounted(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') closeModal()
  }
  window.addEventListener('keydown', handleEscape)
  onUnmounted(() => window.removeEventListener('keydown', handleEscape))
})

// Get aspect ratio class for masonry
const getAspectClass = (ratio: string) => {
  switch (ratio) {
    case 'portrait': return 'row-span-2'
    case 'landscape': return 'col-span-2'
    default: return ''
  }
}
</script>

<template>
  <div class="flex h-full">
    <!-- Main Content -->
    <div class="flex-1 overflow-y-auto">
      <div class="max-w-[1800px] mx-auto px-4 sm:px-6 py-8 lg:py-12">
        <!-- Header -->
        <header class="mb-8">
          <h1 class="font-sans text-3xl font-bold uppercase tracking-tight mb-2">
            Gallery
          </h1>
          <p class="font-serif text-muted-foreground text-lg">
            Moments I've captured.
          </p>
        </header>

        <!-- Masonry Grid -->
        <div class="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
          <div
            v-for="item in items"
            :key="item.id"
            @click="openModal(item)"
            class="break-inside-avoid group relative overflow-hidden rounded-lg cursor-pointer bg-muted/20"
          >
            <!-- Thumbnail -->
            <img
              :src="item.thumbnail"
              :alt="item.title"
              class="w-full h-auto object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              loading="lazy"
            />
            
            <!-- Video Indicator -->
            <div
              v-if="item.type === 'video'"
              class="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div class="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
                <Play class="w-5 h-5 text-white fill-white ml-0.5" />
              </div>
            </div>

            <!-- Hover Overlay -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div class="absolute bottom-0 left-0 right-0 p-3">
                <div class="flex items-center gap-2 text-white/90 text-sm">
                  <Instagram v-if="item.platform === 'instagram'" class="w-4 h-4" />
                  <Youtube v-else class="w-4 h-4" />
                  <span class="truncate">{{ item.title }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-if="items.length === 0" class="text-center py-20">
          <div class="w-12 h-12 text-muted-foreground mx-auto mb-4 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
            <Play class="w-6 h-6" />
          </div>
          <p class="font-serif text-muted-foreground">No media added yet.</p>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-opacity duration-200"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-200"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="isModalOpen"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
          @click.self="closeModal"
        >
          <!-- Close Button -->
          <button
            @click="closeModal"
            class="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-50"
          >
            <X class="w-6 h-6 text-white" />
          </button>

          <!-- External Link Button -->
          <a
            v-if="selectedItem"
            :href="selectedItem.externalUrl"
            target="_blank"
            class="absolute top-4 right-16 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-50 flex items-center gap-2"
          >
            <ExternalLink class="w-5 h-5 text-white" />
            <span class="text-white text-sm hidden sm:inline">Open in {{ selectedItem.platform === 'instagram' ? 'Instagram' : 'YouTube' }}</span>
          </a>

          <!-- Embed Container -->
          <div
            v-if="selectedItem"
            class="w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden shadow-2xl"
          >
            <iframe
              :src="selectedItem.embedUrl"
              class="w-full h-full"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            />
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
