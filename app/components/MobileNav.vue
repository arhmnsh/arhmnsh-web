<script setup lang="ts">
import { Menu, X } from 'lucide-vue-next'
const { toggle, isOpen } = useSidebar()

// Hide-on-scroll logic
const isVisible = ref(true)
const lastScrollY = ref(0)

onMounted(() => {
  const handleScroll = () => {
    const currentScrollY = window.scrollY
    
    // Show header when scrolling up or at top, hide when scrolling down
    if (currentScrollY < 10) {
      isVisible.value = true
    } else if (currentScrollY < lastScrollY.value) {
      isVisible.value = true
    } else if (currentScrollY > lastScrollY.value) {
      isVisible.value = false
    }
    
    lastScrollY.value = currentScrollY
  }
  
  window.addEventListener('scroll', handleScroll, { passive: true })
  
  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
  })
})
</script>

<template>
  <header 
    :class="[
      'sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-background px-4 lg:hidden transition-transform duration-300',
      isVisible ? 'translate-y-0' : '-translate-y-full'
    ]"
  >
    <NuxtLink to="/" class="font-serif text-xl font-bold italic tracking-wide">
      AbdurRahaman
    </NuxtLink>
    
    <button 
      @click="toggle"
      class="rounded-md p-2 hover:bg-muted"
      aria-label="Toggle Menu"
    >
      <Menu v-if="!isOpen" class="h-6 w-6" />
      <X v-else class="h-6 w-6" />
    </button>
  </header>
</template>
