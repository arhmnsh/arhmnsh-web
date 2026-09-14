<script setup lang="ts">
const taps = ref(0)
const surface = ref<HTMLButtonElement | null>(null)
const photo = ref<HTMLImageElement | null>(null)
const hint = computed(() => taps.value ? `${5 - taps.value} more ${taps.value === 4 ? 'tap' : 'taps'} to discover something hidden.` : '')
let resetTimer: ReturnType<typeof setTimeout> | undefined
let live: Animation[] = []
function reset() { taps.value = 0 }

// A tap lands on the photo like a drop on water: rings spread from the point of contact and fade as
// they widen, while the picture itself stays still apart from a faint brightening under the drop.
function ripple(event: MouseEvent) {
  const host = surface.value
  if (!host || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const bounds = host.getBoundingClientRect()
  const fromKeyboard = event.detail === 0
  const x = fromKeyboard ? bounds.width / 2 : event.clientX - bounds.left
  const y = fromKeyboard ? bounds.height / 2 : event.clientY - bounds.top
  const reach = 2 * Math.hypot(Math.max(x, bounds.width - x), Math.max(y, bounds.height - y))
  live = live.filter(animation => animation.playState === 'running')
  if (live.length > 9) return
  for (let ring = 0; ring < 3; ring++) {
    const element = document.createElement('span')
    element.className = 'ring'
    element.style.left = `${x}px`
    element.style.top = `${y}px`
    host.appendChild(element)
    const animation = element.animate([
      { width: '0px', height: '0px', opacity: 0, offset: 0 },
      { opacity: .85 - ring * .2, offset: .12 },
      { width: `${reach}px`, height: `${reach}px`, opacity: 0 }
    ], { duration: 1400 + ring * 200, delay: ring * 140, easing: 'cubic-bezier(.1, .55, .25, 1)', fill: 'forwards' })
    animation.finished.then(() => element.remove()).catch(() => element.remove())
    live.push(animation)
  }
  photo.value?.animate([{ filter: 'brightness(1)' }, { filter: 'brightness(1.05)', offset: .18 }, { filter: 'brightness(1)' }], { duration: 1100, easing: 'ease-out' })
}
function discover(event: MouseEvent) {
  if (resetTimer) clearTimeout(resetTimer)
  taps.value++
  ripple(event)
  if (taps.value === 5) {
    // Keep navigation within the activation event so browsers allow the new tab.
    window.open('https://youtu.be/DK1E-9Fj7RE', '_blank', 'noopener,noreferrer')
    reset()
    return
  }
  resetTimer = setTimeout(reset, 8000)
}
onBeforeUnmount(() => { live.forEach(animation => animation.cancel()); if (resetTimer) clearTimeout(resetTimer) })
</script>

<template>
  <button ref="surface" type="button" class="skydive-photo" aria-label="Skydiving photo" :style="{ '--hint-strength': taps * 2 + 'px' }" @click="discover">
    <img ref="photo" src="/images/me-640.webp" srcset="/images/me-640.webp 640w, /images/me-1024.webp 1024w" sizes="(min-width: 1200px) 450px, (min-width: 761px) 40vw, (min-width: 481px) 350px, 280px" width="2576" height="1552" fetchpriority="high" decoding="async" alt="AbdurRahaman Shah skydiving above the coast" class="aspect-[2576/1552] w-full object-cover" />
  </button>
  <span class="sr-only" role="status">{{ hint }}</span>
</template>

<style scoped>
.skydive-photo { position:relative; display:block; width:100%; border-radius:1rem; overflow:hidden; isolation:isolate; transition:transform 600ms cubic-bezier(.2,.8,.2,1), box-shadow 600ms cubic-bezier(.2,.8,.2,1); touch-action:manipulation; -webkit-tap-highlight-color:transparent; box-shadow:0 .6rem 1.6rem hsl(var(--foreground) / .12), 0 0 0 var(--hint-strength) hsl(var(--foreground) / .06); }
.skydive-photo:focus-visible { outline:2px solid hsl(var(--foreground)); outline-offset:5px; }
.skydive-photo img { display:block; border-radius:inherit; user-select:none; -webkit-user-drag:none; transition:transform 1200ms cubic-bezier(.2,.8,.2,1); }
/* Water rings: a thin bright crest with a soft trough behind it. */
.skydive-photo :deep(.ring) { position:absolute; z-index:1; width:0; height:0; border-radius:50%; transform:translate(-50%,-50%); pointer-events:none; box-shadow:0 0 0 1.5px rgb(255 255 255 / .85), 0 0 0 3px rgb(0 0 0 / .1), 0 0 12px 4px rgb(255 255 255 / .12), inset 0 0 0 1px rgb(0 0 0 / .08), inset 0 0 22px rgb(255 255 255 / .28); }
@media (hover:hover) and (pointer:fine) {
  .skydive-photo:hover { transform:translateY(-.3rem); box-shadow:0 1.2rem 2.4rem hsl(var(--foreground) / .18), 0 0 0 var(--hint-strength) hsl(var(--foreground) / .06); }
  .skydive-photo:hover img { transform:scale(1.03); }
}
@media(prefers-reduced-motion:reduce) { .skydive-photo, .skydive-photo img { transform:none; transition:none; } }
</style>
