<script setup lang="ts">
import { ArrowUpRight, ArrowRight } from 'lucide-vue-next'
import bookmarks from '../../content/bookmarks.json'
const pageQuery = usePageQuery()
const entries = bookmarks as Array<{title: string, url: string, description?: string, tags: string[]}>
const selectedTag = computed(() => typeof pageQuery.value.tag === 'string' ? pageQuery.value.tag : '')
const tags = [...new Set(entries.flatMap(b => b.tags))].sort()
const filtered = computed(() => entries.filter(b => !selectedTag.value || b.tags.includes(selectedTag.value)))
usePageSeo({title: 'Bookmarks', description: 'Useful links and resources collected by AbdurRahaman Shah.', noindex: !entries.length})
</script>

<template>
  <div class="mx-auto max-w-3xl px-6 py-10 sm:px-10 lg:py-16">
    <h1 class="text-3xl font-bold tracking-tight">Bookmarks</h1>
    <p class="mt-3 font-serif text-lg text-muted-foreground">Links worth keeping.</p>
    <div v-if="!entries.length" class="mt-10 rounded-lg border border-border p-6">
      <h2 class="text-lg font-medium">This collection is still taking shape.</h2>
      <p class="mt-3 text-sm leading-relaxed text-muted-foreground">There are no bookmarks published yet. In the meantime, explore the reading and writing already here.</p>
      <div class="mt-5 flex flex-wrap gap-6 text-sm"><NuxtLink to="/articles" class="inline-flex min-h-11 items-center gap-2">Read the articles <ArrowRight class="h-4 w-4" aria-hidden="true" /></NuxtLink><NuxtLink to="/books" class="inline-flex min-h-11 items-center gap-2">Visit the bookshelf <ArrowRight class="h-4 w-4" aria-hidden="true" /></NuxtLink></div>
    </div>
    <template v-else>
      <nav aria-label="Filter bookmarks" class="my-8 flex flex-wrap gap-2"><NuxtLink to="/bookmarks" :aria-current="!selectedTag ? 'page' : undefined" class="rounded-full border border-border px-4 py-3 text-sm">All {{ entries.length }}</NuxtLink><NuxtLink v-for="tag in tags" :key="tag" :to="{path:'/bookmarks', query:{tag}}" :aria-current="selectedTag === tag ? 'page' : undefined" class="rounded-full border border-border px-4 py-3 text-sm">{{ tag }}</NuxtLink></nav>
      <p role="status" class="text-sm text-muted-foreground">{{ filtered.length }} bookmarks</p>
      <ul class="mt-3 divide-y divide-border"><li v-for="entry in filtered" :key="entry.url" class="py-6"><a :href="entry.url" target="_blank" rel="noopener noreferrer" class="group block"><h2 class="flex items-center gap-3 font-medium group-hover:underline underline-offset-4">{{ entry.title }}<ArrowUpRight class="h-4 w-4" aria-hidden="true" /></h2><p class="mt-2 text-sm leading-relaxed text-muted-foreground">{{ entry.description }}</p><span class="sr-only">Opens in a new tab.</span></a><p class="mt-3 text-xs text-muted-foreground">{{ entry.tags.join(' · ') }}</p></li></ul>
      <div v-if="!filtered.length" class="mt-8 text-sm text-muted-foreground"><p>No bookmarks match “{{ selectedTag }}”.</p><NuxtLink to="/bookmarks" class="mt-3 inline-block py-3 underline underline-offset-4">Clear the filter</NuxtLink></div>
    </template>
  </div>
</template>
