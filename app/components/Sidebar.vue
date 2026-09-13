<script setup lang="ts">
import { Search, ArrowUpRight } from 'lucide-vue-next'
const { isOpen, close } = useSidebar()
const { open: openSearch } = useCommandMenu()
const route = useRoute()
const { data: poems } = await useAsyncData('navigation-poems', () => queryCollection('shayris').select('path').all())
const searchAfterClose = ref(false)
const search = () => {
  if (isOpen.value) { searchAfterClose.value = true; close() }
  else openSearch()
}
const onNavigationClosed = () => {
  if (searchAfterClose.value) { searchAfterClose.value = false; openSearch() }
}
watch(() => route.fullPath, close)
let desktop: MediaQueryList | undefined
const handleDesktop = () => { if (desktop?.matches) close() }
onMounted(() => {
  desktop = window.matchMedia('(min-width: 1024px)')
  desktop.addEventListener('change', handleDesktop)
})
onUnmounted(() => desktop?.removeEventListener('change', handleDesktop))
</script>

<template>
  <header class="desktop-header">
    <div class="header-inner">
      <NuxtLink to="/" class="site-brand" aria-label="AbdurRahaman Shah — Home"><span>AbdurRahaman Shah</span></NuxtLink>
      <SiteNavigation :has-poems="Boolean(poems?.length)" />
      <div class="header-tools">
        <button type="button" class="search-trigger" aria-label="Search this site" aria-haspopup="dialog" @click="search"><Search :size="16" aria-hidden="true" /></button>
        <ThemeToggle />
      </div>
    </div>
  </header>
  <AccessibleDialog v-model:open="isOpen" title="Explore" close-label="Close navigation" size="sidebar" @after-close="onNavigationClosed">
    <p class="eyebrow">AbdurRahaman Shah · Engineer & designer</p>
    <SiteNavigation :has-poems="Boolean(poems?.length)" @navigate="close" />
    <button type="button" class="tactile-button justify-start" aria-haspopup="dialog" @click="search"><Search :size="16" aria-hidden="true" />Search this site</button>
    <div class="mobile-menu-footer"><a href="mailto:hi@arhmn.sh" class="text-link">Say hello <ArrowUpRight :size="16" aria-hidden="true" /></a><ThemeToggle /></div>
  </AccessibleDialog>
</template>

<style scoped>
.desktop-header { display: none; position: relative; z-index: 40; padding-inline: max(28px, calc((100vw - 1160px) / 2)); background: hsl(var(--background)); }
.header-inner { min-height: 106px; display: flex; align-items: center; justify-content: space-between; gap: 1.5rem; }
.site-brand { display: inline-flex; align-items: center; min-height: 44px; flex-shrink: 0; font-size: 14px; font-weight: 500; letter-spacing: -.035em; }
.header-tools { display: flex; align-items: center; gap: .2rem; }
.search-trigger { width: 44px; height: 44px; display: grid; place-items: center; border-radius: 50%; color: var(--studio-muted); }
.search-trigger:hover { color: hsl(var(--foreground)); background: hsl(var(--muted)); }
.mobile-menu-footer { display: flex; justify-content: space-between; align-items: center; margin-top: auto; padding-top: 1rem; border-top: 1px solid var(--studio-line); }
@media (min-width: 1024px) { .desktop-header { display: block; } }
</style>
