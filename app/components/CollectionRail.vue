<script setup lang="ts">
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-vue-next'

const rail = ref<HTMLDivElement | null>(null)
const active = ref(0)
const dragging = ref(false)
let start: { x: number, y: number, scroll: number, id: number } | null = null
let suppressClick = false
let clickTimer: ReturnType<typeof setTimeout> | undefined
let observer: ResizeObserver | undefined

function updatePosition() {
  const el = rail.value
  if (!el) return
  const children = Array.from(el.children) as HTMLElement[]
  const origin = children[0]?.offsetLeft || 0
  let nearest = 0
  children.forEach((child, index) => {
    if (Math.abs(child.offsetLeft - origin - el.scrollLeft) < Math.abs((children[nearest]?.offsetLeft || 0) - origin - el.scrollLeft)) nearest = index
  })
  active.value = nearest
}
function goTo(index: number) {
  const el = rail.value
  const child = el?.children[index] as HTMLElement | undefined
  const first = el?.children[0] as HTMLElement | undefined
  if (!el || !child || !first) return
  el.scrollTo({ left: child.offsetLeft - first.offsetLeft, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
}
function onKey(event: KeyboardEvent) {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
  event.preventDefault()
  const index = event.key === 'Home' ? 0 : event.key === 'End' ? 2 : Math.max(0, Math.min(2, active.value + (event.key === 'ArrowRight' ? 1 : -1)))
  goTo(index)
  ;(rail.value?.children[index]?.querySelector('a, button') as HTMLElement | null)?.focus({ preventScroll: true })
}
function pointerDown(event: PointerEvent) {
  // Let the browser handle momentum, direction locking, and pinch zoom on touch.
  if (event.pointerType !== 'mouse' || event.button !== 0 || !rail.value) return
  suppressClick = false
  start = { x: event.clientX, y: event.clientY, scroll: rail.value.scrollLeft, id: event.pointerId }
}
function pointerMove(event: PointerEvent) {
  if (!start || start.id !== event.pointerId || !rail.value) return
  const delta = event.clientX - start.x
  if (!dragging.value && Math.abs(delta) > 7 && Math.abs(delta) > Math.abs(event.clientY - start.y)) {
    dragging.value = true
    suppressClick = true
    rail.value.setPointerCapture(event.pointerId)
  }
  if (dragging.value) rail.value.scrollLeft = start.scroll - delta
}
function pointerEnd() {
  const id = start?.id
  start = null
  if (id !== undefined && rail.value?.hasPointerCapture(id)) rail.value.releasePointerCapture(id)
  const wasDragging = dragging.value
  dragging.value = false
  if (wasDragging) {
    updatePosition()
    nextTick(() => goTo(active.value))
    clearTimeout(clickTimer)
    clickTimer = setTimeout(() => { suppressClick = false }, 0)
  }
}
function onClick(event: MouseEvent) {
  if (!suppressClick || event.detail === 0) return
  event.preventDefault()
  event.stopPropagation()
  suppressClick = false
}
onMounted(() => {
  observer = new ResizeObserver(updatePosition)
  if (rail.value) observer.observe(rail.value)
})
onBeforeUnmount(() => { observer?.disconnect(); clearTimeout(clickTimer) })
</script>

<template>
  <section class="collection-rail" aria-label="A few things from my world">
    <div ref="rail" class="rail-track" :class="{ 'is-dragging': dragging }" tabindex="0" role="region" aria-label="Photos, books, and writing. Swipe or use the arrow keys to explore." data-cursor="drag" @scroll.passive="updatePosition" @keydown="onKey" @pointerdown="pointerDown" @pointermove="pointerMove" @pointerup="pointerEnd" @pointercancel="pointerEnd" @lostpointercapture="pointerEnd" @click.capture="onClick" @dragstart.prevent>
      <article class="rail-item">
        <div class="rail-object photo-object"><SkydivePhoto /></div>
        <NuxtLink to="/gallery" class="object-caption"><span><strong>Out in the world</strong><small>Photographs & little adventures</small></span><ArrowUpRight :size="17" aria-hidden="true" /></NuxtLink>
      </article>
      <article class="rail-item">
        <NuxtLink to="/books" class="rail-object books-object" aria-label="Explore my bookshelf">
          <img v-for="(book, index) in [{ image: 'sealed-nectar', title: 'The Sealed Nectar' }, { image: 'steve-jobs', title: 'Steve Jobs' }, { image: 'wings-of-fire', title: 'Wings of Fire' }]" :key="book.image" :style="{ '--book-index': index }" :src="`/images/books/${book.image}.jpg`" :alt="book.title" width="180" height="270" draggable="false" />
        </NuxtLink>
        <NuxtLink to="/books" class="object-caption"><span><strong>On my bookshelf</strong><small>Books that shaped my thinking</small></span><ArrowUpRight :size="17" aria-hidden="true" /></NuxtLink>
      </article>
      <article class="rail-item">
        <NuxtLink to="/articles" class="rail-object writing-object" aria-label="Explore my writing"><div class="writing-paper"><span class="paper-byline">Notes by AbdurRahaman Shah</span><span class="paper-title">Ideas, code,<br />and everything<br /><i>in between.</i></span><span class="paper-bottom">Essays on making things <ArrowUpRight :size="18" aria-hidden="true" /></span></div></NuxtLink>
        <NuxtLink to="/articles" class="object-caption"><span><strong>Thinking out loud</strong><small>Engineering, design & AI</small></span><ArrowUpRight :size="17" aria-hidden="true" /></NuxtLink>
      </article>
    </div>
    <div class="rail-controls"><span class="rail-hint">A few things from my world</span><div class="rail-paging"><span class="rail-position" aria-live="polite" aria-atomic="true">{{ String(active + 1).padStart(2, '0') }} <span>/ 03</span></span><button type="button" aria-label="Previous collection" :disabled="active === 0" @click="goTo(active - 1)"><ArrowLeft :size="18" aria-hidden="true" /></button><button type="button" aria-label="Next collection" :disabled="active === 2" @click="goTo(active + 1)"><ArrowRight :size="18" aria-hidden="true" /></button></div></div>
  </section>
</template>

<style scoped>
.collection-rail { --object-width: min(560px, 68vw); margin-block: 3.5rem 5rem; }
.rail-track { position: relative; display: flex; gap: clamp(3rem, 7vw, 7rem); overflow-x: auto; overscroll-behavior-x: contain; scroll-snap-type: x mandatory; scrollbar-width: none; padding: 1.5rem var(--page-gutter) 1rem; scroll-padding-inline: var(--page-gutter); cursor: grab; }
.rail-track::-webkit-scrollbar { display: none; }
.rail-track::after { content: ''; flex: 0 0 max(0px, calc(100vw - var(--object-width) - 2 * var(--page-gutter) - clamp(3rem, 7vw, 7rem))); }
.rail-track.is-dragging { scroll-snap-type: none; cursor: grabbing; user-select: none; }
.rail-item { flex: 0 0 var(--object-width); min-width: 0; scroll-snap-align: start; }
.rail-object { height: 350px; display: flex; align-items: center; justify-content: center; }
.photo-object :deep(.skydive-photo) { border-radius: 3px; overflow: hidden; box-shadow: 0 12px 22px #0000000b; }
.books-object { gap: 22px; padding: 25px 15px; perspective: 1000px; }
.books-object img { width: auto; max-width: 28%; height: auto; max-height: 255px; object-fit: contain; transform: rotateY(-12deg) rotate(calc((var(--book-index) - 1) * 3deg)); box-shadow: 5px 4px 0 #d4d1cb, 8px 7px 0 #ece9e3, 10px 12px 20px #0002; transition: transform 400ms var(--studio-ease); }
.writing-paper { width: 80%; height: 320px; display: flex; flex-direction: column; padding: 25px 30px; color: #282725; background: #f6f4ed; border: 1px solid #e9e6dc; box-shadow: 2px 3px 0 #e9e6dc, 5px 6px 0 #faf9f5, 8px 12px 18px #0000000b; transform: rotate(-3deg); transition: transform 400ms var(--studio-ease); }
.paper-byline { font-size: 9px; }
.paper-title { margin: auto 0; font: 34px/1.17 var(--font-serif); letter-spacing: -.04em; }
.paper-bottom { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #dcd8ce; padding-top: 14px; font-size: 10px; }
.object-caption { display: flex; justify-content: space-between; align-items: center; gap: 1rem; padding: 20px 0 10px; }
.object-caption strong { display: block; font-size: 14px; font-weight: 500; }
.object-caption small { display: block; margin-top: 5px; color: var(--studio-muted); font-size: 12px; }
.object-caption svg { color: var(--studio-muted); }
.rail-controls { display: flex; align-items: center; justify-content: space-between; margin: 15px var(--page-gutter) 0; }
.rail-hint, .rail-position { color: var(--studio-muted); font-size: 11px; }
.rail-paging { display: flex; align-items: center; gap: 4px; }
.rail-position { margin-right: 18px; font-variant-numeric: tabular-nums; color: hsl(var(--foreground)); }
.rail-position span { margin-left: 7px; color: var(--studio-muted); }
.rail-paging button { width: 44px; height: 44px; display: grid; place-items: center; border-radius: 50%; }
.rail-paging button:disabled { opacity: .25; }
.rail-paging button:not(:disabled):hover { background: hsl(var(--muted)); }
@media (hover: hover) and (pointer: fine) { .books-object:hover img { transform: translateY(-8px) rotateY(-5deg) rotate(calc((var(--book-index) - 1) * 5deg)); } .writing-object:hover .writing-paper { transform: rotate(0deg) translateY(-4px); } }
@media (max-width: 640px) {
  .collection-rail { --object-width: 82vw; margin-block: 2rem 3.5rem; }
  .rail-track { gap: 28px; }
  .rail-track::after { flex-basis: max(0px, calc(100vw - var(--object-width) - 2 * var(--page-gutter) - 28px)); }
  .rail-object { height: 245px; }
  .books-object { gap: 12px; padding: 20px 10px; }
  .books-object img { max-height: 190px; }
  .writing-paper { height: 225px; padding: 18px 22px; }
  .paper-title { font-size: 26px; }
  .paper-byline { font-size: 7px; }
  .paper-bottom { font-size: 8px; }
  .object-caption { padding-top: 14px; }
  .object-caption strong { font-size: 13px; }
  .object-caption small { font-size: 11px; }
  .rail-hint { max-width: 145px; line-height: 1.6; }
  .rail-controls { margin-top: 4px; }
}
@media (prefers-reduced-motion: reduce) { .books-object:hover img { transform: rotateY(-12deg) rotate(calc((var(--book-index) - 1) * 3deg)); } .writing-object:hover .writing-paper { transform: rotate(-3deg); } }
</style>
