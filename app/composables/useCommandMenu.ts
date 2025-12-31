export const useCommandMenu = () => {
    const isOpen = useState<boolean>('command-menu-open', () => false)

    const toggle = () => {
        isOpen.value = !isOpen.value
    }

    const open = () => {
        isOpen.value = true
    }

    const close = () => {
        isOpen.value = false
    }

    return {
        isOpen,
        toggle,
        open,
        close
    }
}
