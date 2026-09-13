export const useCommandMenu = (options: { shortcuts?: boolean } = {}) => {
    const isOpen = useState<boolean>('command-menu-open', () => false)
    const toggle = () => { isOpen.value = !isOpen.value }
    const open = () => { isOpen.value = true }
    const close = () => { isOpen.value = false }

    // The shell owns this listener so search can stay unloaded until it is used.
    if (options.shortcuts) {
        const shortcut = (event: KeyboardEvent) => {
            if (event.defaultPrevented || event.isComposing || event.repeat) return
            if (event.key.toLowerCase() !== 'k' || !(event.metaKey || event.ctrlKey)) return
            if (!isOpen.value && document.querySelector('dialog[open]')) return
            event.preventDefault()
            toggle()
        }
        onMounted(() => window.addEventListener('keydown', shortcut))
        onUnmounted(() => window.removeEventListener('keydown', shortcut))
    }

    return { isOpen, toggle, open, close }
}
