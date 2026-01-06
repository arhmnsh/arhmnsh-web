<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const category = computed(() => (route.query.c as string) || 'ai')

// Redirect to default category in URL if missing, so Sidebar highlight works
onMounted(() => {
  if (!route.query.c) {
    router.replace({ query: { ...route.query, c: 'ai' } })
  }
})

const { data: articles } = await useAsyncData(`articles-${category.value}`, () => 
  queryCollection('articles')
    .where('categories', 'LIKE', `%${category.value}%`)
    .order('date', 'DESC')
    .all(),
  { watch: [category] }
)

/*
  Nuxt Content returns data with `_path`, `title`, etc.
  Next.js version had `slug`. Nuxt `_path` is usually `/articles/ai/gemini-3...`
*/
</script>

<template>
  <div class="flex min-h-screen w-full flex-col lg:flex-row lg:h-screen lg:overflow-hidden">
    <!-- Middle Column: List -->
    <div :class="cn(
      'w-full lg:w-80 lg:h-full lg:overflow-y-auto flex-col border-r bg-background lg:flex',
      route.params.slug ? 'hidden lg:flex' : 'flex'
    )">
      <ArticleList 
        :category="category" 
        :articles="articles || []" 
      />
    </div>
    
    <!-- Right Column: Content -->
    <div :class="cn(
      'flex-1 bg-background lg:h-full lg:overflow-y-auto',
      route.params.slug ? 'flex flex-col' : 'hidden lg:flex lg:flex-col'
    )">
      <div class="flex-1 p-4 lg:p-8">
        <NuxtPage />
      </div>
    </div>
  </div>
</template>
