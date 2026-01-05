// Singleton state to ensure consistency across components and navigations
const isOpen = ref(false)

export const useSidebar = () => {
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
