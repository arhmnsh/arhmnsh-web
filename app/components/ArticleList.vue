<script setup lang="ts">
import { ArrowUpRight } from 'lucide-vue-next'

defineProps<{
  category?: string
  articles: Array<{
    path: string
    title: string
    date: string
    description?: string
    readTime?: number
    categories?: string[]
  }>
}>()
</script>

<template>
  <div v-if="articles.length === 0" class="rounded-lg border border-border p-6">
    <p class="mb-3 text-muted-foreground">There are no articles in this category yet.</p>
    <NuxtLink to="/articles" class="text-sm underline underline-offset-4">Browse all articles</NuxtLink>
  </div>
  <ul v-else class="divide-y divide-border border-y border-border">
    <li v-for="article in articles" :key="article.path">
      <NuxtLink
        :to="{ path: article.path, query: category ? { c: category } : {} }"
        class="group block rounded-sm py-6 sm:py-7"
      >
        <div class="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <time :datetime="dateTime(article.date)">{{ formatDate(article.date) }}</time>
          <span v-if="article.readTime">{{ article.readTime }} min read</span>
        </div>
        <div class="flex items-start justify-between gap-4">
          <h2 class="text-xl font-semibold leading-snug tracking-tight group-hover:underline decoration-muted-foreground/40 underline-offset-4 sm:text-2xl">
            {{ article.title }}
          </h2>
          <ArrowUpRight class="mt-1 h-5 w-5 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" aria-hidden="true" />
        </div>
        <p v-if="article.description" class="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">{{ article.description }}</p>
        <p v-if="article.categories?.length" class="mt-3 text-xs text-muted-foreground">
          {{ article.categories.join(' · ') }}
        </p>
      </NuxtLink>
    </li>
  </ul>
</template>
