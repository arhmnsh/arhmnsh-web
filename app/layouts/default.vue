<script setup lang="ts">
import type { Section } from '~/data/sections'
import bookmarks from '../../content/bookmarks.json'

const { isOpen: searchOpen } = useCommandMenu({ shortcuts: true })
const searchLoaded = ref(false)
watch(searchOpen, value => { if (value) searchLoaded.value = true }, { immediate: true })
const { data: poems } = await useAsyncData('navigation-poems', () => queryCollection('shayris').select('path').all())
const hidden = computed<Section['id'][]>(() => [...(poems.value?.length ? [] : ['poetry' as const]), ...(bookmarks.length ? [] : ['bookmarks' as const])])
</script>

<template>
  <div class="site-shell">
    <a href="#main-content" class="skip-link">Skip to content</a>
    <NuxtLoadingIndicator color="var(--studio-accent)" :height="2" />
    <SiteFrame :hidden="hidden"><slot /></SiteFrame>
    <SiteFooter />
    <SiteCursor />
    <LazyCommandMenu v-if="searchLoaded" />
  </div>
</template>

<style scoped>
.site-shell { min-height: 100dvh; display: flex; flex-direction: column; background: hsl(var(--background)); color: hsl(var(--foreground)); }
.site-shell > :nth-child(3) { flex: 1; }
</style>
