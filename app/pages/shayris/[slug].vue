<script setup lang="ts">
import { ArrowLeft, ArrowRight, Shuffle } from 'lucide-vue-next'
import { shayriGlossary, type ShayriGlossaryEntry } from '~/data/shayriGlossary'

definePageMeta({ key: route => route.path.replace(/\/+$/, '') })
const route = useRoute()
const pageQuery = usePageQuery()
const poemPath = computed(() => route.path.replace(/\/+$/, ''))
const navigationQuery = computed(() => ({
  ...(typeof pageQuery.value.a === 'string' && pageQuery.value.a ? { a: pageQuery.value.a } : {}),
  ...(typeof pageQuery.value.t === 'string' && pageQuery.value.t ? { t: pageQuery.value.t } : {}),
}))
const { data: shayri, error } = await useAsyncData(
  () => `poem-${poemPath.value}`, () => queryCollection('shayris').path(poemPath.value).first()
)
if (error.value) throw createError({ statusCode: 500, statusMessage: 'Unable to load poem', cause: error.value })
if (!shayri.value) throw createError({ statusCode: 404, statusMessage: 'Poem not found' })
const { data: allShayris } = await useAsyncData('poetry-index', () =>
  queryCollection('shayris').order('date', 'DESC').order('title', 'ASC').all()
)
const scopedPoems = computed(() => (allShayris.value || []).filter(item =>
  (!navigationQuery.value.a || item.author.toLowerCase() === navigationQuery.value.a.toLowerCase()) &&
  (!navigationQuery.value.t || item.tags.some(tag => tag.toLowerCase() === navigationQuery.value.t?.toLowerCase()))
))
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

