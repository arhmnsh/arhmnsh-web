<script setup lang="ts">
import { Menu, Search } from 'lucide-vue-next'
const { open } = useCommandMenu()
const { open: openSidebar, isOpen } = useSidebar()
</script>

<template>
  <header class="site-toolbar sticky top-0 z-40 flex h-16 items-center justify-between gap-1 border-b border-border bg-background px-3 lg:hidden">
    <button type="button" @click="openSidebar" class="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted/50" aria-label="Open navigation" aria-haspopup="dialog" :aria-expanded="isOpen"><Menu class="h-5 w-5" aria-hidden="true" /></button>
    <NuxtLink to="/" class="min-w-0 flex-1 truncate font-serif text-base font-bold italic sm:text-lg">AbdurRahaman Shah</NuxtLink>
    <button type="button" @click="open" class="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted/50" aria-label="Search this site" aria-haspopup="dialog"><Search class="h-5 w-5" aria-hidden="true" /></button>
    <ThemeToggle />
  </header>
</template>
