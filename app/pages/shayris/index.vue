<script setup lang="ts">
import { ArrowUpRight, SlidersHorizontal } from 'lucide-vue-next'
import { filterValues, matchesPoetry } from '~/utils/poetryFilters'
const pageQuery = usePageQuery()
const selectedTags = computed(() => filterValues(pageQuery.value.t))
const selectedAuthors = computed(() => filterValues(pageQuery.value.a))
const filtersOpen = ref(false)
const { data: allShayris } = await useAsyncData('poetry-index', () =>
  queryCollection('shayris').select('path', 'title', 'date', 'author', 'tags', 'description').order('date', 'DESC').order('title', 'ASC').all()
)
const tags = computed(() => [...new Set((allShayris.value || []).flatMap(item => item.tags))].sort())
const authors = computed(() => [...new Set((allShayris.value || []).map(item => item.author))].sort())
const navigationQuery = computed(() => ({ a: selectedAuthors.value, t: selectedTags.value }))
const filterCount = computed(() => selectedAuthors.value.length + selectedTags.value.length)
const poems = computed(() => (allShayris.value || []).filter(item => matchesPoetry(item, selectedAuthors.value, selectedTags.value)))
function toggleFilter(key: 'a' | 't', value: string) {
  const current = key === 'a' ? selectedAuthors.value : selectedTags.value
  return navigateTo({ path: '/shayris', query: { ...navigationQuery.value, [key]: current.includes(value) ? current.filter(name => name !== value) : [...current, value] } })
}
function clearFilters() { return navigateTo('/shayris') }
usePageSeo({
  title: 'Poetry',
  description: 'Browse poems by author and theme, with word meanings alongside the reading.',
  noindex: () => !allShayris.value?.length,
})
</script>

<template>
  <div class="studio-page poetry-page">
    <header class="poetry-header">
      <div><h1 class="page-title">Poetry</h1></div>
    </header>
    <div class="poetry-layout">
      <aside class="poetry-sidebar" aria-label="Poetry filters"><PoetryFilters :authors="authors" :tags="tags" :selected-authors="selectedAuthors" :selected-tags="selectedTags" @toggle="toggleFilter" @clear="clearFilters" /></aside>
      <div class="min-w-0">
        <div class="poetry-toolbar"><p role="status">{{ poems.length }} {{ poems.length === 1 ? 'poem' : 'poems' }}</p><button type="button" class="tactile-button mobile-filters" aria-haspopup="dialog" @click="filtersOpen = true"><SlidersHorizontal class="h-4 w-4" aria-hidden="true" /> Filters{{ filterCount ? ` (${filterCount})` : '' }}</button><button v-if="filterCount" type="button" class="text-link desktop-clear" @click="clearFilters">Clear filters</button></div>
        <div v-if="!poems.length" class="surface-card poetry-empty"><p class="empty-symbol" aria-hidden="true">“</p><h2>{{ allShayris?.length ? 'No matching poems' : 'No poems yet' }}</h2><p>{{ allShayris?.length ? 'No poems match these filters. Try another author or theme.' : 'Poems will appear here when published.' }}</p><button v-if="filterCount" type="button" class="text-link" @click="clearFilters">Browse all poems <ArrowUpRight class="h-4 w-4" aria-hidden="true" /></button></div>
        <ul v-else class="poem-grid">
          <li v-for="(poem, index) in poems" :key="poem.path"><NuxtLink :to="{ path: poem.path, query: navigationQuery }" class="poem-card"><h2>{{ poem.title }}</h2><p class="poem-author">{{ poem.author }}</p></NuxtLink></li>
        </ul>
      </div>
    </div>
    <AccessibleDialog v-model:open="filtersOpen" title="Filter poetry" close-label="Close filters"><PoetryFilters :authors="authors" :tags="tags" :selected-authors="selectedAuthors" :selected-tags="selectedTags" @toggle="toggleFilter" @clear="clearFilters" /><button type="button" class="tactile-button show-poems" @click="filtersOpen = false">Show {{ poems.length }} {{ poems.length === 1 ? 'poem' : 'poems' }} <ArrowUpRight class="h-4 w-4" aria-hidden="true" /></button></AccessibleDialog>
  </div>
</template>

<style scoped>
.poetry-header .eyebrow { margin-bottom: 16px; }
.poetry-header { display: flex; align-items: flex-end; justify-content: space-between; gap: 28px; padding-bottom: 44px; border-bottom: 1px solid var(--studio-line); }
.title-period { color: var(--studio-accent); }
.poetry-layout { display: grid; grid-template-columns: 180px minmax(0, 1fr); gap: 44px; padding-top: 36px; }
.poetry-sidebar { border-right: 1px solid var(--studio-line); padding-right: 26px; }
.poetry-toolbar { min-height: 44px; display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 24px; }
.poetry-toolbar > p { font-size: 11px; color: hsl(var(--muted-foreground)); }
.poetry-toolbar > p span { margin: 0 8px; opacity: .5; }
.mobile-filters { display: none; }
.poem-grid { display: grid; grid-template-columns: 1fr; gap: 0; }
.poem-grid > li { min-width: 0; }
.poem-card { display:block; padding:22px 0; border-bottom:1px solid var(--studio-line); transition:color .2s; }

.poem-card:hover { color:var(--studio-accent); }
.poem-card-top { display: flex; justify-content: space-between; margin-bottom: 16px; color: hsl(var(--muted-foreground)); font-size: 10px; font-variant-numeric: tabular-nums; }
.poem-card-top span:last-child { font-size: 18px; color: var(--studio-accent); }
.poem-card h2 { font: 500 clamp(1.3rem, 2vw, 1.6rem)/1.3 Georgia, serif; letter-spacing: -.025em; overflow-wrap: anywhere; text-wrap: balance; }
.poem-author { color: var(--studio-accent); font-size: 11px; margin-top: 12px; }
.poem-description { margin-top: 18px; margin-bottom: 22px; color: hsl(var(--muted-foreground)); font-size: 12px; line-height: 1.8; }
.poem-tags { margin-top: auto; padding-top: 22px; font-size: 9px; text-transform: uppercase; letter-spacing: .08em; color: hsl(var(--muted-foreground)); }
.poetry-empty { padding: 32px; }
.empty-symbol { font: 80px/.8 Georgia, serif; color: var(--studio-accent); }
.poetry-empty h2 { font-size: 22px; letter-spacing: -.03em; margin-top: 12px; }
.poetry-empty > p:not(.empty-symbol) { color: hsl(var(--muted-foreground)); font-size: 14px; line-height: 1.8; margin: 14px 0 18px; }
.show-poems { position: sticky; bottom: 0; justify-content: center; width: 100%; margin-top: 24px; }
@media (max-width: 1000px) { .poetry-layout { grid-template-columns: 1fr; padding-top: 20px; } .poetry-sidebar, .desktop-clear { display: none; } .mobile-filters { display: inline-flex; } }
@media (max-width: 640px) { .poetry-header { flex-direction: column; align-items: flex-start; gap: 22px; padding-bottom: 28px; } .poem-grid { grid-template-columns: 1fr; gap: 18px; } .poem-card { display:block; padding:22px 0; border-bottom:1px solid var(--studio-line); transition:color .2s; } .poem-card h2 { font-size: 21px; } .poem-card-top { margin-bottom: 20px; } }
@media (prefers-reduced-motion: reduce) { .poem-card { display:block; padding:22px 0; border-bottom:1px solid var(--studio-line); transition:color .2s; } .poem-card:hover { color:var(--studio-accent); } }
</style>
