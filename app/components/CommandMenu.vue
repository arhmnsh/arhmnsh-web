<script setup lang="ts">
import { Search, X } from 'lucide-vue-next'

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
const links = [
  { label: 'Home', path: '/' },
  { label: 'Getting Started', path: '/getting-started' },
  { label: 'Leadership', path: '/courses' },
  { label: 'AI Prompts', path: '/prompts' },
  { label: 'Bookmarks', path: '/bookmarks' },
  { label: 'Tech Stack', path: '/academy' },
  { label: 'Gear', path: '/gear' },
  { label: 'Templates', path: '/templates' },
  { label: 'Articles: AI', path: '/articles/ai' },
  { label: 'Articles: Productivity', path: '/articles/productivity' },
  { label: 'Articles: Job Search', path: '/articles/job-search' },
  { label: 'Articles: Career', path: '/articles/career' },
]

const filteredLinks = computed(() => {
  if (!query.value) return links
  return links.filter(link => link.label.toLowerCase().includes(query.value.toLowerCase()))
})

function navigate(path: string) {
  router.push(path)
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
      
      <div class="max-h-[300px] overflow-y-auto p-2">
        <div v-if="filteredLinks.length === 0" class="py-6 text-center text-sm text-muted-foreground">
          No results found.
        </div>
        
        <div v-else class="flex flex-col gap-1">
          <div class="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Pages</div>
          <button
            v-for="link in filteredLinks"
            :key="link.path"
            @click="navigate(link.path)"
            class="flex w-full items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-muted hover:text-foreground"
          >
            {{ link.label }}
          </button>
        </div>
        
        <div v-if="!query" class="mt-2 border-t pt-2">
           <div class="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Theme</div>
           <div class="flex flex-col gap-1">
             <button @click="setTheme('light')" class="flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-muted">Change theme to Light</button>
             <button @click="setTheme('dark')" class="flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-muted">Change theme to Dark</button>
             <button @click="setTheme('system')" class="flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-muted">Change theme to System</button>
           </div>
        </div>
      </div>
    </div>
  </div>
</template>
