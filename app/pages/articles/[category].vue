<script setup lang="ts">
const route = useRoute()
const category = computed(() => {
  // route.params.category might be undefined if we visit /articles directly (if structure allows)
  // But this file is /pages/articles/[category].vue, so it captures that segment.
  return route.params.category as string
})

// Debugging path
console.log('Fetching articles for category:', category.value)

const { data: allArticles } = await useAsyncData('all-articles-debug', () => 
  queryCollection('articles').all()
)

console.log('All articles found:', allArticles.value?.length, allArticles.value)

const { data: articles } = await useAsyncData(`articles-${category.value}`, () => 
  queryCollection('articles')
    .where('category', '=', category.value)
    .order('date', 'DESC')
    .all()
)

console.log('Filtered articles found:', articles.value?.length)
console.log('First article:', articles.value?.[0])

/*
  Nuxt Content returns data with `_path`, `title`, etc.
  Next.js version had `slug`. Nuxt `_path` is usually `/articles/ai/gemini-3...`
*/
</script>

<template>
  <div class="flex h-full w-full overflow-hidden">
    <!-- Middle Column: List -->
    <ArticleList 
      :category="category" 
      :articles="articles || []" 
    />
    
    <!-- Right Column: Content -->
    <div class="flex-1 overflow-y-auto bg-background p-8">
      <NuxtPage />
    </div>
  </div>
</template>
