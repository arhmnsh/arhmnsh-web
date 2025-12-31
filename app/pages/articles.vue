<script setup lang="ts">
const route = useRoute()
const category = computed(() => (route.query.c as string) || 'ai')

const { data: articles } = await useAsyncData(`articles-${category.value}`, () => 
  queryCollection('articles')
    .where('categories', 'LIKE', `%${category.value}%`)
    .order('date', 'DESC')
    .all()
)

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
