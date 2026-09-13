<script setup lang="ts">
import { ArrowLeft, ArrowUpRight } from 'lucide-vue-next'
const { data: allShayris } = await useAsyncData('poetry-index', () =>
  queryCollection('shayris').select('path', 'title', 'date', 'author', 'tags', 'description').order('date', 'DESC').order('title', 'ASC').all()
)
function countEntries(values: string[]) {
  const counts = new Map<string, number>()
  for (const name of values) counts.set(name, (counts.get(name) || 0) + 1)
  return [...counts].map(([name, count]) => ({ name, count })).sort((a, b) => a.name.localeCompare(b.name))
}
const tags = computed(() => countEntries((allShayris.value || []).flatMap(item => item.tags)))
const authors = computed(() => countEntries((allShayris.value || []).map(item => item.author)))
usePageSeo({
  title: 'Explore poetry',
  description: 'Find poems by theme or author in the poetry collection.',
  noindex: () => !allShayris.value?.length,
})
</script>

<template>
  <div class="studio-page explore-page">
    <NuxtLink to="/shayris" class="text-link explore-back"><ArrowLeft class="h-4 w-4" aria-hidden="true" /> Browse all poetry</NuxtLink>
    <header class="explore-header"><h1 class="page-title">Themes & authors</h1></header>
    <div v-if="!allShayris?.length" class="surface-card explore-empty"><p>The poetry collection is still in preparation. Themes and authors will appear as poems are published.</p><div class="mt-6 flex flex-wrap gap-5"><NuxtLink to="/articles" class="text-link">Read the articles <ArrowUpRight class="h-4 w-4" aria-hidden="true" /></NuxtLink><NuxtLink to="/books" class="text-link">Visit the bookshelf <ArrowUpRight class="h-4 w-4" aria-hidden="true" /></NuxtLink></div></div>
    <div v-else class="explore-grid">
      <section aria-labelledby="poetry-themes" class="explore-section"><div class="explore-section-top"><span aria-hidden="true">01</span><h2 id="poetry-themes">Themes</h2><span>{{ tags.length }}</span></div><p v-if="!tags.length" class="text-sm text-muted-foreground">No themes have been added yet.</p><ul><li v-for="entry in tags" :key="entry.name"><NuxtLink :to="{ path: '/shayris', query: { t: entry.name } }" class="explore-entry"><span>{{ entry.name }}</span><span class="explore-count">{{ entry.count }} {{ entry.count === 1 ? 'poem' : 'poems' }} <ArrowUpRight class="h-4 w-4" aria-hidden="true" /></span></NuxtLink></li></ul></section>
      <section aria-labelledby="poetry-authors" class="explore-section"><div class="explore-section-top"><span aria-hidden="true">02</span><h2 id="poetry-authors">Authors</h2><span>{{ authors.length }}</span></div><ul><li v-for="entry in authors" :key="entry.name"><NuxtLink :to="{ path: '/shayris', query: { a: entry.name } }" class="explore-entry"><span>{{ entry.name }}</span><span class="explore-count">{{ entry.count }} {{ entry.count === 1 ? 'poem' : 'poems' }} <ArrowUpRight class="h-4 w-4" aria-hidden="true" /></span></NuxtLink></li></ul></section>
    </div>
  </div>
</template>

<style scoped>
.explore-header .eyebrow { margin-bottom: 16px; }
.explore-back { margin-bottom: 40px; }
.explore-header { margin-bottom: 42px; }
.title-period { color: var(--studio-accent); }
.explore-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 36px; }
.explore-section { border-top: 1px solid var(--studio-line); }
.explore-section-top { display: flex; align-items: center; gap: 18px; padding: 24px 0 10px; }
.explore-section-top > span { color: var(--studio-accent); font-size: 11px; font-variant-numeric: tabular-nums; }
.explore-section-top > span:last-child { margin-left: auto; }
.explore-section h2 { font-size: 25px; font-weight: 500; letter-spacing: -.04em; }
.explore-caption { color: hsl(var(--muted-foreground)); font: italic 16px Georgia, serif; padding-bottom: 24px; }
.explore-entry { display: flex; align-items: center; justify-content: space-between; gap: 18px; padding: 20px 0; border-top: 1px solid var(--studio-line); font-size: 14px; transition: color .2s; }
.explore-entry:hover { color: var(--studio-accent); }
.explore-count { flex-shrink: 0; display: flex; align-items: center; gap: 16px; font-size: 11px; color: hsl(var(--muted-foreground)); }
.explore-empty { max-width: 740px; padding: 32px; }
.explore-empty > p { color: hsl(var(--muted-foreground)); line-height: 1.8; }
@media (max-width: 640px) { .explore-grid { grid-template-columns: 1fr; gap: 32px; } .explore-entry { gap: 12px; } .explore-count { gap: 10px; } }
</style>
