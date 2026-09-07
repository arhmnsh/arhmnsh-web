<script setup lang="ts">
import { Play, ExternalLink, ChevronLeft, ChevronRight, ImageOff } from 'lucide-vue-next'

interface GalleryItem {
  id: string
  type: 'image' | 'video'
  platform: 'instagram' | 'youtube'
  embedUrl: string
  externalUrl: string
  thumbnail: string
  title: string
  alt?: string
  width?: number
  height?: number
  aspectRatio: 'portrait' | 'landscape' | 'square'
}

usePageSeo({
  title: 'Gallery',
  description: 'Photographs and videos from my travels, rides, and everyday moments.'
})

const { data: galleryData } = await useAsyncData('gallery', () => queryCollection('gallery').all())
const items = computed(() => (galleryData.value?.[0]?.meta?.body || []) as GalleryItem[])
const route = useRoute()
const router = useRouter()
const selectedIndex = ref(-1)
const isOpen = ref(false)
const selectedItem = computed(() => items.value[selectedIndex.value])
const failedThumbnails = ref(new Set<string>())

function markImageFailed(id: string) {
  failedThumbnails.value = new Set([...failedThumbnails.value, id])
}

function showItem(index: number) {
  const item = items.value[index]
  if (!item) return
  if (!isOpen.value) document.getElementById(`media-${item.id}`)?.focus({ preventScroll: true })
  selectedIndex.value = index
  isOpen.value = true
}

function selectItem(index: number) {
  const item = items.value[index]
  if (!item) return
  showItem(index)
  router.replace({ query: { ...route.query, media: item.id } })
}

function syncMediaFromQuery() {
  const index = items.value.findIndex(item => item.id === route.query.media)
  if (index >= 0) showItem(index)
  else isOpen.value = false
}

function moveSelection(direction: number) {
  if (items.value.length < 2) return
  selectItem((selectedIndex.value + direction + items.value.length) % items.value.length)
}

function onViewerKeydown(event: KeyboardEvent) {
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
  if (event.target instanceof HTMLElement && event.target.closest('input, textarea, select, [contenteditable="true"]')) return
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault()
    moveSelection(event.key === 'ArrowLeft' ? -1 : 1)
  }
}

// Derive a single valid player URL from the public video link.
const youtubeEmbedUrl = computed(() => {
  if (selectedItem.value?.platform !== 'youtube') return null
  try {
    const url = new URL(selectedItem.value.externalUrl)
    if (!['youtube.com', 'www.youtube.com', 'youtu.be'].includes(url.hostname)) return null
    const videoId = url.hostname === 'youtu.be'
      ? url.pathname.slice(1)
      : url.searchParams.get('v') || url.pathname.match(/^\/(?:shorts|embed)\/([^/]+)/)?.[1]
    return videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId)
      ? `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`
      : null
  } catch {
    return null
  }
})

onMounted(syncMediaFromQuery)
watch(() => route.query.media, syncMediaFromQuery)
watch(isOpen, (open) => {
  if (!open && route.query.media) {
    const { media, ...query } = route.query
    router.replace({ query })
  }
})
</script>

