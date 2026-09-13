<script setup lang="ts">
const cursor = ref<HTMLDivElement | null>(null)
let cleanup: (() => void) | undefined

onMounted(() => {
  const preference = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)')
  const root = document.documentElement
  const hide = () => {
    root.classList.remove('has-soft-cursor')
    cursor.value?.classList.remove('is-visible', 'is-over', 'is-pressed')
  }
  const move = (event: PointerEvent) => {
    if (!preference.matches || event.pointerType !== 'mouse' || document.querySelector('dialog[open]')) return hide()
    const element = cursor.value
    if (!element) return
    const target = event.target instanceof Element ? event.target : null
    // Keep the familiar text-selection cursor in reading and editing surfaces.
    if (target?.closest('input, textarea, select, [contenteditable="true"], .prose')) return hide()
    element.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`
    element.classList.add('is-visible')
    element.classList.toggle('is-over', Boolean(target?.closest('a, button:not(:disabled), summary, [data-cursor]')))
    root.classList.add('has-soft-cursor')
  }
  const down = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return hide()
    cursor.value?.classList.add('is-pressed')
  }
  const up = () => cursor.value?.classList.remove('is-pressed')
  const key = (event: KeyboardEvent) => { if (event.key === 'Tab' || event.key === 'Escape') hide() }
  document.addEventListener('pointermove', move, { passive: true })
  document.addEventListener('pointerdown', down, { passive: true })
  document.addEventListener('pointerup', up, { passive: true })
  document.addEventListener('pointercancel', hide)
  document.documentElement.addEventListener('pointerleave', hide)
  document.addEventListener('keydown', key)
  document.addEventListener('visibilitychange', hide)
  window.addEventListener('blur', hide)
  preference.addEventListener('change', hide)
  const dialogs = new MutationObserver(() => { if (document.querySelector('dialog[open]')) hide() })
  dialogs.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['open'] })
  cleanup = () => {
    hide()
    dialogs.disconnect()
    document.removeEventListener('pointermove', move)
    document.removeEventListener('pointerdown', down)
    document.removeEventListener('pointerup', up)
    document.removeEventListener('pointercancel', hide)
    document.documentElement.removeEventListener('pointerleave', hide)
    document.removeEventListener('keydown', key)
    document.removeEventListener('visibilitychange', hide)
    window.removeEventListener('blur', hide)
    preference.removeEventListener('change', hide)
  }
})
onBeforeUnmount(() => cleanup?.())
</script>

<template><div ref="cursor" class="soft-cursor" aria-hidden="true"><span /></div></template>

<style>
.soft-cursor { position: fixed; top: 0; left: 0; z-index: 999; pointer-events: none; opacity: 0; }
.soft-cursor.is-visible { opacity: 1; }
.soft-cursor span { display: block; width: 12px; height: 12px; margin: -6px; border-radius: 50%; background: hsl(var(--foreground) / .5); transition: width 180ms ease, height 180ms ease, margin 180ms ease, background 180ms ease, transform 180ms ease; }
.soft-cursor.is-over span { width: 42px; height: 42px; margin: -21px; background: hsl(var(--foreground) / .13); backdrop-filter: blur(2px); }
.soft-cursor.is-pressed span { transform: scale(.8); }
@media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) {
  html.has-soft-cursor, .has-soft-cursor :where(a, button:not(:disabled), summary, [data-cursor]) { cursor: none; }
  .has-soft-cursor dialog, .has-soft-cursor dialog * { cursor: auto; }
  .has-soft-cursor dialog :where(a, button, summary) { cursor: pointer; }
}
@media (hover: none), (pointer: coarse), (prefers-reduced-motion: reduce) { .soft-cursor { display: none; } }
</style>
