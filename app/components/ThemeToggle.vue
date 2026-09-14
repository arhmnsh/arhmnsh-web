<script setup lang="ts">
/**
 * Sun by day, moon by night. Tapping squishes the button while the icon reshapes itself: the rays
 * spin in and the moon takes a bite out of the disc, or the bite lets go and the rays pop back
 * out. Around it the whole page joins in through a view transition. Going dark, the page flickers
 * like a dying bulb, goes out, and the night view rises out of the dark. Going light, a lamp
 * stutters on at the button and its glow spreads over the page, a touch too bright at first.
 * Browsers without view transitions, and people who prefer reduced motion, get the plain switch.
 */
const colorMode = useColorMode()
const button = ref<HTMLButtonElement | null>(null)
const maskId = useId()
const squishing = ref(false)
const isDark = computed(() => colorMode.value === 'dark')
const RAYS = Array.from({ length: 8 }, (_, index) => index)
const STARS = [{ x: 5.2, y: 6.4, r: .95, i: 0 }, { x: 8.6, y: 3.6, r: .65, i: 1 }, { x: 3.6, y: 10.6, r: .55, i: 2 }]

type Transitioning = Document & { startViewTransition?: (update: () => Promise<void> | void) => { finished: Promise<void> } }

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
  // The effect spreads from the button, so the circle must reach the farthest corner from it.
  const x = rect.left + rect.width / 2, y = rect.top + rect.height / 2
  const reach = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))
  root.style.setProperty('--theme-x', `${x}px`)
  root.style.setProperty('--theme-y', `${y}px`)
  root.style.setProperty('--theme-r', `${Math.ceil(reach)}px`)
  const mode = next === 'dark' ? 'theme-to-dark' : 'theme-to-light'
  root.classList.remove('theme-to-dark', 'theme-to-light')
  root.classList.add(mode)
  const transition = doc.startViewTransition(async () => { colorMode.preference = next; await nextTick() })
  try { await transition.finished } catch {} finally { root.classList.remove(mode) }
}
</script>
<template>
  <ClientOnly>
    <button ref="button" type="button" class="theme-toggle" :class="{ 'is-dark': isDark, 'is-squishing': squishing }" :aria-label="isDark ? 'Switch to light theme' : 'Switch to dark theme'" @click="toggleTheme" @animationend="squishing = false">
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
.theme-toggle.is-squishing { animation: squish 520ms var(--studio-ease); }
@keyframes squish { 0% { transform: scale(1); } 30% { transform: scale(.8, 1.15); } 55% { transform: scale(1.12, .9); } 75% { transform: scale(.97, 1.03); } 100% { transform: scale(1); } }

/* Every part turns about the centre of the icon, with a little spring in each move. */
.sky { --bounce: cubic-bezier(.34, 1.56, .64, 1); --delay: 0ms; overflow: visible; }
.sky * { transform-box: view-box; transform-origin: 12px 12px; }
.rays { transform: rotate(0deg); transition: transform 560ms var(--bounce) var(--delay); }
.rays line { transform: rotate(calc(var(--i) * 45deg)) scale(1); opacity: 1; transition: transform 420ms var(--bounce), opacity 200ms linear; transition-delay: calc(var(--delay) + 180ms + var(--i) * 28ms), calc(var(--delay) + 220ms + var(--i) * 28ms); }
.disc { transform: scale(1) rotate(0deg); transition: transform 620ms var(--bounce) var(--delay); }
.bite { transform: translate(15px, -15px); transition: transform 560ms var(--bounce) calc(var(--delay) + 120ms); }
.stars circle { transform: scale(0); transition: transform 380ms var(--bounce); transition-delay: 0ms; }

.is-dark .rays { transform: rotate(-135deg); }
.is-dark .rays line { transform: rotate(calc(var(--i) * 45deg)) scale(0); opacity: 0; transition-delay: calc(var(--delay) + var(--i) * 22ms), calc(var(--delay) + 60ms + var(--i) * 22ms); }
.is-dark .disc { transform: scale(1.18) rotate(-22deg); }
.is-dark .bite { transform: translate(4.2px, -4.2px); }
.is-dark .stars circle { transform: scale(1); transition-delay: calc(var(--delay) + 420ms + var(--i) * 90ms); }
.is-dark:hover .stars circle { animation: twinkle 1.6s ease-in-out infinite; animation-delay: calc(var(--i) * 260ms); }
@keyframes twinkle { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(.55); opacity: .5; } }

/* While the page flickers out, the icon waits and the moon rises with the night view. */
:global(html.theme-to-dark) .sky { --delay: 520ms; }

@media (prefers-reduced-motion: reduce) {
  .theme-toggle.is-squishing { animation: none; }
}
</style>
<style>
/* The page-wide light switch. The default cross-fade is replaced by two little scenes. */
::view-transition-old(root), ::view-transition-new(root) { animation: none; mix-blend-mode: normal; }

/* Lights out: the old view flickers like a failing bulb and dies, leaving the bare dark canvas, then the night view rises out of it. */
html.theme-to-dark::view-transition-old(root) { animation: bulb-out 560ms steps(1, end) forwards; }
html.theme-to-dark::view-transition-new(root) { animation: night-rises 460ms cubic-bezier(.2, .8, .2, 1) 540ms backwards; }
@keyframes bulb-out {
  0% { opacity: 1; }
  9% { opacity: .12; }
  15% { opacity: 1; }
  27% { opacity: .35; }
  33% { opacity: .9; }
  45% { opacity: .05; }
  52% { opacity: .7; }
  60% { opacity: .2; }
  66%, 100% { opacity: 0; }
}
@keyframes night-rises { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }

/* Lights on: a lamp stutters on around the button, then its glow spreads over the page, too bright at first, and settles as the eyes adjust. */
html.theme-to-light::view-transition-new(root) { animation: lamp-on 920ms both; }
@keyframes lamp-on {
  0% { clip-path: circle(0px at var(--theme-x) var(--theme-y)); opacity: 1; filter: brightness(2); animation-timing-function: steps(1, end); }
  6% { clip-path: circle(48px at var(--theme-x) var(--theme-y)); opacity: 1; animation-timing-function: steps(1, end); }
  11% { opacity: 0; animation-timing-function: steps(1, end); }
  16% { opacity: 1; animation-timing-function: steps(1, end); }
  21% { opacity: .15; animation-timing-function: steps(1, end); }
  27% { clip-path: circle(48px at var(--theme-x) var(--theme-y)); opacity: 1; filter: brightness(1.7); animation-timing-function: cubic-bezier(.2, .8, .2, 1); }
  100% { clip-path: circle(var(--theme-r) at var(--theme-x) var(--theme-y)); opacity: 1; filter: brightness(1); }
}
</style>
