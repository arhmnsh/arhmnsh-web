<script setup lang="ts">
import { filterValues, matchesPoetry } from '~/utils/poetryFilters'
const pageQuery = usePageQuery()
const selectedTags = computed(() => filterValues(pageQuery.value.t))
const selectedAuthors = computed(() => filterValues(pageQuery.value.a))
const filtersOpen = ref(false)
const { data: allShayris } = await useAsyncData('poetry-index', () =>
  queryCollection('shayris').order('date', 'DESC').order('title', 'ASC').all()
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
  <div class="min-w-0 xl:grid xl:grid-cols-[15rem_minmax(0,1fr)]">
    <aside class="hidden border-r border-border xl:block" aria-label="Poetry filters">
      <div class="sticky top-0 max-h-dvh overflow-y-auto px-5 py-10">
        <PoetryFilters :authors="authors" :tags="tags" :selected-authors="selectedAuthors" :selected-tags="selectedTags" @toggle="toggleFilter" @clear="clearFilters" />
      </div>
    </aside>
    <div class="mx-auto w-full min-w-0 max-w-4xl px-5 py-8 sm:px-8 sm:py-12 lg:px-10">
      <header class="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">Poetry</h1>
        <button class="min-h-11 rounded-lg border border-border bg-gradient-to-b from-background to-muted px-4 text-sm shadow-sm xl:hidden" aria-haspopup="dialog" @click="filtersOpen = true">Filters{{ filterCount ? ` (${filterCount})` : '' }}</button>
      </header>
      <div class="mb-5 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
        <p role="status">{{ poems.length }} {{ poems.length === 1 ? 'poem' : 'poems' }}</p>
        <button v-if="filterCount" class="min-h-11 underline underline-offset-4" @click="clearFilters">Clear filters</button>
      </div>
      <p v-if="!poems.length" class="py-8 text-muted-foreground">No poems match these filters.</p>
      <ul v-else class="divide-y divide-border border-y border-border">
        <li v-for="poem in poems" :key="poem.path">
          <NuxtLink :to="{ path: poem.path, query: navigationQuery }" class="group block py-5 sm:py-7">
            <h2 class="break-words font-serif text-xl font-medium leading-snug group-hover:underline underline-offset-4 sm:text-2xl">{{ poem.title }}</h2>
            <p class="mt-2 text-sm text-muted-foreground">{{ poem.author }}</p>
            <p v-if="poem.description" class="mt-3 max-w-prose text-sm leading-relaxed text-muted-foreground sm:text-base">{{ poem.description }}</p>
            <p v-if="poem.tags.length" class="mt-3 text-xs leading-relaxed text-muted-foreground">{{ poem.tags.join(' · ') }}</p>
          </NuxtLink>
        </li>
      </ul>
    </div>
    <AccessibleDialog v-model:open="filtersOpen" title="Filter poetry" close-label="Close filters">
      <PoetryFilters :authors="authors" :tags="tags" :selected-authors="selectedAuthors" :selected-tags="selectedTags" @toggle="toggleFilter" @clear="clearFilters" />
      <button class="sticky bottom-0 mt-6 min-h-11 w-full rounded-lg border border-border bg-background px-4 text-sm font-medium shadow-sm" @click="filtersOpen = false">Show {{ poems.length }} {{ poems.length === 1 ? 'poem' : 'poems' }}</button>
    </AccessibleDialog>
  </div>
</template>
