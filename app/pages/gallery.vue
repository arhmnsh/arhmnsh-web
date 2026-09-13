<script setup lang="ts">
import { Play, ExternalLink, ChevronLeft, ChevronRight, ImageOff, Camera, ArrowUpRight } from 'lucide-vue-next'

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
const mediaFilter = ref<'all' | 'image' | 'video'>('all')
const filters = [
  { value: 'all', label: 'Everything' },
  { value: 'image', label: 'Photographs' },
  { value: 'video', label: 'Films' },
] as const
const visibleItems = computed(() => items.value
  .map((item, index) => ({ item, index }))
  .filter(({ item }) => mediaFilter.value === 'all' || item.type === mediaFilter.value))
const viewerPosition = computed(() => visibleItems.value.findIndex(({ index }) => index === selectedIndex.value) + 1)
const displayTitle = (item: GalleryItem) => ['Photograph', 'Video'].includes(item.title)
  ? item.alt || item.title
  : item.title

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
  if (index >= 0) {
    if (mediaFilter.value !== 'all' && items.value[index]?.type !== mediaFilter.value) mediaFilter.value = 'all'
    showItem(index)
  } else isOpen.value = false
}

function moveSelection(direction: number) {
  const available = visibleItems.value
  if (available.length < 2) return
  const current = available.findIndex(({ index }) => index === selectedIndex.value)
  const next = available[(current + direction + available.length) % available.length]
  if (next) selectItem(next.index)
}

function onViewerKeydown(event: KeyboardEvent) {
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
  if (event.target instanceof HTMLElement && event.target.closest('input, textarea, select, [contenteditable="true"]')) return
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault()
    moveSelection(event.key === 'ArrowLeft' ? -1 : 1)
  }
}

let swipeStart: { x: number, y: number } | null = null
function onTouchStart(event: TouchEvent) {
  const touch = event.touches[0]
  swipeStart = event.touches.length === 1 && touch ? { x: touch.clientX, y: touch.clientY } : null
}
function onTouchEnd(event: TouchEvent) {
  const touch = event.changedTouches[0]
  const start = swipeStart
  swipeStart = null
  if (!start || !touch || event.touches.length) return
  const dx = touch.clientX - start.x
  const dy = touch.clientY - start.y
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) moveSelection(dx < 0 ? 1 : -1)
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
  <div class="gallery-page studio-page">
    <header class="gallery-header">
      <div>

        <h1 class="page-title">Gallery</h1>

      </div>
      <p class="gallery-intro">Photographs, films, and a different point of view.</p>
    </header>

    <div class="gallery-toolbar">
      <div class="gallery-filters" role="group" aria-label="Filter gallery">
        <button v-for="filter in filters" :key="filter.value" type="button" class="filter-chip" :aria-pressed="mediaFilter === filter.value" @click="mediaFilter = filter.value">{{ filter.label }}</button>
      </div>
      <p class="gallery-count" role="status" aria-live="polite" aria-atomic="true">{{ visibleItems.length }} items</p>
    </div>

    <div class="contact-sheet">
      <button
        v-for="{ item, index } in visibleItems"
        :id="`media-${item.id}`"
        :key="item.id"
        type="button"
        class="gallery-card"
        data-cursor="view"
        :aria-label="`Open ${item.type === 'video' ? 'video' : 'photo'}: ${displayTitle(item)}`"
        aria-haspopup="dialog"
        @click="selectItem(index)"
      >
        <span class="gallery-frame">
          <img
            v-if="!failedThumbnails.has(item.id)"
            :src="item.thumbnail"
            :alt="item.alt || item.title"
            :width="item.width || 1280"
            :height="item.height || 720"
            class="gallery-thumbnail"
            :loading="index < 3 ? 'eager' : 'lazy'"
            decoding="async"
            @error="markImageFailed(item.id)"
          />
          <span v-else class="gallery-fallback">
            <ImageOff :size="24" aria-hidden="true" />
            Preview unavailable
          </span>
          <span v-if="item.type === 'video'" class="gallery-video-indicator" aria-hidden="true">
            <Play :size="16" class="fill-current" /><span>Play</span>
          </span>
          <span v-else class="gallery-expand" aria-hidden="true"><ArrowUpRight :size="19" /></span>
        </span>

      </button>
    </div>

    <div v-if="visibleItems.length === 0" class="gallery-empty surface-card">
      <Camera :size="28" :stroke-width="1.4" aria-hidden="true" />
      <p>{{ items.length ? 'No items match this filter.' : 'Photographs and videos will appear here soon.' }}</p>
      <button v-if="items.length" type="button" class="text-link" @click="mediaFilter = 'all'">Show all</button>
      <NuxtLink v-else to="/articles" class="text-link">Explore the articles <ArrowUpRight :size="16" aria-hidden="true" /></NuxtLink>
    </div>


    <AccessibleDialog
      v-model:open="isOpen"
      :title="selectedItem ? displayTitle(selectedItem) : 'Gallery viewer'"
      close-label="Close gallery viewer"
      size="wide"
      @keydown="onViewerKeydown"
    >
      <div v-if="selectedItem && isOpen" class="space-y-4">
        <div class="gallery-media" @touchstart.passive="onTouchStart" @touchend.passive="onTouchEnd" @touchcancel="swipeStart = null">
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
          <a
            v-if="selectedItem.type === 'video' && !youtubeEmbedUrl"
            :href="selectedItem.externalUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="gallery-play"
            :aria-label="`Play video on ${selectedItem.platform === 'instagram' ? 'Instagram' : 'YouTube'} (opens in a new tab)`"
          >
            <Play class="ml-1 h-7 w-7 fill-current" aria-hidden="true" />
          </a>
        </div>

        <div class="gallery-viewer-footer">
          <a
            :href="selectedItem.externalUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="text-link gallery-source"
          >
            {{ selectedItem.type === 'video' ? 'Watch' : 'View original' }} on {{ selectedItem.platform === 'instagram' ? 'Instagram' : 'YouTube' }}
            <ExternalLink class="h-4 w-4" aria-hidden="true" />
            <span class="sr-only"> (opens in a new tab)</span>
          </a>
          <div class="flex items-center gap-3" aria-label="Browse gallery">
            <button type="button" class="gallery-arrow" aria-label="Previous item" :disabled="visibleItems.length < 2" @click="moveSelection(-1)">
              <ChevronLeft class="h-5 w-5" aria-hidden="true" />
            </button>
            <span class="min-w-14 text-center text-xs tabular-nums text-muted-foreground" role="status" aria-live="polite" aria-atomic="true">{{ viewerPosition }} / {{ visibleItems.length }}</span>
            <button type="button" class="gallery-arrow" aria-label="Next item" :disabled="visibleItems.length < 2" @click="moveSelection(1)">
              <ChevronRight class="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </AccessibleDialog>
  </div>