<template>
  <div class="flex h-full">
    <div class="min-w-0 flex-1 overflow-y-auto">
      <div class="mx-auto max-w-[1800px] px-4 py-8 sm:px-6 lg:py-12">
        <header class="mb-8">
          <h1 class="mb-2 font-sans text-3xl font-bold uppercase tracking-tight">Gallery</h1>
          <p class="font-serif text-lg text-muted-foreground">Moments I've captured, on the road and along the way.</p>
        </header>

        <div class="columns-2 gap-4 md:columns-3 lg:columns-4">
          <button
            v-for="(item, index) in items"
            :id="`media-${item.id}`"
            :key="item.id"
            type="button"
            class="gallery-card group mb-4 block w-full break-inside-avoid overflow-hidden rounded-lg border border-border bg-background text-left"
            :aria-label="`Open ${item.type === 'video' ? 'video' : 'photo'}: ${item.title}`"
            aria-haspopup="dialog"
            @click="selectItem(index)"
          >
            <span class="relative block overflow-hidden bg-muted">
              <img
                v-if="!failedThumbnails.has(item.id)"
                :src="item.thumbnail"
                :alt="item.alt || item.title"
                :width="item.width || 1280"
                :height="item.height || 720"
                class="gallery-thumbnail h-auto w-full object-cover"
                loading="lazy"
                decoding="async"
                @error="markImageFailed(item.id)"
              />
              <span v-else class="flex aspect-video items-center justify-center p-4 text-center text-xs text-muted-foreground">
                <ImageOff class="mr-2 h-5 w-5 shrink-0" aria-hidden="true" />
                Preview unavailable
              </span>
              <span v-if="item.type === 'video'" class="absolute inset-0 flex items-center justify-center" aria-hidden="true">
                <span class="flex h-11 w-11 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur-sm">
                  <Play class="ml-0.5 h-5 w-5 fill-white" />
                </span>
              </span>
            </span>
          </button>
        </div>

        <div v-if="items.length === 0" class="py-20 text-center">
          <p class="font-serif text-muted-foreground">Photographs and videos will appear here soon.</p>
          <NuxtLink to="/articles" class="mt-4 inline-block underline underline-offset-4">Explore the articles</NuxtLink>
        </div>
      </div>
    </div>

    <AccessibleDialog
      v-model:open="isOpen"
      :title="selectedItem?.title || 'Gallery viewer'"
      close-label="Close gallery viewer"
      size="wide"
      @keydown="onViewerKeydown"
    >
      <div v-if="selectedItem && isOpen" class="space-y-4">
        <div class="gallery-media">
          <iframe
            v-if="selectedItem.type === 'video' && youtubeEmbedUrl"
            :key="selectedItem.id"
            :src="youtubeEmbedUrl"
            :title="`${selectedItem.title} — YouTube video player`"
            class="gallery-video"
            :class="{ 'gallery-video--portrait': selectedItem.aspectRatio === 'portrait' }"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerpolicy="strict-origin-when-cross-origin"
            allowfullscreen
          />
          <img
            v-else-if="!failedThumbnails.has(selectedItem.id)"
            :key="selectedItem.id"
            :src="selectedItem.thumbnail"
            :alt="selectedItem.alt || selectedItem.title"
            :width="selectedItem.width || 1280"
            :height="selectedItem.height || 720"
            class="gallery-photo"
            @error="markImageFailed(selectedItem.id)"
          />
          <p v-else class="p-8 text-center text-sm text-white/80">Preview unavailable.</p>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <a
            :href="selectedItem.externalUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex min-h-11 items-center gap-2 rounded text-sm font-medium underline underline-offset-4"
          >
            {{ selectedItem.type === 'video' ? 'Watch' : 'View original' }} on {{ selectedItem.platform === 'instagram' ? 'Instagram' : 'YouTube' }}
            <ExternalLink class="h-4 w-4" aria-hidden="true" />
            <span class="sr-only"> (opens in a new tab)</span>
          </a>
          <div class="flex items-center gap-3" aria-label="Browse gallery">
            <button type="button" class="gallery-arrow" aria-label="Previous item" :disabled="items.length < 2" @click="moveSelection(-1)">
              <ChevronLeft class="h-5 w-5" aria-hidden="true" />
            </button>
            <span class="min-w-14 text-center text-xs tabular-nums text-muted-foreground" role="status" aria-live="polite" aria-atomic="true">{{ selectedIndex + 1 }} / {{ items.length }}</span>
            <button type="button" class="gallery-arrow" aria-label="Next item" :disabled="items.length < 2" @click="moveSelection(1)">
              <ChevronRight class="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </AccessibleDialog>
  </div>
</template>

<style scoped>
.gallery-card { cursor: pointer; }
.gallery-card:focus-visible, .gallery-arrow:focus-visible { outline: 2px solid currentColor; outline-offset: 3px; }
.gallery-thumbnail { transition: transform 260ms ease; }
.gallery-card:hover .gallery-thumbnail { transform: scale(1.035); }
.gallery-media { display: flex; justify-content: center; overflow: hidden; border-radius: 0.5rem; background: #101010; }
.gallery-photo { width: auto; height: auto; max-width: 100%; max-height: 60dvh; object-fit: contain; }
.gallery-video { display: block; width: 100%; aspect-ratio: 16 / 9; max-height: 60dvh; border: 0; }
.gallery-video--portrait { width: min(100%, 33.75dvh); aspect-ratio: 9 / 16; }
.gallery-arrow { display: grid; width: 2.75rem; height: 2.75rem; place-items: center; border: 1px solid hsl(var(--border)); border-radius: 999px; cursor: pointer; }
.gallery-arrow:hover { background: hsl(var(--muted)); }
.gallery-arrow:disabled { opacity: 0.4; cursor: default; }
@media (prefers-reduced-motion: reduce) { .gallery-thumbnail { transition: none; } .gallery-card:hover .gallery-thumbnail { transform: none; } }
</style>
