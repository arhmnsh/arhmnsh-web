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
      <div class="reading-meta">
        <NuxtLink :to="backLink" class="back-link">
          <ArrowLeft :size="13" aria-hidden="true" />
          <span>{{ category ? `Back to ${category}` : 'All articles' }}</span>
        </NuxtLink>
        <div class="reading-meta-details">
          <time :datetime="dateTime(article.date)">{{ formatDate(article.date) }}</time>
          <span class="meta-sep" aria-hidden="true">/</span>
          <span>{{ readingTime }} min read</span>
          <template v-if="article.categories?.length">
            <span class="meta-sep" aria-hidden="true">/</span>
            <div class="reading-tags">
              <NuxtLink
                v-for="name in article.categories"
                :key="name"
                :to="{ path: '/articles', query: { c: name } }"
                class="tag-link"
              >
                #{{ name.replaceAll('-', ' ') }}
              </NuxtLink>
            </div>
          </template>
        </div>
      </div>
      <h1 :data-shared="route.path.replace(/\/+$/, '')">{{ article.title }}</h1>
      <p v-if="article.description" class="reading-intro">{{ article.description }}</p>
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
        <div class="related-heading"><h2 id="keep-reading-title" class="eyebrow">Related writing</h2></div>
        <ul class="related-list">
          <li v-for="related in relatedArticles" :key="related.path">
            <NuxtLink :to="related.path" class="related-link">
              <span class="related-title">{{ related.title }}</span>
              <span v-if="related.readTime" class="related-read-time">{{ related.readTime }} min read</span>
            </NuxtLink>
          </li>
        </ul>
      </section>
      <div class="reading-bottom">
        <NuxtLink :to="backLink" class="subtle-nav-link">
          {{ category ? `More in ${category}` : 'Browse all articles' }}
          <ArrowRight :size="13" aria-hidden="true" />
        </NuxtLink>
        <a href="/rss.xml" class="subtle-nav-link">
          <Rss :size="13" aria-hidden="true" /> Subscribe via RSS
        </a>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.reading-header { max-width: 880px; padding-bottom: 24px; border-bottom: 1px solid var(--studio-line); margin-bottom: 32px; }
.reading-meta { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px 16px; color: hsl(var(--muted-foreground)); font-size: 11px; margin-bottom: 18px; }
.back-link { display: inline-flex; align-items: center; gap: 6px; color: hsl(var(--muted-foreground)); font-size: 12px; text-decoration: none; transition: color 180ms; }
.back-link:hover { color: hsl(var(--foreground)); }
.back-link svg { transition: transform 180ms var(--studio-ease); }
.back-link:hover svg { transform: translateX(-2px); }
.reading-meta-details { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }
.meta-sep { opacity: 0.4; }
.reading-tags { display: inline-flex; align-items: center; gap: 8px; }
.tag-link { color: hsl(var(--muted-foreground)); text-decoration: none; transition: color 180ms; }
.tag-link:hover { color: hsl(var(--foreground)); }
.reading-header h1 { max-width: 860px; margin-bottom: 14px; font-size: clamp(2rem, 4vw, 3.5rem); line-height: 1.1; letter-spacing: -.035em; font-weight: 400; text-wrap: balance; }
.reading-intro { max-width: 720px; margin-bottom: 0; font-size: clamp(1rem, 1.6vw, 1.18rem); line-height: 1.8; color: hsl(var(--muted-foreground)); }
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
.reading-footer { max-width: 740px; margin-top: 48px; padding-top: 24px; border-top: 1px solid hsl(var(--border) / 0.6); }
.related-heading { margin-bottom: 12px; }
.related-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 4px; }
.related-link { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; padding: 6px 0; text-decoration: none; transition: color 180ms; }
.related-title { font-size: 14px; font-weight: 400; line-height: 1.5; letter-spacing: -.01em; color: hsl(var(--muted-foreground)); transition: color 180ms; }
.related-link:hover .related-title { color: hsl(var(--foreground)); }
.related-read-time { font-size: 11px; color: hsl(var(--muted-foreground) / 0.6); white-space: nowrap; flex-shrink: 0; font-family: var(--font-sans); }
.reading-bottom { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; margin-top: 24px; }
.subtle-nav-link { display: inline-flex; align-items: center; gap: 6px; color: hsl(var(--muted-foreground)); font-size: 12px; font-weight: 400; text-decoration: none; transition: color 180ms; }
.subtle-nav-link svg { opacity: 0.6; transition: opacity 180ms, transform 180ms var(--studio-ease); }
.subtle-nav-link:hover { color: hsl(var(--foreground)); }
.subtle-nav-link:hover svg { opacity: 1; transform: translateX(2px); }
@media (max-width: 900px) { .reading-layout.has-toc { grid-template-columns: 1fr; gap: 32px; max-width: 740px; } .reading-toc { max-height: none; overflow: visible; margin: 0; border: 1px solid var(--studio-line); border-radius: 16px; padding: 20px 24px; background: var(--studio-paper); } .reading-toc nav > ol { columns: 2; column-gap: 28px; } .reading-toc nav > ol > li { break-inside: avoid; } }
@media (max-width: 580px) { .reading-header { margin-bottom: 24px; padding-bottom: 20px; } .reading-toc nav > ol { columns: 1; } .reading-footer { margin-top: 36px; } }
</style>