</template>

<style scoped>
.gallery-header { display:flex; align-items:center; justify-content:space-between; gap:40px; margin-bottom:40px; }
.gallery-header .page-description { max-width:550px; }
.gallery-intro { max-width: 260px; color: var(--studio-muted); font-size: 12px; line-height: 1.8; }
.gallery-header em { font-family:var(--font-serif); font-weight:400; }
.gallery-mark { display:flex; flex-shrink:0; align-items:center; gap:15px; color:var(--studio-accent); transform:rotate(-5deg); }
.gallery-mark span { font:italic 16px/1.45 var(--font-serif); }
.gallery-toolbar { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:16px; padding:20px 0 24px; border-top:1px solid var(--studio-line); }
.gallery-filters { display:flex; flex-wrap:wrap; gap:7px; }
.filter-chip[aria-pressed=true] { background:var(--studio-accent); color:var(--studio-paper); border-color:var(--studio-accent); }
.gallery-count { margin:0; color:var(--studio-muted); font-size:11px; }
.gallery-count span { margin:0 6px; opacity:.45; }
.contact-sheet { columns:3; column-gap:22px; }
.gallery-card { display:inline-block; width:100%; break-inside:avoid; margin:0 0 28px; padding:0; border:0; background:transparent; text-align:left; vertical-align:top; cursor:pointer; transition:opacity 200ms; }
.gallery-card:focus-visible, .gallery-arrow:focus-visible { outline:2px solid var(--studio-accent); outline-offset:4px; }
.gallery-frame { position:relative; display:block; overflow:hidden; background:hsl(var(--muted)); border-radius:2px; }
.gallery-thumbnail { display:block; width:100%; height:auto; object-fit:cover; transition:transform 500ms cubic-bezier(.2,.7,.2,1); }
.gallery-fallback { display:flex; aspect-ratio:4/3; align-items:center; justify-content:center; flex-direction:column; gap:10px; color:var(--studio-muted); font-size:12px; }
.gallery-video-indicator { position:absolute; bottom:12px; left:12px; display:flex; align-items:center; gap:8px; min-height:32px; padding:7px 10px; border:1px solid rgb(255 255 255 / 30%); border-radius:999px; color:white; background:rgb(19 24 20 / 72%); box-shadow:inset 0 1px 0 rgb(255 255 255 / 12%); font-size:10px; }
.gallery-expand { position:absolute; right:12px; bottom:12px; display:grid; width:32px; height:32px; place-items:center; border-radius:50%; background:var(--studio-paper); color:hsl(var(--foreground)); opacity:0; transform:translateY(5px); transition:opacity 200ms,transform 200ms; }
.print-caption { display:block; padding:13px 6px 7px; }
.print-meta { display:flex; justify-content:space-between; gap:12px; color:var(--studio-muted); font:9px/1.4 var(--font-mono); letter-spacing:.07em; }
.print-title { display:-webkit-box; -webkit-box-orient:vertical; -webkit-line-clamp:2; overflow:hidden; margin-top:8px; font-size:12px; line-height:1.55; color:hsl(var(--foreground)); }
.gallery-card:focus-visible .gallery-expand { opacity:1; transform:none; }
.gallery-footnote { margin:16px 0 0; text-align:center; color:var(--studio-muted); font:italic 15px/1.5 var(--font-serif); }
.gallery-empty { display:flex; flex-direction:column; align-items:center; gap:16px; padding:65px 24px; text-align:center; color:var(--studio-muted); }
.gallery-empty p { margin:0; }
.gallery-media { position:relative; display:flex; justify-content:center; overflow:hidden; border-radius:8px; background:#111; touch-action:pan-y pinch-zoom; }
.gallery-play { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); display:grid; place-items:center; width:4rem; height:4rem; border-radius:50%; border:1px solid rgb(255 255 255 / 55%); background:linear-gradient(rgb(255 255 255 / 30%),rgb(0 0 0 / 65%)); color:white; box-shadow:0 3px 16px rgb(0 0 0 / 30%),inset 0 1px 0 rgb(255 255 255 / 40%); backdrop-filter:blur(12px); }
.gallery-play:hover { background-color:rgb(0 0 0 / 35%); }
.gallery-play:focus-visible { outline:3px solid white; outline-offset:5px; }
.gallery-photo { width:auto; height:auto; max-width:100%; max-height:60dvh; object-fit:contain; }
.gallery-video { display:block; width:100%; aspect-ratio:16/9; max-height:60dvh; border:0; }
.gallery-video--portrait { width:min(100%,33.75dvh); aspect-ratio:9/16; }
.gallery-viewer-footer { display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:12px 24px; }
.gallery-source { font-size:12px; }
.gallery-arrow { display:grid; width:2.75rem; height:2.75rem; place-items:center; border:1px solid var(--studio-line); border-radius:999px; background:var(--studio-paper); box-shadow:0 2px 2px rgb(0 0 0 / 3%); cursor:pointer; }
.gallery-arrow:hover { background:hsl(var(--muted)); }
.gallery-arrow:disabled { opacity:.4; cursor:default; }
@media(hover:hover) and (pointer:fine) { .gallery-card:hover { opacity:.92; } .gallery-card:hover .gallery-thumbnail { transform:scale(1.025); } .gallery-card:hover .gallery-expand { opacity:1; transform:none; } }
@media(max-width:800px) { .contact-sheet { columns:2; column-gap:16px; } .gallery-card { margin-bottom:16px; } .gallery-mark { display:none; } }
@media (hover:none) { .gallery-expand { opacity:1; transform:none; } }
@media(max-width:500px) { .gallery-header { display:block; } .gallery-intro { margin-top:14px; } .gallery-header { margin-bottom:26px; } .gallery-toolbar { padding-top:16px; gap:13px; } .gallery-count { width:100%; } .contact-sheet { column-gap:11px; } .gallery-card { padding:0; margin-bottom:11px; } .print-caption { padding:10px 4px 6px; } .print-title { font-size:11px; margin-top:6px; } .print-meta { font-size:8px; } .gallery-video-indicator { bottom:7px; left:7px; min-height:28px; padding:5px 7px; gap:5px; } .gallery-video-indicator span { display:none; } .gallery-source { font-size:11px; } }
@media(prefers-reduced-motion:reduce) { .gallery-card,.gallery-thumbnail,.gallery-expand { transition:none; } .gallery-card:hover,.gallery-card:hover .gallery-thumbnail { transform:none; } }
</style>
