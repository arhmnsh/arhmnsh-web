<script setup lang="ts">
import { Moon, Sun } from 'lucide-vue-next'
const colorMode = useColorMode()
const toggleTheme = () => { colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark' }
</script>
<template>
  <ClientOnly>
    <button type="button" @click="toggleTheme" class="theme-toggle" :aria-label="colorMode.value === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'"><Sun v-if="colorMode.value === 'dark'" :size="17" aria-hidden="true" /><Moon v-else :size="17" aria-hidden="true" /></button>
    <template #fallback><span class="theme-toggle" aria-hidden="true" /></template>
  </ClientOnly>
</template>
<style scoped>
.theme-toggle { display: grid; place-items: center; width: 44px; height: 44px; flex-shrink: 0; color: var(--studio-muted); border-radius: 50%; transition: color 180ms, background 180ms; }
.theme-toggle:hover { color: hsl(var(--foreground)); background: hsl(var(--muted)); }
.theme-toggle:active { background: hsl(var(--accent)); }
</style>
