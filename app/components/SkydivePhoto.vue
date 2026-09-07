<script setup lang="ts">
const taps = ref(0)
const photo = ref<HTMLImageElement | null>(null)
let wobble: Animation | undefined
const hint = computed(() => taps.value ? `${5 - taps.value} more ${taps.value === 4 ? 'tap' : 'taps'} to discover something hidden.` : '')
let resetTimer: ReturnType<typeof setTimeout> | undefined
function reset() { taps.value = 0 }
function discover() {
  if (resetTimer) clearTimeout(resetTimer)
  taps.value++
  if (photo.value && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    wobble?.cancel()
    const angle = 1 + taps.value * .45
    wobble = photo.value.animate([
      { transform:'rotate(0deg)' },
      { transform:`rotate(${-angle}deg)`, offset:.2 },
      { transform:`rotate(${angle}deg)`, offset:.45 },
      { transform:`rotate(${-angle * .4}deg)`, offset:.7 },
      { transform:'rotate(0deg)' }
    ], { duration:440, easing:'ease-out' })
  }
  if (taps.value === 5) {
    // Keep navigation within the activation event so browsers allow the new tab.
    window.open('https://youtu.be/DK1E-9Fj7RE', '_blank', 'noopener,noreferrer')
    reset()
    return
  }
  resetTimer = setTimeout(reset, 8000)
}
onBeforeUnmount(() => { wobble?.cancel(); if (resetTimer) clearTimeout(resetTimer) })
</script>

<template>
  <button type="button" class="skydive-photo" aria-label="Skydiving photo" :style="{ '--photo-scale': 1 + taps * .02, '--hint-strength': taps * 2 + 'px' }" @click="discover">
    <img ref="photo" src="/images/me-640.webp" srcset="/images/me-640.webp 640w, /images/me-1024.webp 1024w" sizes="(min-width: 1280px) 380px, (min-width: 1024px) 700px, (min-width: 640px) 576px, calc(100vw - 48px)" width="2576" height="1552" fetchpriority="high" decoding="async" alt="AbdurRahaman Shah skydiving above the coast" class="aspect-[2576/1552] w-full rounded-xl object-cover" />
  </button>
  <span class="sr-only" role="status">{{ hint }}</span>
</template>

<style scoped>
.skydive-photo { display:block; width:100%; border-radius:.75rem; transform:scale(var(--photo-scale)); transform-origin:center; transition:transform 300ms cubic-bezier(.2,.8,.25,1),box-shadow 300ms; touch-action:manipulation; -webkit-tap-highlight-color:transparent; box-shadow:0 0 0 var(--hint-strength) hsl(var(--foreground) / .06); }
.skydive-photo:focus-visible { outline:2px solid hsl(var(--foreground)); outline-offset:5px; }
.skydive-photo img { display:block; user-select:none; -webkit-user-drag:none; }
@media(prefers-reduced-motion:reduce) { .skydive-photo { transform:none; transition:none; } }
</style>
