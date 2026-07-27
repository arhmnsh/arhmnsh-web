<script setup lang="ts">
const route = useRoute()
const tag = computed(() => route.query.t as string | undefined)
const author = computed(() => route.query.a as string | undefined)
const isExplorePage = computed(() => route.path === '/shayris/explore')
const isIndexPage = computed(() => route.path === '/shayris')

const isMobile = ref(false)
onMounted(() => {
  isMobile.value = window.innerWidth < 1024
  const handleResize = () => {
    isMobile.value = window.innerWidth < 1024
  }
  window.addEventListener('resize', handleResize)
  onUnmounted(() => window.removeEventListener('resize', handleResize))
})

const activeFilter = computed(() => {
  if (author.value) {
    return { kind: 'author' as const, value: author.value }
  }
  if (tag.value) {
    return { kind: 'tag' as const, value: tag.value }
  }
  return undefined
})

const filterHeader = computed(() => activeFilter.value?.value || 'all shayris')

const filterQuery = computed(() => {
  if (!activeFilter.value) return {}
  return activeFilter.value.kind === 'author'
    ? { a: activeFilter.value.value }
    : { t: activeFilter.value.value }
})

const { data: shayris } = await useAsyncData(
  () => `shayris-${activeFilter.value?.kind || 'none'}-${activeFilter.value?.value || 'none'}`,
  () => {
    const collection = queryCollection('shayris').order('date', 'DESC')
    if (!activeFilter.value) return collection.all()
    if (activeFilter.value.kind === 'author') {
      return collection.where('author', '=', activeFilter.value.value).all()
    }
    return collection.where('tags', 'LIKE', `%${activeFilter.value.value}%`).all()
  },
  { watch: [activeFilter] }
)

const showShayriList = computed(() => {
  if (isExplorePage.value || isIndexPage.value) return false
  if (!isMobile.value) return true
  return !!activeFilter.value && !route.params.slug
})
</script>

<template>
  <div class="flex min-h-screen w-full flex-col lg:flex-row lg:h-screen lg:overflow-hidden">
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
      route.params.slug || isExplorePage || isIndexPage ? 'flex flex-col' : 'hidden'
    )">
      <div class="flex-1 w-full">
        <NuxtPage />
      </div>
    </div>
  </div>
</template>
