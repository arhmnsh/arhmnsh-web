<script setup lang="ts">
import { bookAppearance, type ShelfBook } from '~/utils/bookAppearance'
const props = defineProps<{ book: ShelfBook, index: number }>()
defineEmits<{ select: [] }>()
const appearance = computed(() => bookAppearance(props.book.id))
const tilt = ref({ x: 0, y: 0 })
let pointerFrame = 0
onBeforeUnmount(() => cancelAnimationFrame(pointerFrame))
function resetTilt() {
  cancelAnimationFrame(pointerFrame)
  tilt.value = { x: 0, y: 0 }
}
function followPointer(event: PointerEvent) {
  if (event.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const element = event.currentTarget as HTMLElement
  const { clientX, clientY } = event
  cancelAnimationFrame(pointerFrame)
  pointerFrame = requestAnimationFrame(() => {
    const bounds = element.getBoundingClientRect()
    tilt.value = { x: (clientX - bounds.left) / bounds.width - .5, y: (clientY - bounds.top) / bounds.height - .5 }
  })
}
</script>

<template>
  <button :id="`book-${book.id}`" type="button" class="shelf-volume" :aria-label="`Read notes on ${book.title} by ${book.author}`" aria-haspopup="dialog"
    :style="{ '--book-height': `${appearance.height}%`, '--lean': `${appearance.lean}deg`, '--pointer-x': tilt.x, '--pointer-y': tilt.y, '--arrival': `${Math.min(index, 7) * 55}ms` }"
    @pointermove="followPointer" @pointerleave="resetTilt" @blur="resetTilt" @click="$emit('select')">
    <span class="volume-stage">
      <span class="volume-shadow" />
      <span class="volume-model"><BookObject :book="book" /></span>
    </span>
    <span class="volume-caption" aria-hidden="true">
      <span class="volume-title">{{ book.title }}</span>
      <span class="volume-author">{{ book.author }}</span>
    </span>
  </button>
</template>

<style scoped>
.shelf-volume { display: block; width: 100%; min-width: 0; align-self: start; text-align: left; border: 0; background: none; padding: 0; cursor: pointer; -webkit-tap-highlight-color: transparent; }
.volume-stage { position: relative; display: flex; justify-content: center; align-items: flex-end; height: var(--shelf-height); padding: 18px 20px 25px; perspective: 1200px; isolation: isolate; }
.volume-model { position: relative; display: block; width: min(calc(var(--book-height) * .85), 156px); height: auto; aspect-ratio: 2 / 3; transform-style: preserve-3d; transform: rotateX(3deg) rotateY(-22deg) rotateZ(var(--lean)); transition: transform 450ms cubic-bezier(.18,.8,.24,1); animation: volume-arrive 600ms both; animation-delay: var(--arrival); }
.volume-shadow { position: absolute; bottom: 19px; width: 65%; height: 22px; border-radius: 50%; background: #332618; filter: blur(9px); opacity: .26; transform: skewX(-20deg); transition: opacity 650ms,transform 650ms; }
.shelf-volume:not(.book-away):not(.book-resting):hover .volume-model,.shelf-volume:not(.book-away):not(.book-resting):focus-visible .volume-model { transform: translateY(-13px) rotateX(calc(5deg - var(--pointer-y) * 9deg)) rotateY(calc(-31deg + var(--pointer-x) * 14deg)) rotateZ(-1deg); }
.shelf-volume:not(.book-away):not(.book-resting):hover .volume-shadow { opacity: .16; transform: translateY(4px) scale(.9); }
.shelf-volume:not(.book-away):not(.book-resting):hover :deep(.front-board),.shelf-volume:not(.book-away):not(.book-resting):focus-visible :deep(.front-board) { transform: translateZ(calc(var(--depth) / 2)) rotateY(-9deg); }
.volume-caption { display: grid; grid-template-columns: 1fr; gap: 0; padding: 3px 6px 0; text-align: center; }
.volume-number { display:none; padding-top: 3px; color: var(--library-faint); font: 10px var(--font-mono); }
.volume-title { font: 500 12px/1.4 var(--font-sans); display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; color: var(--library-ink); }
.volume-author { display: block; margin-top: 5px; font-size: 11px; line-height: 1.55; color: var(--library-muted); }
.shelf-volume:focus { outline:none; }
.shelf-volume:focus-visible { outline:2px solid var(--studio-accent); outline-offset:0; border-radius:10px; }
:global(.dark .volume-shadow) { opacity: .6; background: #000; }
@keyframes volume-arrive { from { opacity: 0; translate: 0 14px; } to { opacity: 1; translate: 0 0; } }
@media(max-width:700px) { .volume-stage { height: 220px; padding: 15px 8px 24px; } .volume-model { width: min(calc(var(--book-height) * .9), 120px); } .volume-caption { grid-template-columns: 1fr; gap: 0; padding-top: 3px; } .volume-title { font-size: 12px; } .volume-stage::after { left: -12px; right: -12px; } }
@media(prefers-reduced-motion:reduce) { .volume-model { animation: none; transition: none; } .shelf-volume:not(.book-away):not(.book-resting):hover .volume-model,.shelf-volume:not(.book-away):not(.book-resting):focus-visible .volume-model { transform: rotateY(-22deg); } .volume-shadow { transition: none; } .shelf-volume:not(.book-away):not(.book-resting):hover :deep(.front-board),.shelf-volume:not(.book-away):not(.book-resting):focus-visible :deep(.front-board) { transform: translateZ(calc(var(--depth) / 2)); } }
</style>
