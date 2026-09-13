<script setup lang="ts">
import { filterValues, matchesPoetry } from '~/utils/poetryFilters'
import { ArrowLeft, ArrowRight, Shuffle } from 'lucide-vue-next'
import { shayriGlossary, type ShayriGlossaryEntry } from '~/data/shayriGlossary'

definePageMeta({ key: route => route.path.replace(/\/+$/, '') })
const route = useRoute()
const pageQuery = usePageQuery()
const poemPath = computed(() => route.path.replace(/\/+$/, ''))
const navigationQuery = computed(() => ({ a: filterValues(pageQuery.value.a), t: filterValues(pageQuery.value.t) }))
const { data: shayri, error } = await useAsyncData(
  () => `poem-${poemPath.value}`, () => queryCollection('shayris').path(poemPath.value).first()
)
if (error.value) throw createError({ statusCode: 500, statusMessage: 'Unable to load poem', cause: error.value })
if (!shayri.value) throw createError({ statusCode: 404, statusMessage: 'Poem not found' })
const { data: allShayris } = await useAsyncData('poetry-index', () =>
  queryCollection('shayris').select('path', 'title', 'date', 'author', 'tags', 'description').order('date', 'DESC').order('title', 'ASC').all()
)
const scopedPoems = computed(() => (allShayris.value || []).filter(item => matchesPoetry(item, navigationQuery.value.a, navigationQuery.value.t)))
const currentIndex = computed(() => scopedPoems.value.findIndex(item => item.path === shayri.value?.path))
const previous = computed(() => currentIndex.value > 0 ? scopedPoems.value[currentIndex.value - 1] : undefined)
const next = computed(() => currentIndex.value >= 0 ? scopedPoems.value[currentIndex.value + 1] : undefined)
const randomCandidates = computed(() => scopedPoems.value.filter(item => item.path !== shayri.value?.path))
function readRandom() {
  const item = randomCandidates.value[Math.floor(Math.random() * randomCandidates.value.length)]
  if (item) return navigateTo({ path: item.path, query: navigationQuery.value })
}

