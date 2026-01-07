<script setup lang="ts">
import { Monitor, Moon, Sun } from 'lucide-vue-next'

const colorMode = useColorMode()

function setTheme(theme: string) {
  colorMode.preference = theme
}
</script>

<template>
  <ClientOnly>
    <div class="flex items-center gap-1">
      <button
        @click="setTheme('light')"
        :class="cn(
          'p-1.5 transition-colors hover:text-foreground',
          colorMode.preference === 'light' ? 'text-foreground' : 'text-muted-foreground/60'
        )"
        title="Light Mode"
      >
        <Sun class="h-4 w-4" />
        <span class="sr-only">Light</span>
      </button>
      <button
        @click="setTheme('dark')"
        :class="cn(
          'p-1.5 transition-colors hover:text-foreground',
          colorMode.preference === 'dark' ? 'text-foreground' : 'text-muted-foreground/60'
        )"
        title="Dark Mode"
      >
        <Moon class="h-4 w-4" />
        <span class="sr-only">Dark</span>
      </button>
      <button
        @click="setTheme('system')"
        :class="cn(
          'p-1.5 transition-colors hover:text-foreground',
          colorMode.preference === 'system' ? 'text-foreground' : 'text-muted-foreground/60'
        )"
        title="System Mode"
      >
        <Monitor class="h-4 w-4" />
        <span class="sr-only">System</span>
      </button>
    </div>
  </ClientOnly>
</template>
