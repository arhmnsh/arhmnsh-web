<script setup lang="ts">
import { format, parseISO } from 'date-fns'

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
      <h2 class="text-lg font-semibold uppercase tracking-wider text-muted-foreground capitalize">{{ category.replace("-", " ") }}</h2>
    </div>
    <div class="flex-1 overflow-y-auto">
      <div v-if="articles.length === 0" class="p-6 text-sm text-muted-foreground">
        No articles found.
      </div>
      <div v-else class="flex flex-col">
        <NuxtLink
          v-for="article in articles"
          :key="article.path"
          :to="{ path: article.path, query: { c: category } }"
          :class="cn(
            'flex flex-col gap-1 px-6 py-4 text-sm transition-colors border-b border-muted hover:bg-muted/30',
            isArticleActive(article.path) ? 'bg-muted/50' : ''
          )"
        >
          <span class="font-medium leading-tight line-clamp-2">{{ article.title }}</span>
          <span class="text-xs text-muted-foreground font-mono">
            {{ format(parseISO(article.date), "d MMM yyyy") }}
          </span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
