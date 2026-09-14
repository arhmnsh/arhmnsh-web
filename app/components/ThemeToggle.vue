<script setup lang="ts">
/**
 * Sun by day, moon by night. Tapping gives the button a small squish while the icon reshapes
 * itself: the rays draw in and the moon takes a bite out of the disc, or the bite lets go and the
 * rays return. Around it the page follows with one quiet view transition: the new theme spreads
 * out from the button as a soft circle, with no flashing or flicker anywhere. Browsers without
 * view transitions, and people who prefer reduced motion, get the plain switch.
 */
const colorMode = useColorMode()
const button = ref<HTMLButtonElement | null>(null)
const maskId = useId()
const squishing = ref(false)
const isDark = computed(() => colorMode.value === 'dark')
const RAYS = Array.from({ length: 8 }, (_, index) => index)
const STARS = [{ x: 5.2, y: 6.4, r: .95, i: 0 }, { x: 8.6, y: 3.6, r: .65, i: 1 }, { x: 3.6, y: 10.6, r: .55, i: 2 }]

type Transitioning = Document & { startViewTransition?: (update: () => Promise<void> | void) => { ready: Promise<void>, finished: Promise<void> } }

async function toggleTheme() {
  const next = isDark.value ? 'light' : 'dark'
  const root = document.documentElement
  const doc = document as Transitioning
  const rect = button.value?.getBoundingClientRect()
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  squishing.value = false
  await nextTick()
  squishing.value = true
  if (reduced || !rect || !doc.startViewTransition) { colorMode.preference = next; return }
  // The new theme spreads from the button, so the circle must reach the farthest corner from it. The
  // snapshot is addressed in percentages of its own box: pixel values drift when the page is rendered
  // scaled, as in device emulation, while percentages land on the switch in every case. A percentage
  // radius is resolved against the box's diagonal over the square root of two.
  const width = window.innerWidth, height = window.innerHeight
  const x = rect.left + rect.width / 2, y = rect.top + rect.height / 2
  const reach = Math.hypot(Math.max(x, width - x), Math.max(y, height - y))
  const at = `${(x / width * 100).toFixed(3)}% ${(y / height * 100).toFixed(3)}%`
  const radius = (reach / (Math.hypot(width, height) / Math.SQRT2) * 100).toFixed(3)
  const transition = doc.startViewTransition(async () => { colorMode.preference = next; await nextTick() })
  transition.ready.then(() => {
    root.animate(
      [{ clipPath: `circle(0% at ${at})` }, { clipPath: `circle(${radius}% at ${at})` }],
      { duration: 760, easing: 'cubic-bezier(.3, .7, .2, 1)', pseudoElement: '::view-transition-new(root)' }
    )
  }).catch(() => {}) // A hidden tab skips the transition; the theme still switches, quietly.
  await transition.finished.catch(() => {})
}
</script>
<template>
  <ClientOnly>
    <button ref="button" type="button" class="theme-toggle" data-cursor="ring" :class="{ 'is-dark': isDark, 'is-squishing': squishing }" :aria-label="isDark ? 'Switch to light theme' : 'Switch to dark theme'" @click="toggleTheme" @animationend="squishing = false">
      <svg class="sky" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <mask :id="maskId" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
          <rect width="24" height="24" fill="#fff" />
          <circle class="bite" cx="12" cy="12" r="5.6" fill="#000" />
        </mask>
        <g class="rays" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round">
          <line v-for="ray in RAYS" :key="ray" x1="12" y1="2.4" x2="12" y2="4.6" :style="{ '--i': ray }" />
        </g>
        <circle class="disc" cx="12" cy="12" r="5" fill="currentColor" :mask="`url(#${maskId})`" />
        <g class="stars" fill="currentColor">
          <circle v-for="star in STARS" :key="star.i" :cx="star.x" :cy="star.y" :r="star.r" :style="{ '--i': star.i, 'transform-origin': `${star.x}px ${star.y}px` }" />
        </g>
      </svg>
    </button>
    <template #fallback><span class="theme-toggle" aria-hidden="true" /></template>
  </ClientOnly>
</template>
<style scoped>
.theme-toggle { display: grid; place-items: center; width: 44px; height: 44px; flex-shrink: 0; color: var(--studio-muted); border-radius: 50%; transition: color 180ms, background 180ms; }
.theme-toggle:hover { color: hsl(var(--foreground)); background: hsl(var(--muted)); }
.theme-toggle:active { background: hsl(var(--accent)); }
.theme-toggle.is-squishing { animation: squish 460ms var(--studio-ease); }
@keyframes squish { 0% { transform: scale(1); } 35% { transform: scale(.9, 1.06); } 65% { transform: scale(1.04, .97); } 100% { transform: scale(1); } }

/* Every part turns about the centre of the icon, with a little spring in each move. */
.sky { --bounce: cubic-bezier(.34, 1.25, .64, 1); overflow: visible; }
.sky * { transform-box: view-box; transform-origin: 12px 12px; }
.rays { transform: rotate(0deg); transition: transform 560ms var(--bounce); }
.rays line { transform: rotate(calc(var(--i) * 45deg)) scale(1); opacity: 1; transition: transform 420ms var(--bounce), opacity 200ms linear; transition-delay: calc(180ms + var(--i) * 28ms), calc(220ms + var(--i) * 28ms); }
.disc { transform: scale(1) rotate(0deg); transition: transform 620ms var(--bounce); }
.bite { transform: translate(15px, -15px); transition: transform 560ms var(--bounce) calc(120ms); }
.stars circle { transform: scale(0); transition: transform 380ms var(--bounce); transition-delay: 0ms; }

.is-dark .rays { transform: rotate(-135deg); }
.is-dark .rays line { transform: rotate(calc(var(--i) * 45deg)) scale(0); opacity: 0; transition-delay: calc(var(--i) * 22ms), calc(60ms + var(--i) * 22ms); }
.is-dark .disc { transform: scale(1.18) rotate(-22deg); }
.is-dark .bite { transform: translate(4.2px, -4.2px); }
.is-dark .stars circle { transform: scale(1); transition-delay: calc(420ms + var(--i) * 90ms); }
.is-dark:hover .stars circle { animation: twinkle 1.6s ease-in-out infinite; animation-delay: calc(var(--i) * 260ms); }
@keyframes twinkle { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(.55); opacity: .5; } }

@media (prefers-reduced-motion: reduce) {
  .theme-toggle.is-squishing { animation: none; }
}
</style>
<style>
/* The page-wide switch: the default cross-fade is replaced by the new theme spreading out from the button as a soft circle, driven from the script. */
::view-transition-old(root), ::view-transition-new(root) { animation: none; mix-blend-mode: normal; }
</style>
