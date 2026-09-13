<script setup lang="ts">
const { open: openSidebar, isOpen } = useSidebar()
</script>

<template>
  <header class="mobile-header">
    <NuxtLink to="/" class="mobile-brand" aria-label="AbdurRahaman Shah — Home">AbdurRahaman Shah</NuxtLink>
    <div class="mobile-tools"><ThemeToggle /><button type="button" @click="openSidebar" class="mobile-menu" aria-label="Open navigation" aria-haspopup="dialog" :aria-expanded="isOpen"><span>Menu</span></button></div>
  </header>
</template>

<style scoped>
.mobile-header { display: flex; position: relative; z-index: 40; min-height: 84px; align-items: center; justify-content: space-between; gap: .5rem; padding-inline: 24px; background: hsl(var(--background)); }
.mobile-brand { display: flex; align-items: center; min-height: 44px; font-size: 13px; font-weight: 500; letter-spacing: -.035em; }
.mobile-tools { display: flex; gap: .25rem; align-items: center; }
.mobile-menu { display: grid; place-items: center; min-width: 44px; height: 44px; border-radius: .5rem; font-size: 12px; color: var(--studio-muted); }
.mobile-menu:hover { background: hsl(var(--muted)); }
@media (min-width: 1024px) { .mobile-header { display: none; } }
@media (max-width: 359px) { .mobile-header { padding-inline: 16px; } .mobile-brand { font-size: 12px; } }
</style>
