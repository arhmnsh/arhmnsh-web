<script setup lang="ts">
const cursor = ref<HTMLDivElement | null>(null)
let cleanup: (() => void) | undefined

onMounted(() => {
  const preference = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)')
  const root = document.documentElement
  const hide = () => {
    root.classList.remove('has-soft-cursor')
    cursor.value?.classList.remove('is-visible', 'is-over', 'is-pressed', 'is-text')
  }
  const move = (event: PointerEvent) => {
    // Native dialogs sit in the browser's top layer, above anything in the page, so the native cursor takes over there.
    if (!preference.matches || event.pointerType !== 'mouse' || document.querySelector('dialog[open]')) return hide()
    const element = cursor.value
    if (!element) return
    const target = event.target instanceof Element ? event.target : null
    // Text fields keep the native caret cursor.
    if (target?.closest('input, textarea, select, [contenteditable="true"]')) return hide()
    element.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`
    element.classList.add('is-visible')
    element.classList.toggle('is-over', Boolean(target?.closest('a, button:not(:disabled), summary, label, [data-cursor]')))
    element.classList.toggle('is-text', Boolean(target?.closest('.prose, .reading-body, .shayri-text')))
    root.classList.add('has-soft-cursor')
  }
  const down = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return hide()
    cursor.value?.classList.add('is-pressed')
  }
  const up = () => cursor.value?.classList.remove('is-pressed')
  const key = (event: KeyboardEvent) => { if (event.key === 'Tab') hide() }
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
/* A soft lens instead of an arrow: it inverts what is underneath, so it reads on photographs, paper, and dark mode alike. */
.soft-cursor { position: fixed; top: 0; left: 0; z-index: 2147483000; pointer-events: none; opacity: 0; transition: opacity 200ms; }
.soft-cursor.is-visible { opacity: 1; }
.soft-cursor span { display: block; width: 26px; height: 26px; margin: -13px; border-radius: 50%; backdrop-filter: invert(30%) blur(10px); -webkit-backdrop-filter: invert(30%) blur(10px); transition: width 260ms var(--studio-ease), height 260ms var(--studio-ease), margin 260ms var(--studio-ease), transform 200ms var(--studio-ease), opacity 200ms; }
.soft-cursor.is-over span { width: 50px; height: 50px; margin: -25px; }
.soft-cursor.is-text span { width: 4px; height: 26px; margin: -13px -2px; border-radius: 2px; backdrop-filter: invert(60%); -webkit-backdrop-filter: invert(60%); }
.soft-cursor.is-pressed span { transform: scale(.75); }
@media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) {
  html.has-soft-cursor, html.has-soft-cursor * { cursor: none !important; }
  html.has-soft-cursor :where(input, textarea, select, [contenteditable="true"]) { cursor: auto !important; }
}
@media (hover: none), (pointer: coarse), (prefers-reduced-motion: reduce) { .soft-cursor { display: none; } }
</style>
