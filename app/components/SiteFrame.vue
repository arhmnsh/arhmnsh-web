<script setup lang="ts">
import { Search } from 'lucide-vue-next'
import { sections, sectionFor, type Section } from '~/data/sections'

const props = defineProps<{ hidden: Section['id'][] }>()
const route = useRoute()
const { open: openSearch } = useCommandMenu()
const visible = computed(() => sections.filter(section => !props.hidden.includes(section.id)))
const active = computed(() => sectionFor(route.path) || sections[0])
const tabs = computed(() => visible.value.filter(section => section.id !== active.value.id))

const lineElement = ref<HTMLElement | null>(null)
const bodyElement = ref<HTMLElement | null>(null)
const tabElements: Record<string, HTMLElement | undefined> = {}
const setTab = (id: string, element: unknown) => { tabElements[id] = (element as { $el?: HTMLElement } | null)?.$el ?? undefined }

// The header stays put while the page scrolls underneath, and folds to a smaller size once the reader is into the content.
const compact = ref(false)
let frame = 0
function onScroll() {
  cancelAnimationFrame(frame)
  frame = requestAnimationFrame(() => {
    const y = window.scrollY
    const room = document.documentElement.scrollHeight - window.innerHeight
    if (!compact.value && y > 96 && room > 240) compact.value = true
    else if (compact.value && y < 12) compact.value = false
  })
}

// Switching sections: the chosen pill's title travels up under the name while the previous title
// comes down to take its place in the bar. Positions are captured before the route changes the layout.
type Snapshot = { previous: Section, line?: DOMRect, tabs: Record<string, DOMRect>, titles: Record<string, DOMRect> }
let snapshot: Snapshot | null = null
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const rect = (element?: Element | null) => element?.getBoundingClientRect()
// Quick but soft: the titles get moving immediately and settle without a bounce.
const ease = 'cubic-bezier(.3, .7, .2, 1)'
function travel(from: DOMRect | undefined, to: DOMRect | undefined) {
  if (!from || !to || !to.height) return null
  return `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.height / to.height})`
}

watch(active, (_next, previous) => {
  if (import.meta.server || reduced() || !previous) return
  snapshot = { previous, line: rect(lineElement.value?.querySelector('span')), tabs: {}, titles: {} }
  for (const [id, element] of Object.entries(tabElements)) {
    if (!element?.isConnected) continue
    snapshot.tabs[id] = element.getBoundingClientRect()
    const title = rect(element.querySelector('.tab-title'))
    if (title) snapshot.titles[id] = title
  }
}, { flush: 'pre' })

onUpdated(() => {
  const before = snapshot
  snapshot = null
  if (!before) return
  try { play(before) } catch (error) { if (import.meta.dev) console.warn('[frame] animation skipped', error) }
})

function play(before: Snapshot) {
  const next = active.value
  const rise = { duration: 520, easing: ease }
  const shift = { duration: 420, easing: ease }
  // 1. The new title rises from its pill into the header line.
  const span = lineElement.value?.querySelector<HTMLElement>('span')
  const up = travel(before.titles[next.id], rect(span))
  if (span && up) span.animate([{ transform: up }, { transform: 'none' }], rise)
  else span?.animate([{ opacity: 0, transform: 'translateY(.4em)' }, { opacity: 1, transform: 'none' }], { duration: 360, easing: ease })
  // 2. The previous title settles down into the bar as a pill.
  const landing = tabElements[before.previous.id]
  const landingTitle = landing?.querySelector<HTMLElement>('.tab-title')
  const down = travel(before.line, rect(landingTitle))
  if (landingTitle && down) {
    landingTitle.animate([{ transform: down }, { transform: 'none' }], rise)
    landing?.querySelector('.tab-bg')?.animate([{ opacity: 0, transform: 'scale(.6)' }, { opacity: 0, offset: .45 }, { opacity: 1, transform: 'none' }], { duration: 520, easing: ease })
  }
  // 3. Every other pill slides to its new spot.
  for (const [id, element] of Object.entries(tabElements)) {
    if (id === before.previous.id || !element?.isConnected || !before.tabs[id]) continue
    const to = element.getBoundingClientRect()
    const dx = before.tabs[id].left - to.left, dy = before.tabs[id].top - to.top
    if (dx || dy) element.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], shift)
  }
  // 4. The page eases in beneath.
  bodyElement.value?.animate([{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 0, transform: 'translateY(14px)', offset: .2 }, { opacity: 1, transform: 'none' }], { duration: 480, easing: ease })
}

onMounted(() => { window.addEventListener('scroll', onScroll, { passive: true }); onScroll() })
onBeforeUnmount(() => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(frame) })
</script>

