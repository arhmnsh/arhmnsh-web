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
    // A small breath: a soft press, a gentle lift with a hint of tilt, and an easy settle.
    const angle = .35 + taps.value * .15
    wobble = photo.value.animate([
      { transform: 'scale(1) rotate(0deg)', easing: 'cubic-bezier(.4, 0, .6, 1)' },
      { transform: 'scale(.985) rotate(0deg)', offset: .22, easing: 'cubic-bezier(.2, .7, .3, 1)' },
      { transform: `scale(1.012) rotate(${-angle}deg)`, offset: .6, easing: 'cubic-bezier(.4, 0, .2, 1)' },
      { transform: 'scale(1) rotate(0deg)' }
    ], { duration: 900 })
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
    <img ref="photo" src="/images/me-640.webp" srcset="/images/me-640.webp 640w, /images/me-1024.webp 1024w" sizes="(min-width: 1200px) 450px, (min-width: 761px) 40vw, (min-width: 481px) 350px, 280px" width="2576" height="1552" fetchpriority="high" decoding="async" alt="AbdurRahaman Shah skydiving above the coast" class="aspect-[2576/1552] w-full object-cover" />
  </button>
  <span class="sr-only" role="status">{{ hint }}</span>
</template>

<style scoped>
.skydive-photo { display:block; width:100%; border-radius:1rem; overflow:hidden; transform:scale(var(--photo-scale)); transform-origin:center; transition:transform 500ms cubic-bezier(.2,.8,.2,1), box-shadow 500ms cubic-bezier(.2,.8,.2,1); touch-action:manipulation; -webkit-tap-highlight-color:transparent; box-shadow:0 .6rem 1.6rem hsl(var(--foreground) / .12), 0 0 0 var(--hint-strength) hsl(var(--foreground) / .06); }
.skydive-photo:focus-visible { outline:2px solid hsl(var(--foreground)); outline-offset:5px; }
.skydive-photo img { display:block; border-radius:inherit; user-select:none; -webkit-user-drag:none; transition:transform 900ms cubic-bezier(.2,.8,.2,1); }
@media (hover:hover) and (pointer:fine) {
  .skydive-photo:hover { transform:translateY(-.35rem) rotate(-1deg) scale(calc(var(--photo-scale) * 1.01)); box-shadow:0 1.2rem 2.4rem hsl(var(--foreground) / .18), 0 0 0 var(--hint-strength) hsl(var(--foreground) / .06); }
  .skydive-photo:hover img { transform:scale(1.04); }
}
@media(prefers-reduced-motion:reduce) { .skydive-photo, .skydive-photo img { transform:none; transition:none; } }
</style>
