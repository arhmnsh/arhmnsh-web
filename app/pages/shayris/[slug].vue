<script setup lang="ts">
import { ArrowLeftIcon, ArrowRightIcon, Compass, Heart, Moon, Shuffle, Sun, Volume2, X } from 'lucide-vue-next'
import { shayriGlossary, type ShayriGlossaryEntry } from '~/data/shayriGlossary'

const route = useRoute()
const slug = computed(() => route.params.slug as string)
const activeGlossary = ref<(ShayriGlossaryEntry & { top: number, left: number, width: number, height: number }) | null>(null)

const colorMode = useColorMode()
const toggleTheme = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

const { data: shayri } = await useAsyncData(`shayri-${slug.value}`, () =>
  queryCollection('shayris').path(route.path).first()
)
const { data: allShayris } = await useAsyncData('shayri-navigation-all', () =>
  queryCollection('shayris').order('date', 'DESC').all()
)

const activeFilter = computed(() => {
  const author = route.query.a as string | undefined
  const tag = route.query.t as string | undefined

  if (author) return { kind: 'author' as const, value: author }
  if (tag) return { kind: 'tag' as const, value: tag }
  return undefined
})

const scopedShayris = computed(() => {
  const items = allShayris.value || []
  if (!activeFilter.value) return items

  if (activeFilter.value.kind === 'author') {
    return items.filter((item: any) => item.author === activeFilter.value?.value)
  }

  return items.filter((item: any) => item.tags?.includes(activeFilter.value?.value))
})

const currentIndex = computed(() => {
  if (!shayri.value) return -1
  return scopedShayris.value.findIndex((item: any) => item.path === shayri.value?.path)
})

const currentNumber = computed(() => currentIndex.value + 1)
const totalCount = computed(() => scopedShayris.value.length)

const previousShayri = computed(() => {
  if (currentIndex.value <= 0) return undefined
  return scopedShayris.value[currentIndex.value - 1]
})

const nextShayri = computed(() => {
  if (currentIndex.value < 0 || currentIndex.value >= scopedShayris.value.length - 1) return undefined
  return scopedShayris.value[currentIndex.value + 1]
})

const randomShayri = computed(() => {
  const items = scopedShayris.value
  if (items.length <= 1 || currentIndex.value < 0) return undefined

  const candidates = items.filter((_: any, index: number) => index !== currentIndex.value)
  return candidates[Math.floor(Math.random() * candidates.length)]
})

const navigationQuery = computed(() => {
  if (!activeFilter.value) return {}
  return activeFilter.value.kind === 'author'
    ? { a: activeFilter.value.value }
    : { t: activeFilter.value.value }
})

const embedUrl = computed(() => {
  const rawUrl = shayri.value?.youtubeUrl
  if (!rawUrl) return undefined

  try {
    const url = new URL(rawUrl)

    if (url.hostname.includes('youtu.be')) {
      const videoId = url.pathname.replace('/', '')
      return videoId ? `https://www.youtube.com/embed/${videoId}` : rawUrl
    }

    if (url.pathname.startsWith('/shorts/')) {
      const videoId = url.pathname.split('/')[2]
      return videoId ? `https://www.youtube.com/embed/${videoId}` : rawUrl
    }

    if (url.searchParams.get('v')) {
      return `https://www.youtube.com/embed/${url.searchParams.get('v')}`
    }

    return rawUrl
  } catch {
    return rawUrl
  }
})

const collectText = (node: any): string => {
  if (!node) return ''
  if (typeof node === 'string') return node
  if (Array.isArray(node)) {
    const [tag, , ...children] = node
    if (tag === 'br') return '\n'
    return children.map(collectText).join('')
  }
  if (node.type === 'text') return node.value || ''
  if (node.tag === 'br') return '\n'
  if (!Array.isArray(node.children)) return ''
  return node.children.map(collectText).join('')
}