<template>
  <div class="frame">
    <header class="frame-header" :class="{ 'is-compact': compact }">
      <div class="frame-inner">
        <div class="frame-top">
          <p class="frame-name"><NuxtLink to="/">AbdurRahaman Shah</NuxtLink></p>
          <div class="frame-tools">
            <button type="button" class="tool-button" aria-label="Search this site" aria-haspopup="dialog" @click="openSearch"><Search :size="18" :stroke-width="1.6" aria-hidden="true" /></button>
            <ThemeToggle />
          </div>
        </div>
        <p ref="lineElement" class="frame-line" aria-current="page"><span :key="active.id">{{ active.title }}</span></p>
        <nav class="tabs" aria-label="Sections">
          <NuxtLink v-for="section in tabs" :key="section.id" :ref="element => setTab(section.id, element)" :to="section.path" class="tab"><span class="tab-bg" aria-hidden="true" /><span class="tab-title">{{ section.title }}</span></NuxtLink>
        </nav>
      </div>
    </header>
    <main id="main-content" ref="bodyElement" tabindex="-1" class="frame-body"><slot /></main>
  </div>
</template>

<style scoped>
.frame { font-size: var(--ui-size); }
.frame-header { position: sticky; top: 0; z-index: 20; background: hsl(var(--background) / .9); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); }
.frame-inner { width: min(1120px, 100%); margin-inline: auto; padding: var(--frame-top) var(--frame-x) 1rem; transition: padding 380ms var(--studio-ease); }
.frame-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 1.5rem; }
.frame-name, .frame-line { margin: 0; font-size: 1.9em; line-height: 1.2; font-weight: 400; letter-spacing: -.025em; transition: font-size 380ms var(--studio-ease); }
.frame-name a { color: inherit; }
.frame-line { color: var(--studio-muted); font-weight: 300; }
.frame-line span { display: inline-block; transform-origin: left top; will-change: transform; }
.frame-tools { display: flex; gap: .25rem; flex-shrink: 0; margin-top: -.35rem; }
.tool-button { display: grid; place-items: center; width: 44px; height: 44px; border-radius: 50%; color: var(--studio-muted); transition: color 180ms, background 180ms; }
.tool-button:hover { color: hsl(var(--foreground)); background: hsl(var(--muted)); }

/* The bar of waiting sections. */
.tabs { display: flex; flex-wrap: wrap; gap: .4rem; margin-top: 1.1rem; transition: margin 380ms var(--studio-ease); }
.tab { position: relative; isolation: isolate; display: inline-flex; align-items: center; min-height: 2.5em; padding: 0 1.05em; color: var(--studio-muted); border-radius: 999px; transition: color 200ms; will-change: transform; }
.tab-bg { position: absolute; inset: 0; z-index: -1; border-radius: inherit; background: hsl(var(--foreground) / var(--pill-fill, .05)); transition: background 200ms; }
.tab:hover { color: hsl(var(--foreground)); }
.tab:hover .tab-bg { background: hsl(var(--foreground) / var(--pill-fill-hover, .09)); }
.tab:active { transform: scale(.97); }
.tab-title { display: inline-block; font-size: .9em; font-weight: 400; letter-spacing: -.01em; transform-origin: left top; will-change: transform; }
:global(.dark) .frame { --pill-fill: .09; --pill-fill-hover: .14; }

/* Folded header once the reader scrolls into the page. */
.is-compact .frame-inner { padding-top: .8rem; padding-bottom: .7rem; }
.is-compact .frame-name, .is-compact .frame-line { font-size: 1.15em; }
.is-compact .frame-tools { margin-top: -.55rem; }
.is-compact .tabs { margin-top: .55rem; }
.is-compact .tab { min-height: 2.1em; }

.frame-body { width: min(1120px, 100%); margin-inline: auto; padding: clamp(1.25rem, 3vh, 2rem) var(--frame-x) 2rem; outline: none; }

@media (max-width: 600px) {
  .frame-name, .frame-line { font-size: 1.55em; }
  .tabs { flex-wrap: nowrap; overflow-x: auto; scrollbar-width: none; margin-inline: calc(-1 * var(--frame-x)); padding-inline: var(--frame-x); scroll-padding-inline: var(--frame-x); }
  .tabs::-webkit-scrollbar { display: none; }
  .tab { flex-shrink: 0; }
  .is-compact .frame-name, .is-compact .frame-line { font-size: 1.1em; }
}
@media (prefers-reduced-motion: reduce) { .frame-inner, .frame-name, .frame-line, .tabs, .tab { transition: none; } }
</style>
