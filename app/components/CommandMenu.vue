<script setup lang="ts">
import { Search, X, FileText, Link as LinkIcon, Monitor, Moon, Sun, Info } from 'lucide-vue-next'

const { isOpen, close } = useCommandMenu()
const router = useRouter()
const colorMode = useColorMode()

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

const bookmarks = computed(() => bookmarksRaw.value?.[0]?.meta?.body || [])

const staticLinks = [
  { label: 'Home', path: '/', type: 'page' },
  { label: 'Getting Started', path: '/getting-started', type: 'page' },
  { label: 'Leadership', path: '/courses', type: 'page' },
  { label: 'AI Prompts', path: '/prompts', type: 'page' },
  { label: 'Bookmarks', path: '/bookmarks', type: 'page' },
  { label: 'Tech Stack', path: '/academy', type: 'page' },
  { label: 'Gear', path: '/gear', type: 'page' },
  { label: 'Templates', path: '/templates', type: 'page' },
]

const searchResults = computed(() => {
  const q = query.value.toLowerCase().trim()
  
  const results = {
    pages: [] as any[],
    articles: [] as any[],
    bookmarks: [] as any[]
  }

  // Filter Pages
  results.pages = staticLinks.filter(l => l.label.toLowerCase().includes(q))

  if (!q) return results

  // Filter Articles
  if (articles.value) {
    results.articles = articles.value
      .filter(a => 
        a.title.toLowerCase().includes(q) || 
        a.categories?.some((c: string) => c.toLowerCase().includes(q))
      )
      .slice(0, 5)
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
  return searchResults.value.pages.length > 0 || 
         searchResults.value.articles.length > 0 || 
         searchResults.value.bookmarks.length > 0
})

function navigate(path: string, category?: string) {
  const url = category ? { path, query: { c: category } } : path
  router.push(url as any)
  close()
}

function setTheme(theme: string) {
  colorMode.preference = theme
  close()
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
    <!-- Backdrop -->
    <div class="fixed inset-0 bg-background/80 backdrop-blur-sm" @click="close" />
    
    <!-- Modal -->
    <div class="relative w-full max-w-lg rounded-xl border bg-background shadow-2xl">
      <div class="flex items-center border-b px-4">
        <Search class="mr-2 h-4 w-4 text-muted-foreground opacity-50" />
        <input
          v-model="query"
          placeholder="Type a command or search..."
          class="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
          autoFocus
        />
        <button @click="close" class="ml-2 rounded p-1 hover:bg-muted">
          <X class="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
      
      <div class="max-h-[400px] overflow-y-auto p-2">
        <div v-if="!hasResults" class="py-6 text-center text-sm text-muted-foreground">
          No results found.
        </div>
        
        <div v-else class="flex flex-col gap-4">
          <!-- Pages -->
          <div v-if="searchResults.pages.length > 0">
            <div class="px-2 py-1.5 text-xs font-semibold text-muted-foreground flex items-center gap-2">
              <Info class="h-3 w-3" />
              <span>Pages</span>
            </div>
            <div class="flex flex-col gap-0.5">
              <button
                v-for="link in searchResults.pages"
                :key="link.path"
                @click="navigate(link.path)"
                class="flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm outline-none hover:bg-muted hover:text-foreground text-left"
              >
                <Monitor class="h-4 w-4 opacity-50" />
                <span>{{ link.label }}</span>
              </button>
            </div>
          </div>

          <!-- Articles -->
          <div v-if="searchResults.articles.length > 0">
            <div class="px-2 py-1.5 text-xs font-semibold text-muted-foreground flex items-center gap-2">
              <FileText class="h-3 w-3" />
              <span>Articles</span>
            </div>
            <div class="flex flex-col gap-0.5">
              <button
                v-for="article in searchResults.articles"
                :key="article.path"
                @click="navigate(article.path, article.categories?.[0])"
                class="flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm outline-none hover:bg-muted hover:text-foreground text-left"
              >
                <div class="flex flex-col">
                  <span class="font-medium">{{ article.title }}</span>
                  <span class="text-xs text-muted-foreground capitalize">{{ article.categories?.join(', ') }}</span>
                </div>
              </button>
            </div>
          </div>

          <!-- Bookmarks -->
          <div v-if="searchResults.bookmarks.length > 0">
            <div class="px-2 py-1.5 text-xs font-semibold text-muted-foreground flex items-center gap-2">
              <LinkIcon class="h-3 w-3" />
              <span>Bookmarks</span>
            </div>
            <div class="flex flex-col gap-0.5">
              <a
                v-for="bookmark in searchResults.bookmarks"
                :key="bookmark.url"
                :href="bookmark.url"
                target="_blank"
                class="flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm outline-none hover:bg-muted hover:text-foreground text-left"
              >
                <LinkIcon class="h-4 w-4 opacity-50" />
                <div class="flex flex-col italic">
                  <span class="font-medium underline decoration-muted-foreground/30 underline-offset-2">{{ bookmark.title }}</span>
                  <span class="text-[10px] text-muted-foreground truncate">{{ bookmark.url }}</span>
                </div>
              </a>
            </div>
          </div>
        </div>
        
        <!-- Theme Section (only when no query) -->
        <div v-if="!query" class="mt-4 border-t pt-4">
           <div class="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Theme</div>
           <div class="flex flex-col gap-0.5">
             <button @click="setTheme('light')" class="flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-muted text-left">
               <Sun class="h-4 w-4 opacity-50" />
               <span>Light Mode</span>
             </button>
             <button @click="setTheme('dark')" class="flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-muted text-left">
               <Moon class="h-4 w-4 opacity-50" />
               <span>Dark Mode</span>
             </button>
             <button @click="setTheme('system')" class="flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-muted text-left">
               <Monitor class="h-4 w-4 opacity-50" />
               <span>System Default</span>
             </button>
           </div>
        </div>
      </div>
    </div>
  </div>
</template>
