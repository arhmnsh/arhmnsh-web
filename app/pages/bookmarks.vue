<script setup lang="ts">
import { Tag, ExternalLink } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

// Fetch bookmarks using Nuxt Content
const { data: bookmarksData } = await useAsyncData('bookmarks', () => 
  queryCollection('bookmarks').all()
)

// Extract the actual bookmarks array from meta.body
const bookmarks = computed(() => {
  if (!bookmarksData.value || bookmarksData.value.length === 0) return []
  // Nuxt Content v3 stores JSON arrays in meta.body
  return bookmarksData.value[0]?.meta?.body || []
})

console.log('Bookmarks loaded:', bookmarks.value)
console.log('Bookmarks length:', bookmarks.value?.length)

// Computed: Extract unique tags
const allTags = computed(() => {
  if (!bookmarks.value) return []
  const tags = new Set<string>()
  bookmarks.value.forEach((item: any) => {
    if (item.tags) {
      item.tags.forEach((t: string) => tags.add(t))
    }
  })
  return Array.from(tags).sort()
})

const selectedTag = computed(() => route.query.tag as string | undefined)

const filteredBookmarks = computed(() => {
  if (!bookmarks.value) return []
  const items = bookmarks.value
  if (!selectedTag.value) return items
  return items.filter((item: any) => item.tags?.includes(selectedTag.value))
})

const selectTag = (tag: string) => {
  if (selectedTag.value === tag) {
    router.push('/bookmarks') // Deselect
  } else {
    router.push({ query: { ...route.query, tag } })
  }
}
</script>

<template>
  <div class="flex h-full flex-col lg:flex-row overflow-hidden">
    <!-- Col 2: Tags List -->
    <div class="flex w-full overflow-x-auto lg:w-64 lg:flex-col border-r bg-background/50 flex-shrink-0">
      <div class="flex h-16 min-h-[64px] shrink-0 items-center border-b px-6 lg:flex">
        <h2 class="text-lg font-semibold lg:block hidden">Tags</h2>
        <span class="lg:hidden text-sm font-medium text-muted-foreground mr-4 shrink-0">Filter by Tag:</span>
      </div>
      <div class="flex-1 overflow-x-auto lg:overflow-y-auto p-4 flex lg:block items-center">
        <div class="flex lg:flex-col gap-2 lg:gap-1">
          <button
            v-for="tag in allTags"
            :key="tag"
            @click="selectTag(tag)"
            :class="cn(
              'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted whitespace-nowrap',
               selectedTag === tag ? 'bg-muted font-medium text-foreground' : 'text-muted-foreground'
            )"
          >
            <Tag class="h-3.5 w-3.5" />
            <span>{{ tag }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Col 3: Bookmarks List -->
    <div class="flex flex-1 flex-col bg-background overflow-hidden">
      <div class="flex h-16 min-h-[64px] shrink-0 items-center gap-2 border-b px-6">
        <h2 class="flex-shrink-0 text-lg font-semibold">
          {{ selectedTag ? `#${selectedTag}` : 'Bookmarks' }}
        </h2>
        <span class="flex-shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {{ filteredBookmarks.length }}
        </span>
      </div>

      <div class="flex-1 overflow-y-auto">
        <div class="mx-auto w-full max-w-3xl p-4 lg:p-8">
          <div class="grid gap-4">
          <a
            v-for="(item, idx) in filteredBookmarks"
            :key="idx"
            :href="item.url"
            target="_blank"
            class="group flex flex-col gap-2 rounded-xl border p-4 lg:p-5 transition-all hover:border-foreground/20 hover:shadow-sm"
          >
            <div class="flex items-start justify-between">
              <h3 class="font-medium text-sm lg:text-base group-hover:underline decoration-muted-foreground/30 underline-offset-4">{{ item.title }}</h3>
              <ExternalLink class="h-4 w-4 text-muted-foreground opacity-50 shrink-0 lg:opacity-0 transition-opacity lg:group-hover:opacity-100" />
            </div>
            
            <p v-if="item.description" class="text-xs lg:text-sm text-muted-foreground line-clamp-2">
              {{ item.description }}
            </p>

            <div class="flex items-center gap-2">
              <span class="text-[10px] lg:text-xs text-muted-foreground truncate">{{ item.url }}</span>
            </div>

            <div class="mt-2 flex flex-wrap gap-2">
              <span 
                v-for="t in item.tags" 
                :key="t"
                class="rounded-md bg-muted px-2 py-1 text-[10px] font-medium text-muted-foreground"
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
