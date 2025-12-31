<script setup lang="ts">
import { Monitor, Moon, Sun } from 'lucide-vue-next'

const colorMode = useColorMode()

function setTheme(theme: string) {
  colorMode.preference = theme
}
</script>

<template>
  <ClientOnly>
    <div class="flex items-center gap-1 rounded-full border bg-background p-1 shadow-sm">
      <button
        @click="setTheme('light')"
        :class="cn(
          'rounded-full p-1.5 transition-colors hover:bg-muted hover:text-foreground',
          colorMode.preference === 'light' ? 'bg-muted text-foreground ring-1 ring-border shadow-sm' : 'text-muted-foreground'
        )"
        title="Light Mode"
      >
        <Sun class="h-4 w-4" />
        <span class="sr-only">Light</span>
      </button>
      <button
        @click="setTheme('dark')"
        :class="cn(
          'rounded-full p-1.5 transition-colors hover:bg-muted hover:text-foreground',
          colorMode.preference === 'dark' ? 'bg-muted text-foreground ring-1 ring-border shadow-sm' : 'text-muted-foreground'
        )"
        title="Dark Mode"
      >
        <Moon class="h-4 w-4" />
        <span class="sr-only">Dark</span>
      </button>
      <button
        @click="setTheme('system')"
        :class="cn(
          'rounded-full p-1.5 transition-colors hover:bg-muted hover:text-foreground',
          colorMode.preference === 'system' ? 'bg-muted text-foreground ring-1 ring-border shadow-sm' : 'text-muted-foreground'
        )"
        title="System Mode"
      >
        <Monitor class="h-4 w-4" />
        <span class="sr-only">System</span>
      </button>
    </div>
  </ClientOnly>
</template>
