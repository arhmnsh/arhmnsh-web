<script setup lang="ts">
import { ArrowLeft, ArrowRight, Rss } from 'lucide-vue-next'

definePageMeta({ key: route => route.path.replace(/\/+$/, '') })

const route = useRoute()
const pageQuery = usePageQuery()
const articlePath = computed(() => route.path.replace(/\/+$/, ''))
const category = computed(() => typeof pageQuery.value.c === 'string' ? pageQuery.value.c : undefined)
const backLink = computed(() => ({ path: '/articles', query: category.value ? { c: category.value } : {} }))

const { data: article, error } = await useAsyncData(
  () => `article-${articlePath.value}`,
  () => queryCollection('articles').path(articlePath.value).first()
)
if (error.value) throw createError({ statusCode: 500, statusMessage: 'Unable to load article', cause: error.value })
if (!article.value) throw createError({ statusCode: 404, statusMessage: 'Article not found' })

const { data: allArticles } = await useAsyncData('article-index', () =>
  queryCollection('articles').order('date', 'DESC').order('title', 'ASC').all()
)

const readingTime = computed(() => article.value?.readTime || 1)
const toc = computed(() => article.value?.body?.toc?.links || [])
const relatedArticles = computed(() => {
  const currentCategories = article.value?.categories || []
  return (allArticles.value || [])
    .filter(item => item.path !== article.value?.path)
    .map(item => ({ article: item, score: item.categories.filter(name => currentCategories.includes(name)).length }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map(item => item.article)
})

usePageSeo({
  title: () => article.value?.title || 'Article',
  description: () => article.value?.description || 'Writing by AbdurRahaman Shah.',
  type: 'article',
  publishedTime: () => article.value?.date,
})
</script>

<template>
  <div v-if="article" class="mx-auto w-full max-w-3xl px-5 py-8 sm:px-8 lg:py-12">
    <nav aria-label="Article navigation" class="mb-10 flex items-center justify-between gap-4">
      <NuxtLink :to="backLink" class="inline-flex items-center gap-2 rounded-sm py-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft class="h-4 w-4" aria-hidden="true" /> {{ category ? `Back to ${category}` : 'All articles' }}
      </NuxtLink>
      <ThemeToggle />
    </nav>

    <header class="mb-10">
      <div class="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <time :datetime="dateTime(article.date)">{{ formatDate(article.date) }}</time>
        <span aria-hidden="true">·</span>
        <span>{{ readingTime }} min read</span>
      </div>
      <h1 class="mb-5 text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl lg:leading-[1.15]">{{ article.title }}</h1>
      <p v-if="article.description" class="mb-5 text-base leading-relaxed text-muted-foreground sm:text-lg">{{ article.description }}</p>
      <div class="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
        <NuxtLink
          v-for="name in article.categories"
          :key="name"
          :to="{ path: '/articles', query: { c: name } }"
          class="rounded-sm underline decoration-muted-foreground/30 underline-offset-4 hover:text-foreground"
        >{{ name }}</NuxtLink>
      </div>
    </header>

    <details v-if="toc.length >= 4" class="mb-10 rounded-lg border border-border px-5 py-4" open>
      <summary class="cursor-pointer font-medium">On this page</summary>
      <nav aria-label="Table of contents" class="mt-4">
        <ol class="space-y-3 text-sm leading-relaxed text-muted-foreground">
          <li v-for="link in toc" :key="link.id">
            <a :href="`#${link.id}`" class="rounded-sm hover:text-foreground hover:underline underline-offset-4">{{ link.text }}</a>
            <ol v-if="link.children?.length" class="mt-2 space-y-2 border-l border-border pl-4">
              <li v-for="child in link.children" :key="child.id">
                <a :href="`#${child.id}`" class="rounded-sm hover:text-foreground hover:underline underline-offset-4">{{ child.text }}</a>
              </li>
            </ol>
          </li>
        </ol>
      </nav>
    </details>

    <article class="prose prose-neutral dark:prose-invert max-w-none font-serif leading-relaxed sm:prose-lg prose-headings:font-sans prose-headings:font-semibold prose-headings:tracking-tight prose-h2:mt-10 prose-h2:mb-5 prose-h3:mt-8">
      <ContentRenderer :value="article" />
    </article>

    <footer class="mt-14 border-t border-border pt-8">
      <section v-if="relatedArticles.length" aria-labelledby="keep-reading-title">
        <h2 id="keep-reading-title" class="mb-4 text-lg font-semibold">Keep reading</h2>
        <ul class="space-y-5">
          <li v-for="related in relatedArticles" :key="related.path">
            <NuxtLink :to="related.path" class="group flex items-start justify-between gap-4 rounded-sm">
              <div>
                <p class="font-medium group-hover:underline underline-offset-4">{{ related.title }}</p>
                <p v-if="related.description" class="mt-1 text-sm leading-relaxed text-muted-foreground">{{ related.description }}</p>
              </div>
              <ArrowRight class="mt-1 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            </NuxtLink>
          </li>
        </ul>
      </section>
      <div class="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6 text-sm">
        <NuxtLink :to="backLink" class="underline underline-offset-4">{{ category ? `More in ${category}` : 'Browse all articles' }}</NuxtLink>
        <a href="/rss.xml" class="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"><Rss class="h-4 w-4" aria-hidden="true" /> Subscribe via RSS</a>
      </div>
    </footer>
  </div>
</template>
