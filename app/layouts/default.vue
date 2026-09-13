<script setup lang="ts">
const { isOpen: searchOpen } = useCommandMenu({ shortcuts: true })
const searchLoaded = ref(false)
watch(searchOpen, value => { if (value) searchLoaded.value = true }, { immediate: true })
</script>

<template>
  <div class="site-shell min-h-screen bg-background font-sans text-foreground">
    <a href="#main-content" class="skip-link">Skip to content</a>
    <NuxtLoadingIndicator color="var(--studio-accent)" :height="2" />
    <Sidebar />
    <MobileNav />
    <main id="main-content" tabindex="-1" class="min-w-0 w-full"><slot /></main>
    <SiteFooter />
    <SiteCursor />
    <LazyCommandMenu v-if="searchLoaded" />
  </div>
</template>
