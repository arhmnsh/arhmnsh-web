<script setup lang="ts">
import { Tag, ExternalLink, Filter, X } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const showMobileTags = ref(false)

// Fetch bookmarks using Nuxt Content (sync to avoid async component issues)
const { data: bookmarksData } = useAsyncData('bookmarks', () => 
  queryCollection('bookmarks').all()
)

// Extract the actual bookmarks array from meta.body
const bookmarks = computed(() => {
  if (!bookmarksData.value || bookmarksData.value.length === 0) return []
  // Nuxt Content v3 stores JSON arrays in meta.body
  return (bookmarksData.value[0]?.meta?.body || []) as any[]
})

// Computed: Extract unique tags with counts
const allTags = computed(() => {
  if (!bookmarks.value) return []
  const counts = new Map<string, number>()
  
  bookmarks.value.forEach((item: any) => {
    if (item.tags) {
      item.tags.forEach((t: string) => {
        counts.set(t, (counts.get(t) || 0) + 1)
      })
    }
  })
  
  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name))
})

const totalBookmarksCount = computed(() => bookmarks.value?.length || 0)

const selectedTag = computed(() => route.query.tag as string | undefined)

const filteredBookmarks = computed(() => {
  if (!bookmarks.value) return []
  const items = bookmarks.value
  if (!selectedTag.value) return items
  return items.filter((item: any) => item.tags?.includes(selectedTag.value))
})

const selectTag = (tag?: string) => {
  if (!tag) {
    router.push('/bookmarks') // Select All
  } else if (selectedTag.value === tag) {
    router.push('/bookmarks') // Deselect
  } else {
    router.push({ query: { ...route.query, tag } })
  }
  showMobileTags.value = false
}
</script>

<template>
  <div class="flex flex-col lg:flex-row min-h-screen">
    <!-- Col 2: Tags List (Desktop Sidebar) -->
    <div class="hidden lg:flex w-64 flex-col border-r bg-background/50 flex-shrink-0 sticky top-0 h-screen">
      <div class="flex h-16 min-h-[64px] shrink-0 items-center border-b px-6">
        <h2 class="text-lg font-semibold">Collections</h2>
      </div>
      <div class="flex-1 overflow-y-auto p-4">
        <div class="flex flex-col gap-1">
          <!-- All Bookmarks Item -->
          <button
            @click="selectTag()"
            :class="cn(
              'flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted w-full',
               !selectedTag ? 'bg-muted font-medium text-foreground' : 'text-muted-foreground'
            )"
          >
            <div class="flex items-center gap-2">
              <Tag class="h-4 w-4" />
              <span>All Bookmarks</span>
            </div>
            <span class="text-xs opacity-50">{{ totalBookmarksCount }}</span>
          </button>

          <!-- Tags -->
          <button
            v-for="tag in allTags"
            :key="tag.name"
            @click="selectTag(tag.name)"
            :class="cn(
              'flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted w-full',
               selectedTag === tag.name ? 'bg-muted font-medium text-foreground' : 'text-muted-foreground'
            )"
          >
             <div class="flex items-center gap-2">
              <span class="w-4">#</span>
              <span>{{ tag.name }}</span>
            </div>
            <span class="text-xs opacity-50">{{ tag.count }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Header & Tags Popover -->
    <div class="lg:hidden flex items-center justify-between px-6 py-4 border-b bg-background sticky top-0 z-30">
        <h1 class="text-xl font-bold font-serif italic">Bookmarks</h1>
        <button 
          @click="showMobileTags = !showMobileTags"
          class="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground bg-muted/50 px-3 py-1.5 rounded-full"
        >
          <span>{{ selectedTag || 'All' }}</span>
          <Filter class="h-4 w-4" />
        </button>
    </div>

    <!-- Mobile Popover Overlay -->
    <div v-if="showMobileTags" class="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm lg:hidden" @click="showMobileTags = false">
      <div class="absolute right-4 top-16 w-64 max-h-[70vh] overflow-y-auto rounded-xl border bg-card p-2 shadow-lg" @click.stop>
         <div class="flex items-center justify-between px-2 py-2 mb-2 border-b">
            <span class="font-semibold text-sm">Filter by Tag</span>
            <button @click="showMobileTags = false"><X class="h-4 w-4" /></button>
         </div>
         <div class="flex flex-col gap-1">
            <button
              @click="selectTag()"
              :class="cn(
                'flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted w-full text-left',
                !selectedTag ? 'bg-accent text-accent-foreground' : ''
              )"
            >
              <span>All Bookmarks</span>
              <span class="text-xs opacity-50">{{ totalBookmarksCount }}</span>
            </button>
            <button
              v-for="tag in allTags"
              :key="tag.name"
              @click="selectTag(tag.name)"
               :class="cn(
                'flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted w-full text-left',
                selectedTag === tag.name ? 'bg-accent text-accent-foreground' : ''
              )"
            >
              <span>{{ tag.name }}</span>
              <span class="text-xs opacity-50">{{ tag.count }}</span>
            </button>
         </div>
      </div>
    </div>

    <!-- Col 3: Bookmarks List -->
    <div class="flex flex-1 flex-col bg-background">
      <!-- Desktop Header only -->
      <div class="hidden lg:flex h-16 min-h-[64px] shrink-0 items-center gap-2 border-b px-6 sticky top-0 z-40 bg-background/95 backdrop-blur">
        <h2 class="flex-shrink-0 text-lg font-semibold">
          {{ selectedTag ? `#${selectedTag}` : 'Bookmarks' }}
        </h2>
        <span class="flex-shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {{ filteredBookmarks.length }}
        </span>
      </div>

      <div class="flex-1">
        <div class="mx-auto w-full max-w-3xl px-4 lg:px-8">
          <div class="flex flex-col">
          <a
            v-for="(item, idx) in filteredBookmarks"
            :key="idx"
            :href="item.url"
            target="_blank"
            class="group flex flex-col gap-2 py-6 border-b border-muted hover:bg-transparent last:border-0"
          >
             <div class="flex items-start justify-between gap-4">
              <h3 class="font-medium text-base group-hover:underline decoration-muted-foreground/30 underline-offset-4">{{ item.title }}</h3>
              <ExternalLink class="h-4 w-4 text-muted-foreground opacity-30 shrink-0 group-hover:opacity-100 transition-opacity" />
            </div>
            
            <p v-if="item.description" class="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {{ item.description }}
            </p>

            <div class="flex items-center gap-2 mt-1">
              <span class="text-xs text-muted-foreground truncate opacity-70">{{ item.url }}</span>
            </div>

            <div class="mt-3 flex flex-wrap gap-2">
              <span 
                v-for="t in item.tags" 
                :key="t"
                class="rounded-md bg-muted/50 px-2 py-0.5 text-[10px] font-mono font-medium text-muted-foreground"
              >
                #{{ t }}
              </span>
            </div>
          </a>
        </div>
        
        <div v-if="filteredBookmarks.length === 0" class="py-12 text-center text-muted-foreground">
          No bookmarks found for this tag.
        </div>
      </div>
    </div>
  </div>
</div>
</template>
