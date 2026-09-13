<script setup lang="ts">
import { ArrowUpRight, ArrowRight } from 'lucide-vue-next'
import bookmarks from '../../content/bookmarks.json'
function bookmarkDomain(url: string) {
  try { return new URL(url).hostname.replace(/^www\./, '') } catch { return 'Saved resource' }
}
const pageQuery = usePageQuery()
const entries = bookmarks as Array<{title: string, url: string, description?: string, tags: string[]}>
const selectedTag = computed(() => typeof pageQuery.value.tag === 'string' ? pageQuery.value.tag : '')
const tags = [...new Set(entries.flatMap(b => b.tags))].sort()
const filtered = computed(() => entries.filter(b => !selectedTag.value || b.tags.includes(selectedTag.value)))
usePageSeo({title: 'Bookmarks', description: 'Useful links and resources collected by AbdurRahaman Shah.', noindex: !entries.length})
</script>

<template>
  <div class="studio-page bookmarks-page">
    <header class="bookmarks-header"><h1 class="page-title">Bookmarks</h1></header>
    <div v-if="!entries.length" class="surface-card bookmarks-empty"><div><h2>No bookmarks yet</h2><div class="empty-links"><NuxtLink to="/articles" class="text-link">Read the articles <ArrowRight class="h-4 w-4" aria-hidden="true" /></NuxtLink><NuxtLink to="/books" class="text-link">Visit the bookshelf <ArrowRight class="h-4 w-4" aria-hidden="true" /></NuxtLink></div></div></div>
    <template v-else>
      <nav aria-label="Filter bookmarks" class="bookmark-filters"><NuxtLink to="/bookmarks" :aria-current="!selectedTag ? 'page' : undefined" class="filter-chip">All <span>{{ entries.length }}</span></NuxtLink><NuxtLink v-for="tag in tags" :key="tag" :to="{path:'/bookmarks', query:{tag}}" :aria-current="selectedTag === tag ? 'page' : undefined" class="filter-chip">{{ tag }}</NuxtLink></nav>
      <p role="status" class="bookmark-status">{{ filtered.length }} {{ filtered.length === 1 ? 'bookmark' : 'bookmarks' }}{{ selectedTag ? ` in ${selectedTag}` : '' }}</p>
      <ul class="bookmark-grid"><li v-for="entry in filtered" :key="entry.url"><a :href="entry.url" target="_blank" rel="noopener noreferrer" class="surface-card bookmark-card"><div class="bookmark-card-top"><span class="bookmark-domain">{{ bookmarkDomain(entry.url) }}</span><ArrowUpRight class="h-4 w-4" aria-hidden="true" /></div><h2>{{ entry.title }}</h2><p v-if="entry.description">{{ entry.description }}</p><span v-if="entry.tags.length" class="bookmark-tags">{{ entry.tags.join(' · ') }}</span><span class="sr-only">Opens in a new tab.</span></a></li></ul>
      <div v-if="!filtered.length" class="surface-card bookmark-no-match"><p>No bookmarks match “{{ selectedTag }}”.</p><NuxtLink to="/bookmarks" class="text-link mt-3">Clear the filter <ArrowRight class="h-4 w-4" aria-hidden="true" /></NuxtLink></div>
    </template>
  </div>
</template>

<style scoped>
.bookmarks-header .eyebrow { margin-bottom: 16px; }
.bookmarks-header { margin-bottom: 44px; }
.title-period { color: var(--studio-accent); }
.bookmarks-empty { display: grid; grid-template-columns: 1fr; gap: 48px; align-items: center; padding: clamp(28px, 5vw, 56px); }
.bookmarks-empty .eyebrow { margin-bottom: 16px; }
.bookmarks-empty h2 { font-size: 1.2rem; line-height: 1.15; letter-spacing: -.045em; font-weight: 500; }
.bookmarks-empty h2 em { font-family: Georgia, serif; font-weight: 400; }
.bookmarks-empty > div > p:not(.eyebrow) { max-width: 520px; color: hsl(var(--muted-foreground)); font-size: 14px; line-height: 1.8; margin-top: 22px; }
.empty-links { display: flex; flex-wrap: wrap; gap: 12px 24px; margin-top: 22px; }
.bookmark-object { position: relative; width: 104px; height: 160px; align-self: start; margin: 8px auto 0; background: linear-gradient(100deg, #244d3e, #376d57 52%, #2d5e4b); color: #e7e9d7; clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 83%, 0 100%); transform: rotate(-8deg); }
.bookmark-object::before { content: ''; position: absolute; inset: 7px; border: 1px solid #e7e9d73b; }
.bookmark-object span { position: absolute; top: 30px; left: 20px; font-size: 17px; font-weight: 600; letter-spacing: -.02em; line-height: 1.2; }
.bookmark-filters { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 26px; }
.bookmark-status { color: hsl(var(--muted-foreground)); font-size: 11px; margin-bottom: 20px; }
.bookmark-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; }
.bookmark-card { display: flex; flex-direction: column; height: 100%; padding: 28px; }
.bookmark-card-top { display: flex; justify-content: space-between; align-items: center; gap: 16px; color: var(--studio-accent); }
.bookmark-domain { font-size: 10px; letter-spacing: .04em; overflow-wrap: anywhere; }
.bookmark-card h2 { margin-top: 28px; font-size: 22px; font-weight: 500; line-height: 1.3; letter-spacing: -.035em; }
.bookmark-card > p { font-size: 13px; line-height: 1.8; color: hsl(var(--muted-foreground)); margin-top: 12px; margin-bottom: 24px; }
.bookmark-tags { display: block; margin-top: auto; padding-top: 20px; font-size: 10px; color: hsl(var(--muted-foreground)); }
.bookmark-no-match { padding: 28px; font-size: 14px; color: hsl(var(--muted-foreground)); }
@media (max-width: 640px) { .bookmarks-empty { grid-template-columns: 1fr; gap: 28px; } .bookmark-object { width: 70px; height: 110px; margin: 0 0 0 10px; } .bookmark-object span { font-size: 12px; left: 14px; top: 22px; } .bookmark-grid { grid-template-columns: 1fr; } }
</style>
