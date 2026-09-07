<script setup lang="ts">
import { bookAppearance, type ShelfBook } from '~/utils/bookAppearance'
const props = defineProps<{ book: ShelfBook }>()
const appearance = computed(() => bookAppearance(props.book.id))
</script>

<template>
  <span class="bound-book" :style="{ '--depth': `${appearance.depth}px`, '--binding': appearance.color }" aria-hidden="true">
    <span class="back-board" />
    <span class="paper-block">
      <span class="paper-edge paper-edge--fore" />
      <span class="paper-edge paper-edge--top" />
      <span class="paper-edge paper-edge--bottom" />
    </span>
    <span class="binding-spine"><span>{{ book.title }}</span><i /></span>
    <span class="front-board">
      <BookCover :src="book.cover" />
    </span>
  </span>
</template>

<style scoped>
.bound-book { position: relative; display: block; width: 100%; height: 100%; transform-style: preserve-3d; }
.front-board, .back-board { position: absolute; inset: 0; border-radius: 2px 5px 5px 2px; transform-style: preserve-3d; }
.front-board { transform-origin: 0 50%; transform: translateZ(calc(var(--depth) / 2)); transition: transform 700ms cubic-bezier(.2,.75,.2,1); background: var(--binding); box-shadow: inset 0 0 0 1px #fff2; }
.front-board::after { content: ''; position: absolute; inset: 0; background: #d9d0b9; border: 5px solid var(--binding); border-radius: inherit; transform: rotateY(180deg) translateZ(1px); backface-visibility: hidden; }
.back-board { transform: translateZ(calc(var(--depth) / -2)); background: var(--binding); box-shadow: 1px 0 0 #15110f, 2px 2px 3px #0004; }
.paper-block { position: absolute; inset: 3px 3px 3px 2px; transform-style: preserve-3d; background: #eae2d2; transform: translateZ(calc(var(--depth) / 2 - 3px)); box-shadow: inset 6px 0 8px #0002; }
.paper-edge { position: absolute; display: block; backface-visibility: hidden; }
.paper-edge--fore { right: calc(6px - var(--depth)); top: 0; height: 100%; width: calc(var(--depth) - 6px); transform-origin: left center; transform: rotateY(90deg); background: linear-gradient(0deg,#998a71aa,transparent 4%,transparent 95%,#fff6),repeating-linear-gradient(90deg,#ded6c3 0px,#fcf8e9 .7px,#b8ad9620 1.2px,#e8dfce 1.8px); }
.paper-edge--top,.paper-edge--bottom { left: 0; width: 100%; height: calc(var(--depth) - 6px); background: repeating-linear-gradient(0deg,#d8cfbc 0px,#f3eddd 1px,#c5baa380 1.5px,#f5efdf 2px); }
.paper-edge--top { top: 0; transform-origin: top; transform: rotateX(-90deg); }
.paper-edge--bottom { bottom: 0; transform-origin: bottom; transform: rotateX(90deg); filter: brightness(.76); }
.binding-spine { position: absolute; left: 0; top: 0; width: var(--depth); height: 100%; transform-origin: left; transform: translateZ(calc(var(--depth) / -2)) rotateY(-90deg); background: linear-gradient(90deg,#0007,transparent 20%,#fff2 48%,#0005),var(--binding); border-radius: 3px; box-shadow: inset 0 0 0 1px #ffffff15; display: flex; align-items: center; justify-content: center; }
.binding-spine span { writing-mode: vertical-rl; color: #e6dcc3; font: 600 8px Georgia,serif; letter-spacing: .06em; max-height: 78%; overflow: hidden; }
.binding-spine i { position: absolute; bottom: 8px; width: 55%; height: 1px; background: #c0ab76; box-shadow: 0 -3px #c0ab7666; }
@media(prefers-reduced-motion:reduce) { .front-board { transition: none; } }
</style>
