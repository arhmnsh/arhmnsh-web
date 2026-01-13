<script setup lang="ts">
import { Moon, Sun } from 'lucide-vue-next'

const colorMode = useColorMode()

const toggleTheme = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>

<template>
  <ClientOnly>
    <button 
      @click="toggleTheme"
      class="p-2 transition-colors hover:bg-muted/50 rounded-md"
      :class="colorMode.value === 'dark' ? 'text-neutral-400 hover:text-white' : 'text-neutral-600 hover:text-black'"
      aria-label="Toggle Theme"
    >
      <Sun v-if="colorMode.value === 'dark'" class="h-4 w-4" />
      <Moon v-else class="h-4 w-4" />
    </button>
  </ClientOnly>
</template>
