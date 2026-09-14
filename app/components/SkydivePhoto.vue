<script setup lang="ts">
const taps = ref(0)
const surface = ref<HTMLButtonElement | null>(null)
const water = ref<HTMLCanvasElement | null>(null)
const { drop, active, setup } = useWaterRipple(water, '/images/me-1024.webp')
const hint = computed(() => taps.value ? `${5 - taps.value} more ${taps.value === 4 ? 'tap' : 'taps'} to discover something hidden.` : '')
let resetTimer: ReturnType<typeof setTimeout> | undefined
function reset() { taps.value = 0 }

// A tap is a drop on water: the picture ripples out from the point of contact, and it grows a little
// with every tap, then eases back once the taps stop.
function discover(event: MouseEvent) {
  if (resetTimer) clearTimeout(resetTimer)
  taps.value++
  const host = surface.value
  if (host && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const bounds = host.getBoundingClientRect()
    const fromKeyboard = event.detail === 0
    drop(fromKeyboard ? .5 : (event.clientX - bounds.left) / bounds.width, fromKeyboard ? .5 : (event.clientY - bounds.top) / bounds.height)
  }
  if (taps.value === 5) {
    // Keep navigation within the activation event so browsers allow the new tab.
    window.open('https://youtu.be/DK1E-9Fj7RE', '_blank', 'noopener,noreferrer')
    reset()
    return
  }
  resetTimer = setTimeout(reset, 8000)
}
// Warm the surface on the first hover so the first drop responds at once.
function warm() { if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) setup() }
onBeforeUnmount(() => { if (resetTimer) clearTimeout(resetTimer) })
</script>

<template>
  <button ref="surface" type="button" class="skydive-photo" :class="{ 'is-rippling': active }" aria-label="Skydiving photo" :style="{ '--photo-scale': 1 + taps * .025 }" @click="discover" @pointerenter="warm">
    <img src="/images/me-640.webp" srcset="/images/me-640.webp 640w, /images/me-1024.webp 1024w" sizes="(min-width: 1200px) 450px, (min-width: 761px) 40vw, (min-width: 481px) 350px, 280px" width="2569" height="1552" fetchpriority="high" decoding="async" alt="AbdurRahaman Shah skydiving above the coast" class="aspect-[2569/1552] w-full object-cover" />
    <canvas ref="water" class="water" aria-hidden="true" />
  </button>
  <span class="sr-only" role="status">{{ hint }}</span>
</template>

<style scoped>
.skydive-photo { position:relative; display:block; width:100%; border-radius:1rem; overflow:hidden; isolation:isolate; transform:translateY(var(--lift, 0px)) scale(var(--photo-scale, 1)); transform-origin:center; transition:transform 700ms cubic-bezier(.2,.8,.2,1), box-shadow 700ms cubic-bezier(.2,.8,.2,1); touch-action:manipulation; -webkit-tap-highlight-color:transparent; box-shadow:0 .6rem 1.6rem hsl(var(--foreground) / .12); }
.skydive-photo:focus-visible { outline:2px solid hsl(var(--foreground)); outline-offset:5px; }
.skydive-photo img { display:block; border-radius:inherit; user-select:none; -webkit-user-drag:none; }
/* The water surface sits over the photo and only shows while waves are moving; it draws the same picture, so the hand-off is invisible. */
.water { position:absolute; inset:0; width:100%; height:100%; border-radius:inherit; opacity:0; pointer-events:none; transition:opacity 260ms ease; }
.is-rippling .water { opacity:1; transition-duration:60ms; }
@media (hover:hover) and (pointer:fine) {
  .skydive-photo:hover { --lift:-.3rem; box-shadow:0 1.2rem 2.4rem hsl(var(--foreground) / .18); }
}
@media(prefers-reduced-motion:reduce) { .skydive-photo, .skydive-photo img { transform:none; transition:none; } .water { display:none; } }
</style>
