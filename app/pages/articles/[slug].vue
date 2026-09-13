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
  queryCollection('articles').select('path', 'title', 'date', 'description', 'categories', 'readTime').order('date', 'DESC').order('title', 'ASC').all()
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
  <div v-if="article" class="studio-page reading-page">
    <header class="reading-header">
      <div class="reading-meta"><NuxtLink :to="backLink" class="back-pill"><ArrowLeft :size="14" aria-hidden="true" /> {{ category ? `Back to ${category}` : 'All articles' }}</NuxtLink><time :datetime="dateTime(article.date)">{{ formatDate(article.date) }}</time><span aria-hidden="true">/</span><span>{{ readingTime }} min read</span></div>
      <h1 :data-shared="route.path.replace(/\/+$/, '')">{{ article.title }}</h1>
      <p v-if="article.description" class="reading-intro">{{ article.description }}</p>
      <div class="flex flex-wrap gap-2"><NuxtLink v-for="name in article.categories" :key="name" :to="{ path: '/articles', query: { c: name } }" class="filter-chip">{{ name.replaceAll('-', ' ') }}</NuxtLink></div>
    </header>
    <div class="reading-layout" :class="{ 'has-toc': toc.length >= 4 }">
      <aside v-if="toc.length >= 4" class="reading-aside">
        <details class="reading-toc" open>
          <summary>In this article</summary>
          <nav aria-label="Table of contents">
            <ol>
              <li v-for="link in toc" :key="link.id">
                <a :href="`#${link.id}`">{{ link.text }}</a>
                <ol v-if="link.children?.length"><li v-for="child in link.children" :key="child.id"><a :href="`#${child.id}`">{{ child.text }}</a></li></ol>
              </li>
            </ol>
          </nav>
        </details>
      </aside>
      <article class="reading-body prose prose-neutral dark:prose-invert max-w-none font-serif leading-relaxed sm:prose-lg prose-headings:font-sans prose-headings:font-semibold prose-headings:tracking-tight prose-h2:mt-10 prose-h2:mb-5 prose-h3:mt-8"><ContentRenderer :value="article" /></article>
    </div>
    <footer class="reading-footer">
      <section v-if="relatedArticles.length" aria-labelledby="keep-reading-title">
        <div class="related-heading"><h2 id="keep-reading-title">Related articles</h2></div>
        <ul class="related-grid"><li v-for="related in relatedArticles" :key="related.path"><NuxtLink :to="related.path" class="surface-card related-card"><span class="related-title">{{ related.title }}</span><p v-if="related.description">{{ related.description }}</p><span class="related-arrow"><ArrowRight class="h-4 w-4" aria-hidden="true" /><span class="sr-only">Read article</span></span></NuxtLink></li></ul>
      </section>
      <div class="reading-bottom"><NuxtLink :to="backLink" class="text-link">{{ category ? `More in ${category}` : 'Browse all articles' }} <ArrowRight class="h-4 w-4" aria-hidden="true" /></NuxtLink><a href="/rss.xml" class="text-link"><Rss class="h-4 w-4" aria-hidden="true" /> Subscribe via RSS</a></div>
    </footer>
  </div>
</template>

<style scoped>
.reading-header { max-width: 880px; padding-bottom: 42px; border-bottom: 1px solid var(--studio-line); margin-bottom: 42px; }
.reading-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 14px; color: hsl(var(--muted-foreground)); font-size: 11px; margin-bottom: 24px; }
.reading-meta .back-pill { margin-right: 6px; }
.reading-header h1 { max-width: 860px; margin-bottom: 22px; font-size: clamp(2rem, 4vw, 3.5rem); line-height: 1.1; letter-spacing: -.04em; font-weight: 500; text-wrap: balance; }
.reading-intro { max-width: 720px; margin-bottom: 24px; font-size: clamp(1rem, 1.6vw, 1.18rem); line-height: 1.8; color: hsl(var(--muted-foreground)); }
.reading-layout { max-width: 740px; }
.reading-layout.has-toc { display: grid; grid-template-columns: 190px minmax(0, 1fr); gap: 44px; max-width: none; }
.reading-body { min-width: 0; }
.reading-toc { position: sticky; top: 128px; max-height: calc(100dvh - 156px); overflow-y: auto; padding: 4px; margin: -4px; font-size: 12px; }
.reading-toc summary { cursor: pointer; font-size: 10px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: var(--studio-accent); }
.reading-toc nav { margin-top: 20px; }
.reading-toc li { margin: 12px 0; line-height: 1.65; }
.reading-toc ol ol { border-left: 1px solid var(--studio-line); padding-left: 12px; }
.reading-toc a { color: hsl(var(--muted-foreground)); transition: color .2s; }
.reading-toc a:hover { color: var(--studio-accent); }
.reading-footer { margin-top: 64px; padding-top: 36px; border-top: 1px solid var(--studio-line); }
.related-heading { margin-bottom: 24px; }
.related-heading .eyebrow { margin-bottom: 10px; }
.related-heading h2 { font-size: 30px; font-weight: 600; letter-spacing: -.04em; }
.related-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.related-grid li { min-width: 0; }
.related-card { display: flex; flex-direction: column; height: 100%; padding: 26px; }
.related-title { font-weight: 600; font-size: 19px; line-height: 1.35; letter-spacing: -.025em; }
.related-card p { margin: 12px 0 22px; font-size: 13px; line-height: 1.7; color: hsl(var(--muted-foreground)); }
.related-arrow { margin-top: auto; color: var(--studio-accent); }
.reading-bottom { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 20px; margin-top: 32px; padding-top: 24px; border-top: 1px solid var(--studio-line); }
@media (max-width: 900px) { .reading-layout.has-toc { grid-template-columns: 1fr; gap: 32px; max-width: 740px; } .reading-toc { max-height: none; overflow: visible; margin: 0; border: 1px solid var(--studio-line); border-radius: 16px; padding: 20px 24px; background: var(--studio-paper); } .reading-toc nav > ol { columns: 2; column-gap: 28px; } .reading-toc nav > ol > li { break-inside: avoid; } }
@media (max-width: 580px) { .reading-header { margin-bottom: 28px; padding-bottom: 28px; } .reading-toc nav > ol { columns: 1; } .related-grid { grid-template-columns: 1fr; } .reading-footer { margin-top: 42px; } }
</style>
