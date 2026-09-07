<script setup lang="ts">
import { Moon, Sun } from 'lucide-vue-next'
const colorMode = useColorMode()
const toggleTheme = () => { colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark' }
</script>
<template>
  <ClientOnly>
    <button type="button" @click="toggleTheme" class="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground" :aria-label="colorMode.value === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'"><Sun v-if="colorMode.value === 'dark'" class="h-5 w-5" aria-hidden="true" /><Moon v-else class="h-5 w-5" aria-hidden="true" /></button>
    <template #fallback><span class="block h-11 w-11 shrink-0" aria-hidden="true" /></template>
  </ClientOnly>
</template>
