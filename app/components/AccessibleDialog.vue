<script lang="ts">
// Multiple dialogs may coexist; only the final close releases the scroll lock.
let scrollLocks = 0
let savedOverflow = ''
let savedOverflowPriority = ''
</script>

<script setup lang="ts">
import { X } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  open: boolean
  title: string
  description?: string
  closeLabel?: string
  size?: 'default' | 'wide'
}>(), {
  closeLabel: 'Close dialog',
  size: 'default'
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  keydown: [event: KeyboardEvent]
}>()

const dialog = ref<HTMLDialogElement | null>(null)
const titleId = useId()
const descriptionId = useId()
let previousFocus: HTMLElement | null = null
let ownsScrollLock = false
let backdropPointer: { id: number, x: number, y: number } | null = null

function lockScroll() {
  if (ownsScrollLock) return
  if (scrollLocks === 0) {
    savedOverflow = document.body.style.getPropertyValue('overflow')
    savedOverflowPriority = document.body.style.getPropertyPriority('overflow')
    document.body.style.setProperty('overflow', 'hidden')
  }
  scrollLocks++
  ownsScrollLock = true
}

function releaseScroll() {
  if (!ownsScrollLock) return
  ownsScrollLock = false
  scrollLocks = Math.max(0, scrollLocks - 1)
  if (scrollLocks === 0 && document.body.style.overflow === 'hidden') {
    if (savedOverflow) document.body.style.setProperty('overflow', savedOverflow, savedOverflowPriority)
    else document.body.style.removeProperty('overflow')
  }
}

function restoreFocus() {
  const target = previousFocus
  previousFocus = null
  if (target?.isConnected) target.focus({ preventScroll: true })
}

function requestClose() {
  emit('update:open', false)
}

function onClose() {
  // A queued close event must not dismiss a dialog that has already reopened.
  if (dialog.value?.open) return
  releaseScroll()
  restoreFocus()
  if (props.open) requestClose()
}

function syncDialog() {
  const element = dialog.value
  if (!element) return
  if (props.open && !element.open) {
    previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    element.showModal()
    lockScroll()
    element.querySelector<HTMLElement>('[autofocus]')?.focus({ preventScroll: true })
  } else if (!props.open && element.open) {
    element.close()
    onClose()
  }
}

function isBackdrop(event: PointerEvent) {
  if (event.target !== dialog.value) return false
  const bounds = dialog.value?.getBoundingClientRect()
  return Boolean(bounds && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom))
}

function onPointerDown(event: PointerEvent) {
  backdropPointer = event.button === 0 && isBackdrop(event)
    ? { id: event.pointerId, x: event.clientX, y: event.clientY }
    : null
}

function onPointerUp(event: PointerEvent) {
  const start = backdropPointer
  backdropPointer = null
  if (start && start.id === event.pointerId && isBackdrop(event)
    && Math.hypot(event.clientX - start.x, event.clientY - start.y) < 8) requestClose()
}

function onKeydown(event: KeyboardEvent) {
  emit('keydown', event)
  if (event.defaultPrevented || event.key !== 'Tab' || !dialog.value) return
  const elements = Array.from(dialog.value.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])'
  )).filter(element => element.tabIndex >= 0
    && element.getClientRects().length > 0
    && !element.matches(':disabled')
    && !element.closest('[inert]')
    && getComputedStyle(element).visibility !== 'hidden')
  const first = elements[0]
  const last = elements[elements.length - 1]
  if (!first) {
    event.preventDefault()
    dialog.value.focus()
  } else if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog.value)) {
    event.preventDefault()
    last?.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

watch(() => props.open, syncDialog, { flush: 'post' })
onMounted(syncDialog)
onBeforeUnmount(() => {
  dialog.value?.close()
  releaseScroll()
  restoreFocus()
})
</script>

<template>
  <!-- Native modal dialogs use the browser's top layer without a Teleport. -->
  <dialog
      ref="dialog"
      class="accessible-dialog"
      :class="{ 'accessible-dialog--wide': size === 'wide' }"
      :aria-labelledby="titleId"
      :aria-describedby="description ? descriptionId : undefined"
      aria-modal="true"
      tabindex="-1"
      @cancel.prevent="requestClose"
      @close="onClose"
      @pointerdown="onPointerDown"
      @pointerup="onPointerUp"
      @pointercancel="backdropPointer = null"
      @keydown="onKeydown"
    >
      <header class="dialog-header">
        <div class="min-w-0">
          <h2 :id="titleId" class="text-xl font-semibold leading-snug sm:text-2xl">{{ title }}</h2>
          <p v-if="description" :id="descriptionId" class="mt-2 text-sm leading-relaxed text-muted-foreground">{{ description }}</p>
        </div>
        <button type="button" class="dialog-close" :aria-label="closeLabel" @click="requestClose">
          <X class="h-5 w-5" aria-hidden="true" />
        </button>
      </header>
      <div class="dialog-content"><slot /></div>
  </dialog>
</template>

<style scoped>
.accessible-dialog {
  width: min(42rem, calc(100vw - 2rem));
  max-width: none;
  max-height: calc(100dvh - 2rem);
  margin: auto;
  padding: 0;
  overflow: auto;
  overscroll-behavior: contain;
  color: hsl(var(--foreground));
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 1rem;
  box-shadow: 0 24px 80px rgb(0 0 0 / 24%);
}

.accessible-dialog--wide { width: min(72rem, calc(100vw - 2rem)); }
.accessible-dialog::backdrop { background: rgb(0 0 0 / 68%); backdrop-filter: blur(5px); }
.accessible-dialog[open] { animation: dialog-enter 160ms ease-out; }
.dialog-header {
  position: sticky;
  top: 0;
  z-index: 1;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.5rem;
  background: hsl(var(--background));
  border-bottom: 1px solid hsl(var(--border));
}
.dialog-content { padding: 1.5rem; }
.dialog-close {
  flex-shrink: 0;
  display: grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  margin-top: -0.4rem;
  margin-right: -0.4rem;
  border-radius: 999px;
  cursor: pointer;
}
.dialog-close:hover { background: hsl(var(--muted)); }
.dialog-close:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }
@keyframes dialog-enter { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@media (max-width: 480px) {
  .dialog-header, .dialog-content { padding: 1rem; }
}
@media (prefers-reduced-motion: reduce) { .accessible-dialog[open] { animation: none; } }
</style>
