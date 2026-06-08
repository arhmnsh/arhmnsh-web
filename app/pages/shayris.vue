<script setup lang="ts">
import { PenTool, User } from 'lucide-vue-next'

const route = useRoute()
const tag = computed(() => route.query.t as string | undefined)
const author = computed(() => route.query.a as string | undefined)

const isMobile = ref(false)
onMounted(() => {
  isMobile.value = window.innerWidth < 1024
  const handleResize = () => {
    isMobile.value = window.innerWidth < 1024
  }
  window.addEventListener('resize', handleResize)
  onUnmounted(() => window.removeEventListener('resize', handleResize))
})

const { data: allShayris } = await useAsyncData('all-shayris-for-filters', () =>
  queryCollection('shayris').order('date', 'DESC').all()
)

watch(
  [isMobile, allShayris],
  ([mobile, entries]) => {
    const latest = entries?.[0]
    if (!mobile || !latest || route.params.slug || tag.value || author.value) {
      return
    }

    navigateTo(latest.path)
  },
  { immediate: true }
)

const tags = computed(() => {
  if (!allShayris.value) return []
  const counts = new Map<string, number>()
  allShayris.value.forEach((shayri: any) => {
    shayri.tags?.forEach((currentTag: string) => {
      counts.set(currentTag, (counts.get(currentTag) || 0) + 1)
    })
  })
  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name))
})

const authors = computed(() => {
  if (!allShayris.value) return []
  const counts = new Map<string, number>()
  allShayris.value.forEach((shayri: any) => {
    counts.set(shayri.author, (counts.get(shayri.author) || 0) + 1)
  })
  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name))
})

const activeFilter = computed(() => {
  if (author.value) {
    return { kind: 'author' as const, value: author.value }
  }
  if (tag.value) {
    return { kind: 'tag' as const, value: tag.value }
  }
  if (!isMobile.value && tags.value.length > 0) {
    return { kind: 'tag' as const, value: tags.value[0].name }
  }
  return undefined
})

const filterHeader = computed(() => activeFilter.value?.value || 'shayris')

const filterQuery = computed(() => {
  if (!activeFilter.value) return {}
  return activeFilter.value.kind === 'author'
    ? { a: activeFilter.value.value }
    : { t: activeFilter.value.value }
})

const { data: shayris } = await useAsyncData(
  () => `shayris-${activeFilter.value?.kind || 'none'}-${activeFilter.value?.value || 'none'}`,
  () => {
    if (!activeFilter.value) return Promise.resolve([])

    const collection = queryCollection('shayris').order('date', 'DESC')
    if (activeFilter.value.kind === 'author') {
      return collection.where('author', '=', activeFilter.value.value).all()
    }
    return collection.where('tags', 'LIKE', `%${activeFilter.value.value}%`).all()
  },
  { watch: [activeFilter] }
)

const showFilters = computed(() => isMobile.value && !activeFilter.value && !route.params.slug)
const showShayriList = computed(() => {
  if (!isMobile.value) return true
  return !!activeFilter.value && !route.params.slug
})
</script>

<template>
  <div class="flex min-h-screen w-full flex-col lg:flex-row lg:h-screen lg:overflow-hidden">
    <div v-if="showFilters" class="w-full bg-background">
      <div class="px-4 py-6 space-y-8">
        <section>
          <h1 class="mb-6 text-lg font-semibold uppercase tracking-wider text-muted-foreground">Shayri Tags</h1>
          <div class="space-y-1">
            <NuxtLink
              v-for="entry in tags"
              :key="entry.name"
              :to="{ path: '/shayris', query: { t: entry.name } }"
              class="flex items-center justify-between py-4 border-b border-muted transition-colors group"
            >
              <div class="flex items-center gap-3">
                <PenTool class="h-5 w-5 text-muted-foreground" />
                <span class="font-medium capitalize group-hover:underline decoration-muted-foreground/30 underline-offset-4">{{ entry.name }}</span>
              </div>
              <span class="text-muted-foreground text-sm font-mono">{{ entry.count }}</span>
            </NuxtLink>
          </div>
        </section>

        <section>
          <h2 class="mb-6 text-lg font-semibold uppercase tracking-wider text-muted-foreground">Authors</h2>
          <div class="space-y-1">
            <NuxtLink
              v-for="entry in authors"
              :key="entry.name"
              :to="{ path: '/shayris', query: { a: entry.name } }"
              class="flex items-center justify-between py-4 border-b border-muted transition-colors group"
            >
              <div class="flex items-center gap-3">
                <User class="h-5 w-5 text-muted-foreground" />
                <span class="font-medium group-hover:underline decoration-muted-foreground/30 underline-offset-4">{{ entry.name }}</span>
              </div>
              <span class="text-muted-foreground text-sm font-mono">{{ entry.count }}</span>
            </NuxtLink>
          </div>
        </section>
      </div>
    </div>

    <div
      v-if="showShayriList"
      :class="cn(
        'w-full lg:w-80 lg:flex-shrink-0 lg:h-full lg:overflow-y-auto flex-col border-r border-muted bg-background',
        route.params.slug ? 'hidden lg:flex' : 'flex'
      )"
    >
      <ShayriList
        :title="filterHeader"
        :query="filterQuery"
        :shayris="shayris || []"
      />
    </div>

    <div :class="cn(
      'flex-1 min-w-0 bg-background lg:h-full lg:overflow-y-auto',
      route.params.slug ? 'flex flex-col' : 'hidden lg:flex lg:flex-col'
    )">
      <div class="flex-1 w-full">
        <NuxtPage />
      </div>
    </div>
  </div>
</template>