const poemBlocks = computed(() => {
  const body = shayri.value?.body as any
  const children = body?.children || body?.value || []
  return children
    .filter((node: any) => {
      if (Array.isArray(node)) return node[0] === 'p'
      return node.tag === 'p' || node.type === 'paragraph'
    })
    .map(collectText)
    .filter(Boolean)
})

const escapedGlossary = computed(() => {
  return Object.values(shayriGlossary)
    .flatMap((entry: ShayriGlossaryEntry) => (entry.aliases?.length ? entry.aliases : [entry.word]).map((alias) => ({
      ...entry,
      pattern: new RegExp(`\\b(${alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\b`, 'gi')
    })))
    .sort((a: any, b: any) => b.word.length - a.word.length)
})

const annotateText = (text: string) => {
  const matches: Array<{ start: number, end: number, word: string, entry: ShayriGlossaryEntry }> = []

  escapedGlossary.value.forEach((entry: any) => {
    for (const match of text.matchAll(entry.pattern)) {
      const start = match.index ?? 0
      const end = start + match[0].length
      if (matches.some((existing) => start < existing.end && end > existing.start)) {
        continue
      }
      matches.push({ start, end, word: match[0], entry })
    }
  })

  matches.sort((a, b) => a.start - b.start)

  const segments: Array<{ text: string, glossary?: ShayriGlossaryEntry }> = []
  let cursor = 0
  matches.forEach((match) => {
    if (match.start > cursor) {
      segments.push({ text: text.slice(cursor, match.start) })
    }
    segments.push({ text: match.word, glossary: match.entry })
    cursor = match.end
  })
  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor) })
  }

  return segments.length > 0 ? segments : [{ text }]
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

const openGlossary = (entry: ShayriGlossaryEntry, event: MouseEvent | FocusEvent) => {
  if (!import.meta.client) return

  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const margin = 12
  const width = Math.min(520, window.innerWidth - margin * 2)
  const left = clamp(rect.left + rect.width / 2 - width / 2, margin, window.innerWidth - width - margin)
  const height = Math.min(420, window.innerHeight - margin * 2)
  const preferredTop = rect.bottom + height + margin < window.innerHeight
    ? rect.bottom + 14
    : rect.top - height - 14
  const top = clamp(preferredTop, margin, window.innerHeight - height - margin)

  activeGlossary.value = {
    ...entry,
    top,
    left,
    width,
    height
  }
}

const speakGlossary = (entry: ShayriGlossaryEntry) => {
  if (!import.meta.client || !('speechSynthesis' in window)) return

  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(new SpeechSynthesisUtterance(entry.word))
}

const closeGlossary = () => {
  activeGlossary.value = null
}

const toggleGlossary = (entry: ShayriGlossaryEntry, event: MouseEvent) => {
  if (activeGlossary.value?.key === entry.key) {
    closeGlossary()
    return
  }
  openGlossary(entry, event)
}

onMounted(() => {
  window.addEventListener('resize', closeGlossary)

  onUnmounted(() => {
    window.removeEventListener('resize', closeGlossary)
  })
})
</script>