function collectText(node: unknown): string {
  if (typeof node === 'string') return node
  if (Array.isArray(node)) return node.slice(2).map(collectText).join('') + ' '
  if (!node || typeof node !== 'object') return ''
  const item = node as { type?: string, value?: unknown, children?: unknown[] }
  if (item.type === 'text' && typeof item.value === 'string') return item.value
  const children = item.children || (Array.isArray(item.value) ? item.value : [])
  return children.map(collectText).join(' ')
}
const glossaryWords = computed(() => {
  const words = new Set(collectText(shayri.value?.body).toLowerCase().match(/[\p{L}\p{N}'’-]+/gu) || [])
  return Object.values(shayriGlossary).filter(entry => [entry.word, ...(entry.aliases || [])].some(alias => words.has(alias.toLowerCase())))
})
const activeWord = ref<ShayriGlossaryEntry | null>(null)
const glossaryOpen = ref(false)
function openWord(entry: ShayriGlossaryEntry) { activeWord.value = entry; glossaryOpen.value = true }

const videos = computed(() => {
  if (!shayri.value) return []
  const urls = [shayri.value.youtubeUrl, ...(shayri.value.youtubeUrls || [])].filter((url): url is string => Boolean(url))
  return urls.flatMap((sourceUrl) => {
    try {
      const url = new URL(sourceUrl)
      const host = url.hostname.toLowerCase()
      if (!['https:', 'http:'].includes(url.protocol) || !['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be', 'www.youtube-nocookie.com'].includes(host)) return []
      const id = host === 'youtu.be' ? url.pathname.slice(1) : url.searchParams.get('v') || url.pathname.match(/^\/(?:embed|shorts)\/([^/]+)/)?.[1]
      if (!id || !/^[\w-]{11}$/.test(id)) return []
      return [{ embed: `https://www.youtube-nocookie.com/embed/${id}`, url: `https://www.youtube.com/watch?v=${id}` }]
    } catch { return [] }
  })
})
usePageSeo({
  title: () => shayri.value?.title || 'Poetry',
  description: () => shayri.value?.description || `A poem by ${shayri.value?.author || 'the credited author'}.`,
  type: 'article',
  author: () => shayri.value?.author,
  publishedTime: () => shayri.value?.date,
})
</script>

<template>
  <div v-if="shayri" class="studio-page poem-reading-page">
    <nav aria-label="Poetry navigation" class="poem-navigation"><NuxtLink :to="{ path: '/shayris', query: navigationQuery }" class="text-link"><ArrowLeft class="h-4 w-4" aria-hidden="true" /> Browse poetry</NuxtLink><NuxtLink to="/shayris/explore" class="text-link">Themes &amp; authors</NuxtLink></nav>
    <div class="poem-manuscript">
      <header class="poem-reading-header"><h1>{{ shayri.title }}</h1><p class="poem-byline">By <NuxtLink :to="{ path: '/shayris', query: { a: shayri.author } }">{{ shayri.author }}</NuxtLink></p></header>
      <div class="poem-rule" aria-hidden="true" />
      <article class="shayri-text manuscript-body prose prose-neutral dark:prose-invert max-w-none font-serif prose-headings:font-serif"><ContentRenderer :value="shayri" /></article>
      <p class="poem-end" aria-hidden="true">· &nbsp; · &nbsp; ·</p>
      <div v-if="shayri.tags.length" class="poem-tag-list"><NuxtLink v-for="tag in shayri.tags" :key="tag" :to="{ path: '/shayris', query: { t: tag } }" class="filter-chip">{{ tag }}</NuxtLink></div>
    </div>
    <section v-if="glossaryWords.length" aria-labelledby="word-meanings" class="poem-glossary"><div><h2 id="word-meanings">Glossary</h2><p>Select a word to read its meaning.</p></div><ul><li v-for="entry in glossaryWords" :key="entry.key"><button type="button" class="filter-chip" aria-haspopup="dialog" @click="openWord(entry)">{{ entry.word }} <span aria-hidden="true">+</span></button></li></ul></section>
    <AccessibleDialog v-model:open="glossaryOpen" :title="activeWord?.word || 'Word meaning'" close-label="Close word meaning"><div v-if="activeWord" class="space-y-4"><p lang="ur" dir="rtl" class="text-left text-3xl">{{ activeWord.urdu }}</p><p class="font-serif text-xl italic">{{ activeWord.roman }}</p><p v-if="activeWord.origin || activeWord.grammar" class="text-sm text-muted-foreground">{{ [activeWord.origin, activeWord.grammar].filter(Boolean).join(' · ') }}</p><p class="leading-relaxed">{{ activeWord.english }}</p><p lang="ur-Latn" class="leading-relaxed text-muted-foreground">{{ activeWord.romanUrdu }}</p></div></AccessibleDialog>
    <section v-if="videos.length" class="poem-recordings" aria-labelledby="recording-title"><h2 id="recording-title">Listen</h2><div v-for="(video, index) in videos" :key="video.embed" class="poem-video"><div class="aspect-video overflow-hidden rounded-xl bg-black"><iframe :src="video.embed" :title="shayri.title + ' by ' + shayri.author + (videos.length > 1 ? ' — recording ' + (index + 1) : '')" class="h-full w-full" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen /></div><a :href="video.url" class="text-link mt-3">Watch on YouTube{{ videos.length > 1 ? ` (recording ${index + 1})` : '' }} <ArrowRight class="h-4 w-4" aria-hidden="true" /></a></div></section>
    <footer class="poem-footer"><nav aria-label="Read another poem"><NuxtLink v-if="previous" :to="{ path: previous.path, query: navigationQuery }" class="text-link"><ArrowLeft class="h-4 w-4" aria-hidden="true" /> Previous poem</NuxtLink><button v-if="randomCandidates.length" type="button" class="tactile-button" @click="readRandom"><Shuffle class="h-4 w-4" aria-hidden="true" /> Random poem</button><NuxtLink v-if="next" :to="{ path: next.path, query: navigationQuery }" class="text-link">Next poem <ArrowRight class="h-4 w-4" aria-hidden="true" /></NuxtLink></nav><p v-if="currentIndex >= 0">{{ currentIndex + 1 }} of {{ scopedPoems.length }} {{ scopedPoems.length === 1 ? 'poem' : 'poems' }} in this collection</p></footer>
  </div>
</template>

<style scoped>
.poem-reading-page { max-width: 950px; }
.poem-navigation { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 12px 24px; margin-bottom: 36px; }
.poem-manuscript { background: var(--studio-paper); border: 1px solid var(--studio-line); border-radius: 4px; padding: clamp(24px, 5vw, 64px); box-shadow: 4px 5px 0 -1px hsl(var(--background)), 4px 5px 0 0 var(--studio-line), 0 10px 30px -25px #213b2c44; }
.manuscript-top { display: flex; justify-content: space-between; align-items: center; gap: 20px; padding-bottom: 34px; }
.manuscript-top .eyebrow { margin: 0; font-size: 9px; }
.manuscript-number { font-size: 10px; color: hsl(var(--muted-foreground)); font-variant-numeric: tabular-nums; }
.poem-reading-header h1 { font: 500 clamp(2rem, 4.6vw, 3.5rem)/1.14 Georgia, serif; letter-spacing: -.045em; overflow-wrap: anywhere; text-wrap: balance; }
.poem-byline { margin-top: 22px; color: hsl(var(--muted-foreground)); font-size: 13px; }
.poem-byline a { color: var(--studio-accent); text-decoration: underline; text-decoration-color: var(--studio-line); text-underline-offset: 4px; }
.poem-reading-description { color: hsl(var(--muted-foreground)); font-size: 14px; line-height: 1.9; margin-top: 22px; }
.poem-added { font-size: 10px; color: hsl(var(--muted-foreground)); margin-top: 16px; }
.poem-rule { display: flex; align-items: center; gap: 22px; margin: 36px 0; color: var(--studio-accent); font-size: 25px; }
.poem-rule::after { content: ''; height: 1px; flex: 1; background: var(--studio-line); }
.manuscript-body :deep(p) { font-family: Georgia, serif; font-size: clamp(1.08rem, 1.75vw, 1.3rem); line-height: 2; overflow-wrap: anywhere; }
.manuscript-body :deep(p:first-of-type)::first-letter { font-family: Georgia, serif; }
.poem-glossary .eyebrow, .poem-recordings .eyebrow { margin-bottom: 10px; }
.poem-end { text-align: center; font-family: Georgia, serif; color: var(--studio-accent); font-size: 22px; margin-top: 36px; }
.poem-tag-list { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 30px; padding-top: 24px; border-top: 1px solid var(--studio-line); }
.poem-glossary { display: grid; grid-template-columns: 220px minmax(0, 1fr); gap: 28px; margin-top: 44px; padding: 28px 0; border-bottom: 1px solid var(--studio-line); }
.poem-glossary h2, .poem-recordings h2 { font-size: 25px; letter-spacing: -.04em; font-weight: 500; }
.poem-glossary > div > p:last-child { margin-top: 8px; font-size: 12px; line-height: 1.7; color: hsl(var(--muted-foreground)); }
.poem-glossary ul { display: flex; flex-wrap: wrap; align-content: flex-start; gap: 8px; }
.poem-recordings { padding-top: 36px; }
.poem-video { margin-top: 24px; }
.poem-footer { padding-top: 32px; margin-top: 32px; border-top: 1px solid var(--studio-line); }
.poem-footer nav { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px; }
.poem-footer > p { text-align: center; color: hsl(var(--muted-foreground)); font-size: 10px; margin-top: 28px; }
@media (max-width: 580px) { .manuscript-top { gap: 10px; padding-bottom: 28px; } .manuscript-top .eyebrow { letter-spacing: .08em; font-size: 8px; } .poem-glossary { grid-template-columns: 1fr; gap: 20px; } .poem-footer nav { justify-content: center; } .poem-rule { margin: 28px 0; } }
</style>
