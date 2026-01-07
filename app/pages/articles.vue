<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const category = computed(() => route.query.c as string | undefined)

// Check if we're on mobile (client-side only)
const isMobile = ref(false)
onMounted(() => {
  isMobile.value = window.innerWidth < 1024
  const handleResize = () => {
    isMobile.value = window.innerWidth < 1024
  }
  window.addEventListener('resize', handleResize)
  onUnmounted(() => window.removeEventListener('resize', handleResize))
})

// Fetch all categories
const { data: allArticles } = await useAsyncData('all-articles-for-categories', () =>
  queryCollection('articles').all()
)

const categories = computed(() => {
  if (!allArticles.value) return []
  const cats = new Map<string, number>()
  allArticles.value.forEach((article: any) => {
    article.categories?.forEach((cat: string) => {
      cats.set(cat, (cats.get(cat) || 0) + 1)
    })
  })
  return Array.from(cats.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name))
})

// Fetch articles for selected category
const { data: articles } = await useAsyncData(
  `articles-${category.value || 'none'}`, 
  () => {
    if (!category.value) return Promise.resolve([])
    return queryCollection('articles')
      .where('categories', 'LIKE', `%${category.value}%`)
      .order('date', 'DESC')
      .all()
  },
  { watch: [category] }
)

// Show categories on mobile when no category selected
const showCategories = computed(() => {
  return isMobile.value && !category.value && !route.params.slug
})

// Show article list when category selected (or always on desktop)
const showArticleList = computed(() => {
  if (!isMobile.value) return true
  return !!category.value && !route.params.slug
})

// Category icons mapping
const categoryIcons: Record<string, string> = {
  ai: '🤖',
  automotive: '🚗',
  baseer: '👁️',
  business: '💼',
  career: '📈',
  health: '🏥',
  'job search': '🔍',
  personal: '📝',
  productivity: '⚡',
  technology: '💻',
  travel: '✈️',
  writing: '✍️'
}

const getCategoryIcon = (cat: string) => {
  return categoryIcons[cat.toLowerCase()] || '📁'
}
</script>

<template>
  <div class="flex min-h-screen w-full flex-col lg:flex-row lg:h-screen lg:overflow-hidden">
    <!-- Categories List (Mobile only, no category selected) -->
    <div v-if="showCategories" class="w-full bg-background">
      <div class="px-4 py-6">
        <h1 class="text-2xl font-bold mb-6">Categories</h1>
        <div class="space-y-3">
          <NuxtLink
            v-for="cat in categories"
            :key="cat.name"
            :to="`/articles?c=${cat.name}`"
            class="flex items-center justify-between p-4 rounded-lg border hover:bg-muted transition-colors w-full"
          >
            <div class="flex items-center gap-3">
              <span class="text-2xl">{{ getCategoryIcon(cat.name) }}</span>
              <span class="font-medium capitalize">{{ cat.name }}</span>
            </div>
            <span class="text-muted-foreground text-sm">{{ cat.count }} articles</span>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Middle Column: Article List -->
    <div 
      v-if="showArticleList"
      :class="cn(
        'w-full lg:w-80 lg:flex-shrink-0 lg:h-full lg:overflow-y-auto flex-col border-r bg-background',
        route.params.slug ? 'hidden lg:flex' : 'flex'
      )"
    >
      <ArticleList 
        :category="category || 'ai'" 
        :articles="articles || []" 
      />
    </div>
    
    <!-- Right Column: Content -->
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