const video = computed(() => {
  if (!shayri.value?.youtubeUrl) return undefined
  try {
    const url = new URL(shayri.value.youtubeUrl)
    const host = url.hostname.toLowerCase()
    if (!['https:', 'http:'].includes(url.protocol) || !['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be', 'www.youtube-nocookie.com'].includes(host)) return undefined
    const id = host === 'youtu.be' ? url.pathname.slice(1) : url.searchParams.get('v') || url.pathname.match(/^\/(?:embed|shorts)\/([^/]+)/)?.[1]
    if (!id || !/^[\w-]{11}$/.test(id)) return undefined
    return { embed: `https://www.youtube-nocookie.com/embed/${id}`, url: `https://www.youtube.com/watch?v=${id}` }
  } catch { return undefined }
})
usePageSeo({
  title: () => shayri.value?.title || 'Poetry',
  description: () => shayri.value?.description || `A poem by ${shayri.value?.author || 'the credited author'}.`,
  type: 'article',
  author: () => shayri.value?.author,
  publishedTime: () => shayri.value?.date,
})
useHead({ link: [{ key: 'poetry-font', rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,600&display=swap' }] })
</script>

<template>
  <div v-if="shayri" class="mx-auto w-full max-w-3xl px-5 py-8 sm:px-8 lg:py-12">
    <nav aria-label="Poetry navigation" class="mb-10 flex flex-wrap items-center justify-between gap-4 text-sm">
      <NuxtLink :to="{ path: '/shayris', query: navigationQuery }" class="inline-flex items-center gap-2 rounded-sm text-muted-foreground hover:text-foreground"><ArrowLeft class="h-4 w-4" aria-hidden="true" /> Browse poetry</NuxtLink>
      <NuxtLink to="/shayris/explore" class="rounded-sm underline underline-offset-4">Themes and authors</NuxtLink>
      <ThemeToggle />
    </nav>
    <header class="mb-10">
      <h1 class="shayri-title mb-4 text-4xl leading-tight sm:text-5xl lg:text-6xl">{{ shayri.title }}</h1>
      <p class="text-base text-muted-foreground">By <NuxtLink :to="{ path: '/shayris', query: { a: shayri.author } }" class="underline underline-offset-4">{{ shayri.author }}</NuxtLink></p>
      <p class="mt-3 text-xs text-muted-foreground">Added <time :datetime="dateTime(shayri.date)">{{ formatDate(shayri.date) }}</time></p>
      <p v-if="shayri.description" class="mt-5 leading-relaxed text-muted-foreground">{{ shayri.description }}</p>
    </header>
    <article class="shayri-text prose prose-neutral dark:prose-invert max-w-none font-serif prose-headings:font-serif"><ContentRenderer :value="shayri" /></article>
    <section v-if="glossaryWords.length" aria-labelledby="word-meanings" class="mt-10 border-t border-border pt-6">
      <h2 id="word-meanings" class="text-lg font-semibold">Word meanings</h2>
      <p class="mt-2 text-sm text-muted-foreground">Select a word to read its meaning.</p>
      <ul class="mt-4 flex flex-wrap gap-3">
        <li v-for="entry in glossaryWords" :key="entry.key"><button type="button" class="rounded-full border border-border px-4 py-2 text-sm hover:bg-muted/40" aria-haspopup="dialog" @click="openWord(entry)">{{ entry.word }}</button></li>
      </ul>
    </section>
    <AccessibleDialog v-model:open="glossaryOpen" :title="activeWord?.word || 'Word meaning'" close-label="Close word meaning">
      <div v-if="activeWord" class="space-y-4">
        <p lang="ur" dir="rtl" class="text-left text-3xl">{{ activeWord.urdu }}</p>
        <p class="font-serif text-xl italic">{{ activeWord.roman }}</p>
        <p v-if="activeWord.origin || activeWord.grammar" class="text-sm text-muted-foreground">{{ [activeWord.origin, activeWord.grammar].filter(Boolean).join(' · ') }}</p>
        <p class="leading-relaxed">{{ activeWord.english }}</p>
        <p lang="ur-Latn" class="leading-relaxed text-muted-foreground">{{ activeWord.romanUrdu }}</p>
      </div>
    </AccessibleDialog>
    <div v-if="video" class="mt-10">
      <div class="aspect-video overflow-hidden rounded-lg bg-black"><iframe :src="video.embed" :title="shayri.title + ' by ' + shayri.author" class="h-full w-full" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen /></div>
      <a :href="video.url" class="mt-3 inline-block text-sm underline underline-offset-4">Watch on YouTube</a>
    </div>
    <footer class="mt-10 border-t border-border pt-6">
      <div class="mb-6 flex flex-wrap gap-2"><NuxtLink v-for="tag in shayri.tags" :key="tag" :to="{ path: '/shayris', query: { t: tag } }" class="rounded-full border border-border px-3 py-2 text-xs text-muted-foreground hover:text-foreground">{{ tag }}</NuxtLink></div>
      <nav aria-label="Read another poem" class="flex flex-wrap items-center justify-between gap-4 text-sm">
        <NuxtLink v-if="previous" :to="{ path: previous.path, query: navigationQuery }" class="inline-flex items-center gap-2 rounded-sm py-2"><ArrowLeft class="h-4 w-4" aria-hidden="true" /> Previous poem</NuxtLink>
        <button v-if="randomCandidates.length" type="button" class="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2" @click="readRandom"><Shuffle class="h-4 w-4" aria-hidden="true" /> Random poem</button>
        <NuxtLink v-if="next" :to="{ path: next.path, query: navigationQuery }" class="inline-flex items-center gap-2 rounded-sm py-2">Next poem <ArrowRight class="h-4 w-4" aria-hidden="true" /></NuxtLink>
      </nav>
      <p v-if="currentIndex >= 0" class="mt-5 text-center text-xs text-muted-foreground">{{ currentIndex + 1 }} of {{ scopedPoems.length }} {{ scopedPoems.length === 1 ? 'poem' : 'poems' }}</p>
    </footer>
  </div>
</template>
