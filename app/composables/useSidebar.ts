export const useSidebar = () => {
    // Use Nuxt's useState for SSR-safe global state that persists across navigations
    const isOpen = useState('sidebar-open', () => false)

    const open = () => {
        isOpen.value = true
    }

    const close = () => {
        isOpen.value = false
    }

    const toggle = () => {
        isOpen.value = !isOpen.value
    }

    return {
        isOpen,
        open,
        close,
        toggle
    }
}
