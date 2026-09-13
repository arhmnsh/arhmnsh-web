<script setup lang="ts">
import { Home, Newspaper, BookOpen, Image, Search } from 'lucide-vue-next'
const route = useRoute()
const { open } = useCommandMenu()
const tabs = [
  { name: 'Home', path: '/', icon: Home },
  { name: 'Articles', path: '/articles', icon: Newspaper },
  { name: 'Books', path: '/books', icon: BookOpen },
  { name: 'Gallery', path: '/gallery', icon: Image }
]
const isActive = (path: string) => path === '/' ? route.path === '/' : route.path === path || route.path.startsWith(path + '/')
</script>

<template>
  <nav class="mobile-dock" aria-label="Quick navigation">
    <NuxtLink v-for="item in tabs" :key="item.path" :to="item.path" :aria-current="isActive(item.path) ? 'page' : undefined" class="dock-item"><component :is="item.icon" :size="18" :stroke-width="1.7" aria-hidden="true" /><span>{{ item.name }}</span></NuxtLink>
    <button type="button" class="dock-item" aria-label="Search this site" aria-haspopup="dialog" @click="open"><Search :size="18" :stroke-width="1.7" aria-hidden="true" /><span>Search</span></button>
  </nav>
</template>

<style scoped>
.mobile-dock { position: fixed; z-index: 35; left: max(.75rem, env(safe-area-inset-left)); right: max(.75rem, env(safe-area-inset-right)); bottom: max(.6rem, env(safe-area-inset-bottom)); display: flex; align-items: stretch; padding: .35rem; max-width: 440px; margin-inline: auto; border: 1px solid hsl(var(--border)); border-radius: 1.2rem; background: hsl(var(--card) / .96); box-shadow: 0 5px 25px #172d221a, inset 0 1px 0 var(--glass-highlight); backdrop-filter: blur(12px); }
.dock-item { display: flex; flex: 1; min-width: 0; min-height: 51px; flex-direction: column; justify-content: center; align-items: center; gap: .3rem; border-radius: .85rem; color: var(--studio-muted); font-size: .56rem; font-weight: 500; transition: background 160ms, color 160ms, transform 160ms; }
.dock-item[aria-current="page"] { background: hsl(var(--accent)); color: var(--studio-accent); }
.dock-item:active { transform: scale(.95); }
@media (min-width: 1024px) { .mobile-dock { display: none; } }
@media (prefers-reduced-motion: reduce) { .dock-item:active { transform: none; } }
</style>
