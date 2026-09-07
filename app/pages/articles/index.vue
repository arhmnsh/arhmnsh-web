<script setup lang="ts">
import { Rss } from 'lucide-vue-next'

const pageQuery = usePageQuery()
const category = computed(() => typeof pageQuery.value.c === 'string' ? pageQuery.value.c : '')
const { data: allArticles } = await useAsyncData('article-index', () =>
  queryCollection('articles').order('date', 'DESC').order('title', 'ASC').all()
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
  <div class="mx-auto w-full max-w-4xl px-5 py-10 sm:px-8 lg:py-16">
    <header class="mb-8">
      <div class="mb-4 flex items-center justify-between gap-4">
        <h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">Articles</h1>
        <a href="/rss.xml" class="inline-flex items-center gap-2 rounded-md px-2 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground" aria-label="Subscribe to articles via RSS">
          <Rss class="h-4 w-4" aria-hidden="true" /> RSS
        </a>
      </div>
      <p class="max-w-xl text-base leading-relaxed text-muted-foreground">
        Notes on AI, building software, learning, and the personal side of making things.
      </p>
    </header>

    <nav aria-label="Filter articles by category" class="mb-8 flex flex-wrap gap-2">
      <NuxtLink
        to="/articles"
        :aria-current="!category ? 'page' : undefined"
        :class="['rounded-full border px-3 py-2 text-sm transition-colors', !category ? 'border-foreground bg-foreground text-background' : 'border-border text-muted-foreground hover:border-muted-foreground hover:text-foreground']"
      >
        All articles <span class="ml-1 opacity-70">{{ allArticles?.length || 0 }}</span>
      </NuxtLink>
      <NuxtLink
        v-for="item in categories"
        :key="item.name"
        :to="{ path: '/articles', query: { c: item.name } }"
        :aria-current="selectedCategory === item.name ? 'page' : undefined"
        :class="['rounded-full border px-3 py-2 text-sm transition-colors', selectedCategory === item.name ? 'border-foreground bg-foreground text-background' : 'border-border text-muted-foreground hover:border-muted-foreground hover:text-foreground']"
      >
        {{ item.name.replaceAll('-', ' ') }} <span class="ml-1 opacity-70">{{ item.count }}</span>
      </NuxtLink>
    </nav>

    <p class="mb-3 text-sm text-muted-foreground" aria-live="polite">
      {{ articles.length }} {{ articles.length === 1 ? 'article' : 'articles' }}{{ selectedCategory ? ` in ${selectedCategory}` : '' }} · Newest first
    </p>
    <ArticleList :category="selectedCategory" :articles="articles" />
  </div>
</template>
