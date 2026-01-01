<script setup lang="ts">
import { Menu, X } from 'lucide-vue-next'
const { toggle, isOpen } = useSidebar()
</script>

<template>
  <header class="flex h-16 items-center justify-between border-b bg-background px-4 lg:hidden">
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