<template>
  <div v-if="shayri" class="w-full max-w-3xl mx-auto px-4 sm:px-6 py-8 lg:py-16" @click.self="closeGlossary">
    <header class="mb-12 flex flex-col items-center text-center">
      <div class="mb-8 flex w-full justify-end">
        <ClientOnly>
          <button
            @click="toggleTheme"
            class="hidden rounded-md p-1 transition-colors lg:block"
            :class="colorMode.value === 'dark' ? 'text-neutral-400 hover:text-white' : 'text-neutral-600 hover:text-black'"
            aria-label="Toggle Theme"
          >
            <Sun v-if="colorMode.value === 'dark'" class="h-4 w-4" />
            <Moon v-else class="h-4 w-4" />
          </button>
        </ClientOnly>
      </div>

      <h1 class="shayri-title mb-4 text-5xl leading-[0.95] sm:text-6xl lg:text-7xl">
        {{ shayri.title }}
      </h1>

      <NuxtLink
        :to="{ path: '/shayris', query: { a: shayri.author } }"
        class="shayri-author text-xl text-muted-foreground/80 transition-colors hover:text-foreground"
      >
        {{ shayri.author }}
      </NuxtLink>

      <time
        :datetime="shayri.date"
        class="mt-3 font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground/50"
      >
        {{ new Date(shayri.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }}
      </time>
    </header>

    <article class="shayri-text max-w-none">
      <p
        v-for="(block, blockIndex) in poemBlocks"
        :key="`${blockIndex}-${block}`"
        class="mb-8 leading-[1.75] text-foreground"
      >
        <template
          v-for="(segment, segmentIndex) in annotateText(block)"
          :key="`${blockIndex}-${segmentIndex}-${segment.text}`"
        >
          <span v-if="!segment.glossary">{{ segment.text }}</span>
          <span v-else class="inline-block align-baseline">
            <button
              type="button"
              class="decoration-muted-foreground/70 decoration-dotted underline underline-offset-4 transition-colors hover:text-foreground focus:outline-none focus-visible:text-foreground"
              @pointerdown.stop
              @pointerenter="openGlossary(segment.glossary, $event)"
              @mouseenter="openGlossary(segment.glossary, $event)"
              @focus="openGlossary(segment.glossary, $event)"
              @click.stop="toggleGlossary(segment.glossary, $event)"
            >
              {{ segment.text }}
            </button>
          </span>
        </template>
      </p>
    </article>

    <Teleport to="body">
      <div
        v-if="activeGlossary"
        class="fixed z-[100] overflow-y-auto rounded-2xl border border-neutral-200 bg-white px-6 py-5 text-left font-sans text-neutral-950 shadow-2xl shadow-black/20 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-50 sm:px-7 sm:py-6"
        :style="{
          top: `${activeGlossary.top}px`,
          left: `${activeGlossary.left}px`,
          width: `${activeGlossary.width}px`,
          maxHeight: `${activeGlossary.height}px`
        }"
        @click.stop
      >
        <div class="mb-5 flex items-start justify-between gap-5">
          <div class="min-w-0">
            <p class="font-serif text-4xl font-bold leading-none text-neutral-950 dark:text-neutral-50">
              {{ activeGlossary.word }}
            </p>
            <div class="mt-4 flex flex-wrap items-center gap-3">
              <p class="text-3xl font-semibold leading-none text-neutral-950 dark:text-neutral-50" dir="rtl">
                {{ activeGlossary.urdu }}
              </p>
              <span class="h-1.5 w-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700" aria-hidden="true" />
              <p class="font-serif text-2xl italic leading-none text-neutral-950 dark:text-neutral-50">
                {{ activeGlossary.roman }}
              </p>
            </div>
          </div>

          <div class="flex shrink-0 items-center gap-3 text-neutral-500 dark:text-neutral-400">
            <button
              type="button"
              class="transition-colors hover:text-sky-500"
              aria-label="Hear pronunciation"
              @click="speakGlossary(activeGlossary)"
            >
              <Volume2 class="h-6 w-6" />
            </button>
            <button
              type="button"
              class="transition-colors hover:text-rose-500"
              aria-label="Save word"
            >
              <Heart class="h-6 w-6" />
            </button>
            <button
              type="button"
              class="transition-colors hover:text-neutral-950 dark:hover:text-neutral-50"
              aria-label="Close glossary"
              @click="closeGlossary"
            >
              <X class="h-7 w-7" />
            </button>
          </div>
        </div>

        <p
          v-if="activeGlossary.origin || activeGlossary.grammar"
          class="mb-4 text-base font-medium text-neutral-400 dark:text-neutral-500"
        >
          {{ [activeGlossary.origin, activeGlossary.grammar].filter(Boolean).join(' ; ') }}
        </p>

        <ul class="space-y-3 text-lg leading-relaxed text-neutral-950 dark:text-neutral-100">
          <li class="flex gap-3">
            <span class="mt-3 h-2 w-2 shrink-0 rounded-full border-2 border-neutral-400 dark:border-neutral-500" aria-hidden="true" />
            <span>{{ activeGlossary.english }}</span>
          </li>
          <li class="flex gap-3 text-base text-neutral-600 dark:text-neutral-300">
            <span class="mt-3 h-2 w-2 shrink-0 rounded-full border-2 border-neutral-300 dark:border-neutral-600" aria-hidden="true" />
            <span>{{ activeGlossary.romanUrdu }}</span>
          </li>
        </ul>
      </div>
    </Teleport>

    <div
      v-if="embedUrl"
      class="relative mt-12 aspect-video overflow-hidden rounded-lg border border-muted bg-black"
    >
      <iframe
        class="absolute inset-0 h-full w-full"
        :src="embedUrl"
        :title="`${shayri.title} by ${shayri.author}`"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
      />
    </div>

    <footer class="mt-12 border-t border-muted pt-8">
      <div class="mb-8 flex flex-wrap items-center justify-start gap-2">
        <NuxtLink
          v-for="tag in shayri.tags"
          :key="tag"
          :to="{ path: '/shayris', query: { t: tag } }"
          class="rounded-full border border-muted px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
        >
          {{ tag }}
        </NuxtLink>
      </div>

      <div class="mb-8 flex justify-center">
        <NuxtLink
          to="/shayris/explore"
          class="inline-flex items-center gap-2 rounded-full border border-muted px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
        >
          <Compass class="h-4 w-4" />
          <span>Explore tags & authors</span>
        </NuxtLink>
      </div>

      <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-3 font-sans">
        <div class="flex justify-start">
          <NuxtLink
            v-if="previousShayri"
            :to="{ path: previousShayri.path, query: navigationQuery }"
            class="inline-flex h-10 w-10 items-center justify-center rounded-md border border-muted text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
            aria-label="Previous shayri"
            title="Previous"
          >
            <ArrowLeftIcon class="h-4 w-4" />
          </NuxtLink>
          <span v-else class="inline-flex h-10 w-10 items-center justify-center rounded-md border border-muted text-muted-foreground/30">
            <ArrowLeftIcon class="h-4 w-4" />
          </span>
        </div>

        <div class="flex items-center gap-3">
          <NuxtLink
            v-if="randomShayri"
            :to="{ path: randomShayri.path, query: navigationQuery }"
            class="inline-flex h-10 w-10 items-center justify-center rounded-md border border-muted text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
            aria-label="Random shayri"
            title="Random"
          >
            <Shuffle class="h-4 w-4" />
          </NuxtLink>
          <span v-else class="inline-flex h-10 w-10 items-center justify-center rounded-md border border-muted text-muted-foreground/30">
            <Shuffle class="h-4 w-4" />
          </span>
          <span class="min-w-16 text-center text-xs font-medium tabular-nums text-muted-foreground">
            {{ currentNumber }} / {{ totalCount }}
          </span>
        </div>

        <div class="flex justify-end">
          <NuxtLink
            v-if="nextShayri"
            :to="{ path: nextShayri.path, query: navigationQuery }"
            class="inline-flex h-10 w-10 items-center justify-center rounded-md border border-muted text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
            aria-label="Next shayri"
            title="Next"
          >
            <ArrowRightIcon class="h-4 w-4" />
          </NuxtLink>
          <span v-else class="inline-flex h-10 w-10 items-center justify-center rounded-md border border-muted text-muted-foreground/30">
            <ArrowRightIcon class="h-4 w-4" />
          </span>
        </div>
      </div>
    </footer>
  </div>
  <div v-else class="flex h-full items-center justify-center text-muted-foreground">
    <p>Shayri not found</p>
  </div>
</template>
