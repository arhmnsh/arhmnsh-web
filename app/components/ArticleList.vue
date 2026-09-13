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
  <div v-if="articles.length === 0" class="surface-card article-empty">
    <p class="mb-4 text-muted-foreground">There are no articles in this category yet.</p>
    <NuxtLink to="/articles" class="text-link">Browse all articles <ArrowUpRight class="h-4 w-4" aria-hidden="true" /></NuxtLink>
  </div>
  <ul v-else class="article-list">
    <li v-for="(article, index) in articles" :key="article.path">
      <NuxtLink :to="{ path: article.path, query: category ? { c: category } : {} }" class="article-row group">
        <div class="article-date">

          <time :datetime="dateTime(article.date)">{{ formatDate(article.date) }}</time>
        </div>
        <div class="min-w-0">
          <div class="article-meta">
            <span v-if="article.categories?.length">{{ article.categories[0]?.replaceAll('-', ' ') }}</span>
            <span v-if="article.readTime">{{ article.readTime }} min read</span>
          </div>
          <h2 class="article-heading">{{ article.title }}</h2>


        </div>
        <span class="article-arrow"><ArrowUpRight class="h-5 w-5" aria-hidden="true" /></span>
      </NuxtLink>
    </li>
  </ul>
</template>

<style scoped>
.article-list { border-top: 1px solid var(--studio-line); }
.article-row { display: grid; grid-template-columns: 120px minmax(0, 1fr) 42px; gap: 28px; padding: 34px 0; border-bottom: 1px solid var(--studio-line); }
.article-date { display: flex; flex-direction: column; gap: 22px; color: hsl(var(--muted-foreground)); font-size: 12px; }
.article-number { font-size: 11px; font-variant-numeric: tabular-nums; letter-spacing: .08em; opacity: .6; }
.article-meta { display: flex; flex-wrap: wrap; gap: 14px; margin-bottom: 11px; color: var(--studio-accent); font-size: 10px; text-transform: uppercase; letter-spacing: .12em; font-weight: 600; }
.article-meta span + span { color: hsl(var(--muted-foreground)); font-weight: 400; }
.article-heading { font-size: clamp(1.35rem, 2.35vw, 1.9rem); letter-spacing: -.03em; line-height: 1.28; font-weight: 400; transition: color .2s; }
.article-description { max-width: 620px; margin-top: 13px; font-size: 14px; line-height: 1.8; color: hsl(var(--muted-foreground)); }
.article-tags { margin-top: 14px; font-size: 11px; color: hsl(var(--muted-foreground)); }
.article-arrow { width: 42px; height: 42px; display: grid; place-items: center; border: 1px solid var(--studio-line); border-radius: 50%; transition: background .2s, color .2s, transform .2s; }
.article-row:hover .article-heading { color: var(--studio-accent); }
.article-row:hover .article-arrow { background: var(--studio-accent); color: hsl(var(--primary-foreground)); transform: translate(2px, -2px); }
.article-empty { padding: 32px; }
@media (max-width: 640px) { .article-row { grid-template-columns: minmax(0, 1fr) 34px; gap: 12px; padding: 26px 0; } .article-date { grid-column: 1 / -1; flex-direction: row; gap: 14px; font-size: 11px; } .article-arrow { width: 34px; height: 34px; } .article-description { font-size: 13px; } }
@media (prefers-reduced-motion: reduce) { .article-arrow, .article-heading { transition: none; } .article-row:hover .article-arrow { transform: none; } }
</style>
