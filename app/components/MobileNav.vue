<script setup lang="ts">
import { Sun, Moon } from 'lucide-vue-next'

const colorMode = useColorMode()

const toggleTheme = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

// Hide-on-scroll logic
const isVisible = ref(true)
const lastScrollY = ref(0)

onMounted(() => {
  const handleScroll = () => {
    const currentScrollY = window.scrollY
    
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
      'sticky top-0 z-50 flex h-14 items-center justify-between border-b bg-background px-4 lg:hidden transition-transform duration-300',
      isVisible ? 'translate-y-0' : '-translate-y-full'
    ]"
  >
    <NuxtLink to="/" class="font-serif text-lg font-bold italic tracking-wide">
      AbdurRahaman
    </NuxtLink>
    
    <button 
      @click="toggleTheme"
      class="rounded-md p-2 hover:bg-muted text-muted-foreground"
      aria-label="Toggle Theme"
    >
      <Sun v-if="colorMode.value === 'dark'" class="h-5 w-5" />
      <Moon v-else class="h-5 w-5" />
    </button>
  </header>
</template>
