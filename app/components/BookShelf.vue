<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import type { ShelfBook } from '~/utils/bookAppearance'
const props = defineProps<{ books: ShelfBook[] }>()
const route = useRoute()
const router = useRouter()
const selectedBook = ref<ShelfBook | null>(null)
const isOpen = ref(false)
const selectedIndex = computed(() => props.books.findIndex(book => book.id === selectedBook.value?.id))
const closing = ref(false)
const backdropVisible = ref(false)
const controlsReady = ref(false)
const restingBook = ref<string | null>(null)
const studio = ref<{ closeBook: () => Promise<void> } | null>(null)
const origin = ref<{ left: number; top: number; width: number; height: number }>()
async function setDialogOpen(value: boolean) {
  if (value) { isOpen.value = true; return }
  if (closing.value) return
  restingBook.value = selectedBook.value?.id || null
  closing.value = true
  backdropVisible.value = false
  controlsReady.value = false
  await studio.value?.closeBook()
  isOpen.value = false
  closing.value = false
}
async function showBook(book: ShelfBook) {
  if (closing.value || (isOpen.value && selectedBook.value?.id === book.id)) return
  const opener = document.getElementById(`book-${book.id}`)
  const bounds = opener?.querySelector('.volume-model')?.getBoundingClientRect()
  origin.value = !isOpen.value && bounds ? { left:bounds.left, top:bounds.top, width:bounds.width, height:bounds.height } : undefined
  if (!isOpen.value) opener?.focus({ preventScroll:true })
  controlsReady.value = false
  selectedBook.value = book
  isOpen.value = true
  await nextTick()
  requestAnimationFrame(() => requestAnimationFrame(() => {
    if (isOpen.value && !closing.value) backdropVisible.value = true
  }))
}
function selectBook(book: ShelfBook) {
  showBook(book)
  router.replace({ query: { ...route.query, book: book.id } })
}
function browse(direction: number) {
  const book = props.books[(selectedIndex.value + direction + props.books.length) % props.books.length]
  if (book) selectBook(book)
}
function syncBookFromQuery() {
  const book = props.books.find(item => item.id === route.query.book)
  if (book) showBook(book)
  else if (isOpen.value) void setDialogOpen(false)
}
onMounted(syncBookFromQuery)
watch(() => route.query.book, syncBookFromQuery)
watch(isOpen, open => {
  if (!open && route.query.book) {
    const { book, ...query } = route.query
    router.replace({ query })
  }
})
</script>

<template>
  <div class="reading-shelf">
    <div class="shelf-grid"><BookItem v-for="(book, index) in books" :key="book.id" :book="book" :index="index" :class="{ 'book-away': isOpen && selectedBook?.id === book.id, 'book-resting': restingBook === book.id }" @pointermove="restingBook = null" @blur="restingBook = null" @select="selectBook(book)" /></div>
    <AccessibleDialog :open="isOpen" @update:open="setDialogOpen" :class="{ 'is-leaving': closing, 'backdrop-visible': backdropVisible, 'controls-ready': controlsReady }" :title="selectedBook?.title || 'Book notes'" :description="selectedBook ? `By ${selectedBook.author}` : undefined" close-label="Close book details" size="wide" class="library-dialog" :style="{ animation: 'none', transform: 'none' }">
      <div v-if="selectedBook && isOpen" class="volume-detail">
        <BookStudio @opened="controlsReady = !closing" ref="studio" :key="selectedBook.id" :book="selectedBook" :origin="origin" />
        <nav class="browse-volumes" aria-label="Browse books"><button type="button" :disabled="closing || books.length < 2" @click="browse(-1)"><ChevronLeft :size="15" aria-hidden="true" />Previous book</button><button type="button" :disabled="closing || books.length < 2" @click="browse(1)">Next book<ChevronRight :size="15" aria-hidden="true" /></button></nav>
      </div>
    </AccessibleDialog>
  </div>
