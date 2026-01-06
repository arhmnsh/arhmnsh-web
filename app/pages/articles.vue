<script setup lang="ts">
const route = useRoute()
const category = computed(() => (route.query.c as string) || 'ai')

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
  <div class="flex min-h-screen w-full flex-col lg:flex-row">
    <!-- Middle Column: List -->
    <div :class="cn(
      'min-h-screen w-full lg:w-80 lg:sticky lg:top-0 flex-col border-r bg-background lg:flex',
      route.params.slug ? 'hidden lg:flex' : 'flex'
    )">
      <ArticleList 
        :category="category" 
        :articles="articles || []" 
      />
    </div>
    
    <!-- Right Column: Content -->
    <div :class="cn(
      'flex-1 bg-background',
      route.params.slug ? 'flex flex-col' : 'hidden lg:flex lg:flex-col'
    )">
      <div class="flex-1 p-4 lg:p-8">
        <NuxtPage />
      </div>
    </div>
  </div>
</template>
