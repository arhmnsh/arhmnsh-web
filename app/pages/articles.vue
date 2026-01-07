<script setup lang="ts">
import {
  Bot,
  Car,
  Building2,
  HeartPulse,
  User,
  Cpu,
  Plane,
  PenTool,
  Briefcase,
  ChartNoAxesColumn,
  CodeXml,
  Newspaper,
  Eye
} from 'lucide-vue-next'

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

// Effective category - use first category on desktop if none selected
const effectiveCategory = computed(() => {
  if (category.value) return category.value
  // On desktop, default to first category if available
  if (!isMobile.value && categories.value.length > 0) {
    return categories.value[0].name
  }
  return undefined
})

// Fetch articles for selected category
const { data: articles } = await useAsyncData(
  `articles-${effectiveCategory.value || 'none'}`, 
  () => {
    if (!effectiveCategory.value) return Promise.resolve([])
    return queryCollection('articles')
      .where('categories', 'LIKE', `%${effectiveCategory.value}%`)
      .order('date', 'DESC')
      .all()
  },
  { watch: [effectiveCategory] }
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

// Category icons mapping (same as Sidebar)
const getCategoryIcon = (cat: string) => {
  switch (cat.toLowerCase()) {
    case 'ai': return Bot
    case 'productivity': return ChartNoAxesColumn
    case 'job-search': return Briefcase
    case 'career': return CodeXml
    case 'automotive': return Car
    case 'business': return Building2
    case 'health': return HeartPulse
    case 'personal': return User
    case 'technology': return Cpu
    case 'travel': return Plane
    case 'writing': return PenTool
    case 'baseer': return Eye
    default: return Newspaper
  }
}
</script>

<template>
  <div class="flex min-h-screen w-full flex-col lg:flex-row lg:h-screen lg:overflow-hidden">
    <!-- Categories List (Mobile only, no category selected) -->
    <div v-if="showCategories" class="w-full bg-background">
      <div class="px-4 py-6">
        <h1 class="text-lg font-semibold uppercase tracking-wider text-muted-foreground mb-6">Categories</h1>
        <div class="space-y-1">
          <NuxtLink
            v-for="cat in categories"
            :key="cat.name"
            :to="`/articles?c=${cat.name}`"
            class="flex items-center justify-between py-4 border-b border-muted hover:bg-transparent transition-colors w-full group"
          >
            <div class="flex items-center gap-3">
              <component :is="getCategoryIcon(cat.name)" class="h-5 w-5 text-muted-foreground" />
              <span class="font-medium capitalize group-hover:underline decoration-muted-foreground/30 underline-offset-4">{{ cat.name.replace('-', ' ') }}</span>
            </div>
            <span class="text-muted-foreground text-sm font-mono">{{ cat.count }}</span>
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
        :category="effectiveCategory || 'ai'" 
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