</template>

<style scoped>
 .book-away :deep(.volume-model),.book-away :deep(.volume-shadow) { visibility:hidden; }
.library-dialog .browse-volumes,.library-dialog :deep(.dialog-header) { opacity:0; visibility:hidden; transition:opacity 280ms ease,visibility 280ms; }
.library-dialog.controls-ready .browse-volumes,.library-dialog.controls-ready :deep(.dialog-header) { opacity:1; visibility:visible; }
.library-dialog.is-leaving .browse-volumes,.library-dialog.is-leaving :deep(.dialog-header) { pointer-events:none; }
.shelf-grid { --shelf-height:290px; --shelf-gap:30px; position:relative; isolation:isolate; display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); grid-auto-rows:var(--shelf-height); column-gap:36px; row-gap:var(--shelf-gap); padding:0 18px var(--shelf-gap); }
.shelf-grid::before { content:''; position:absolute; inset:0; z-index:-1; pointer-events:none; background:linear-gradient(transparent 0,transparent calc(var(--shelf-height) - 21px),#f4d29c calc(var(--shelf-height) - 21px),#c89a60 calc(var(--shelf-height) - 18px),#8b5b2c calc(var(--shelf-height) - 16px),#bd8b50 calc(var(--shelf-height) - 14px),#a77840 calc(var(--shelf-height) - 3px),#573314 var(--shelf-height),#42230b66 calc(var(--shelf-height) + 3px),transparent 100%); background-size:100% calc(var(--shelf-height) + var(--shelf-gap)); }
:global(.dark .shelf-grid)::before { filter:brightness(.65); }

.library-dialog { outline:none; background:transparent; border:0; box-shadow:none; border-radius:0; width:min(900px,calc(100vw - 24px)); overflow:visible; animation:none; }
.library-dialog::backdrop { background:rgb(15 13 10 / 65%); opacity:0; backdrop-filter:blur(0px); transition:opacity 720ms ease,backdrop-filter 720ms ease; }
.library-dialog.backdrop-visible::backdrop { opacity:1; backdrop-filter:blur(4px); }
.library-dialog :deep(.dialog-close) { color:#fff; background:rgb(0 0 0 / 20%); }
.library-dialog :deep(.dialog-header) { z-index:5; background:transparent; border:0; padding:12px 18px 0; justify-content:flex-end; }
.library-dialog :deep(.dialog-header > div) { position:absolute; width:1px; height:1px; overflow:hidden; clip-path:inset(50%); }
.library-dialog :deep(.dialog-content) { padding:0 30px 22px; }
.volume-detail { min-width:0; }
.browse-volumes { transition:opacity 300ms ease; display:flex; align-items:center; justify-content:space-between; gap:15px; margin:15px 22px 0; border:0; padding-top:10px; }
.browse-volumes button { display:flex; align-items:center; gap:7px; min-height:38px; font-size:10px; color:#eee8dc; }
.browse-volumes > span { font:9px var(--font-mono); color:#eee8dc; }
.browse-volumes button:hover { color:#fff; }
.browse-volumes button:disabled { opacity:.4; }
@media(max-height:650px) and (min-width:701px) { .browse-volumes { margin-top:0; padding-top:0; } .library-dialog :deep(.dialog-content) { padding-bottom:5px; } }
@media(max-width:1200px) { .shelf-grid { grid-template-columns:repeat(3,minmax(0,1fr)); } }
@media(max-width:700px) { .shelf-grid { --shelf-height:220px; --shelf-gap:24px; grid-template-columns:repeat(2,minmax(0,1fr)); column-gap:24px; padding:0 12px var(--shelf-gap); } .library-dialog :deep(.dialog-content) { padding:0 5px 14px; } .library-dialog :deep(.dialog-header) { padding:10px 12px 0; } .browse-volumes { margin:10px 16px 0; } }
</style>
