<script setup lang="ts">
import { Search, X, FileText, Link as LinkIcon } from 'lucide-vue-next'

const { isOpen, close } = useCommandMenu()
const router = useRouter()

// Close on route change
router.afterEach(() => {
  close()
})

// Keyboard shortcuts
onMounted(() => {
  window.addEventListener('keydown', (e) => {
    if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      isOpen.value = !isOpen.value
    }
    if (e.key === 'Escape' && isOpen.value) {
      close()
    }
  })
})

const query = ref('')

// Fetch dynamic content
const { data: articles } = await useAsyncData('search-articles', () => 
  queryCollection('articles').select('path', 'title', 'categories').all()
)
const { data: bookmarksRaw } = await useAsyncData('search-bookmarks', () => 
  queryCollection('bookmarks').all()
)

const bookmarks = computed(() => (bookmarksRaw.value?.[0]?.meta?.body || []) as any[])

const searchResults = computed(() => {
  const q = query.value.toLowerCase().trim()
  
  const results = {
    articles: [] as any[],
    bookmarks: [] as any[]
  }

  // Only show results when user types something
  if (!q) return results

  // Filter Articles
  if (articles.value) {
    results.articles = articles.value
      .filter(a => 
        a.title.toLowerCase().includes(q) || 
        a.categories?.some((c: string) => c.toLowerCase().includes(q))
      )
      .slice(0, 8)
  }

  // Filter Bookmarks
  results.bookmarks = bookmarks.value
    .filter((b: any) => 
      b.title.toLowerCase().includes(q) || 
      b.url.toLowerCase().includes(q) ||
      b.tags?.some((t: string) => t.toLowerCase().includes(q))
    )
    .slice(0, 5)

  return results
})

const hasResults = computed(() => {
  return searchResults.value.articles.length > 0 || 
         searchResults.value.bookmarks.length > 0
})

const hasQuery = computed(() => query.value.trim().length > 0)

function navigate(path: string, category?: string) {
  const url = category ? { path, query: { c: category } } : path
  router.push(url as any)
  close()
}

const searchInput = ref<HTMLInputElement | null>(null)

watch(isOpen, async (val) => {
  if (val) {
    await nextTick()
    searchInput.value?.focus()
  } else {
    query.value = '' // Clear query on close
  }
})
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
    <!-- Backdrop -->
    <div class="fixed inset-0 bg-background/80 backdrop-blur-sm" @click="close" />
    
    <!-- Modal (no rounded corners) -->
    <div class="relative w-full max-w-lg border border-border/50 bg-background shadow-lg">
      <div class="flex items-center border-b border-border/50 px-4">
        <Search class="mr-2 h-4 w-4 text-muted-foreground/50" />
        <input
          ref="searchInput"
          v-model="query"
          placeholder="Search articles..."
          class="flex h-12 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground/50"
        />
        <button @click="close" class="ml-2 p-1 text-muted-foreground hover:text-foreground">
          <X class="h-4 w-4" />
        </button>
      </div>
      
      <div class="max-h-[400px] overflow-y-auto">
        <!-- Empty state when no query -->
        <div v-if="!hasQuery" class="py-8 text-center text-sm text-muted-foreground/60">
          Start typing to search...
        </div>
        
        <!-- No results -->
        <div v-else-if="!hasResults" class="py-8 text-center text-sm text-muted-foreground/60">
          No results found.
        </div>
        
        <!-- Results -->
        <div v-else class="p-2">
          <!-- Articles -->
          <div v-if="searchResults.articles.length > 0">
            <div class="px-2 py-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground/60">
              Articles
            </div>
            <div class="flex flex-col">
              <button
                v-for="article in searchResults.articles"
                :key="article.path"
                @click="navigate(article.path, article.categories?.[0])"
                class="flex w-full items-center gap-3 px-2 py-2 text-sm outline-none hover:bg-muted/50 hover:text-foreground text-left text-muted-foreground"
              >
                <FileText class="h-4 w-4 opacity-50" />
                <div class="flex flex-col">
                  <span class="font-medium text-foreground">{{ article.title }}</span>
                  <span class="text-xs text-muted-foreground/60 capitalize">{{ article.categories?.join(', ') }}</span>
                </div>
              </button>
            </div>
          </div>

          <!-- Bookmarks -->
          <div v-if="searchResults.bookmarks.length > 0" class="mt-2">
            <div class="px-2 py-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground/60">
              Bookmarks
            </div>
            <div class="flex flex-col">
              <a
                v-for="bookmark in searchResults.bookmarks"
                :key="bookmark.url"
                :href="bookmark.url"
                target="_blank"
                class="flex w-full items-center gap-3 px-2 py-2 text-sm outline-none hover:bg-muted/50 hover:text-foreground text-left text-muted-foreground"
              >
                <LinkIcon class="h-4 w-4 opacity-50" />
                <div class="flex flex-col">
                  <span class="font-medium text-foreground">{{ bookmark.title }}</span>
                  <span class="text-[10px] text-muted-foreground/60 truncate">{{ bookmark.url.replace(/^https?:\/\//, '').split('/')[0] }}</span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
