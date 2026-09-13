<script setup lang="ts">
import { Rss } from 'lucide-vue-next'

const pageQuery = usePageQuery()
const category = computed(() => typeof pageQuery.value.c === 'string' ? pageQuery.value.c : '')
const { data: allArticles } = await useAsyncData('article-index', () =>
  queryCollection('articles').select('path', 'title', 'date', 'description', 'categories', 'readTime').order('date', 'DESC').order('title', 'ASC').all()
)

const categories = computed(() => {
  const counts = new Map<string, number>()
  for (const article of allArticles.value || []) {
    for (const name of article.categories || []) counts.set(name, (counts.get(name) || 0) + 1)
  }
  return [...counts].map(([name, count]) => ({ name, count })).sort((a, b) => a.name.localeCompare(b.name))
})
const selectedCategory = computed(() =>
  categories.value.find(item => item.name.toLowerCase() === category.value.toLowerCase())?.name
)
const articles = computed(() => {
  if (!category.value) return allArticles.value || []
  return (allArticles.value || []).filter(article =>
    article.categories?.some(name => name.toLowerCase() === category.value.toLowerCase())
  )
})

usePageSeo({
  title: () => selectedCategory.value ? `${selectedCategory.value} articles` : 'Articles',
  description: 'Writing about AI, building software, learning, and the personal side of making things.',
})
</script>

<template>
  <div class="studio-page articles-page">
    <header class="articles-header">
      <div>

        <h1 class="page-title">Articles</h1>

      </div>
      <a href="/rss.xml" class="tactile-button rss-button" aria-label="Subscribe to articles via RSS"><Rss class="h-4 w-4" aria-hidden="true" /> Follow along</a>
    </header>
    <div class="articles-toolbar">
      <nav aria-label="Filter articles by category" class="flex flex-wrap gap-2">
        <NuxtLink to="/articles" :aria-current="!category ? 'page' : undefined" class="filter-chip">All articles <span>{{ allArticles?.length || 0 }}</span></NuxtLink>
        <NuxtLink v-for="item in categories" :key="item.name" :to="{ path: '/articles', query: { c: item.name } }" :aria-current="selectedCategory === item.name ? 'page' : undefined" class="filter-chip">{{ item.name.replaceAll('-', ' ') }} <span>{{ item.count }}</span></NuxtLink>
      </nav>
      <p class="articles-count" aria-live="polite">{{ articles.length }} {{ articles.length === 1 ? 'article' : 'articles' }}{{ selectedCategory ? ` in ${selectedCategory}` : '' }} <span aria-hidden="true">/</span> Newest first</p>
    </div>
    <ArticleList :category="selectedCategory" :articles="articles" />

  </div>
</template>

<style scoped>
.articles-header .eyebrow { margin-bottom: 16px; }
.articles-header { display: flex; justify-content: space-between; align-items: flex-end; gap: 32px; padding-bottom: 52px; }
.title-period { color: var(--studio-accent); }
.rss-button { flex-shrink: 0; margin-bottom: 5px; }
.articles-toolbar { padding-bottom: 20px; }
.articles-count { margin-top: 26px; display: flex; flex-wrap: wrap; gap: 10px; font-size: 11px; color: hsl(var(--muted-foreground)); }
.articles-count span { opacity: .45; }
.journal-note { margin-top: 32px; color: hsl(var(--muted-foreground)); font: italic 16px Georgia, serif; }
@media (max-width: 640px) { .articles-header { align-items: flex-start; flex-direction: column; gap: 24px; padding-bottom: 32px; } }
</style>
