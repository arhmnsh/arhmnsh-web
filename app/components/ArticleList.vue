<script setup lang="ts">
import { format, parseISO } from 'date-fns'

/*
  We expect articles to be passed as props, or we can fetch them here if we want isolation.
  Following the React logic, it was passed as props.
*/
const props = defineProps<{
  category: string
  articles: Array<{
    path: string
    title: string
    date: string
    description?: string
  }>
}>()

const route = useRoute()

// Helper to check active state
const isArticleActive = (articlePath: string) => {
  return route.path === articlePath
}
</script>

<template>
  <div class="flex h-full flex-col">
    <div class="flex h-16 items-center border-b px-6">
      <h2 class="text-lg font-semibold capitalize">{{ category.replace("-", " ") }}</h2>
    </div>
    <div class="flex-1 overflow-y-auto p-3">
      <div v-if="articles.length === 0" class="p-4 text-sm text-muted-foreground">
        No articles found.
      </div>
      <div v-else class="flex flex-col gap-2">
        <NuxtLink
          v-for="article in articles"
          :key="article.path"
          :to="{ path: article.path, query: { c: category } }"
          :class="cn(
            'flex flex-col gap-1 rounded-lg border p-3 text-sm transition-colors hover:bg-muted/50',
            isArticleActive(article.path) ? 'border-foreground/10 bg-muted' : 'border-transparent'
          )"
        >
          <span class="font-semibold leading-tight line-clamp-2">{{ article.title }}</span>
          <span class="text-xs text-muted-foreground">
            {{ format(parseISO(article.date), "d MMM yyyy") }}
          </span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
