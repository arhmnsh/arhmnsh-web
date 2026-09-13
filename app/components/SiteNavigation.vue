<script setup lang="ts">
import { Home, Newspaper, BookOpen, Bookmark, PenTool, Image, ArrowUpRight } from 'lucide-vue-next'
import bookmarks from '../../content/bookmarks.json'
const emit = defineEmits<{ navigate: [] }>()
const props = defineProps<{ hasPoems: boolean }>()
const route = useRoute()
const links = computed(() => [
  { to: '/', title: 'Home', icon: Home },
  { to: '/articles', title: 'Writing', icon: Newspaper },
  { to: '/books', title: 'Books', icon: BookOpen },
  { to: '/gallery', title: 'Gallery', icon: Image },
  ...(bookmarks.length ? [{ to: '/bookmarks', title: 'Bookmarks', icon: Bookmark }] : []),
  ...(props.hasPoems ? [{ to: '/shayris', title: 'Poetry', icon: PenTool }] : [])
])
const isActive = (path: string) => path === '/' ? route.path === '/' : route.path.replace(/\/$/, '') === path || route.path.startsWith(path + '/')
</script>

<template>
  <nav aria-label="Main navigation" class="main-navigation">
    <NuxtLink v-for="link in links" :key="link.to" :to="link.to" :aria-current="isActive(link.to) ? 'page' : undefined" class="navigation-link" @click="emit('navigate')"><component :is="link.icon" class="navigation-icon" :size="18" aria-hidden="true" /><span>{{ link.title }}</span><span class="nav-active-dot" aria-hidden="true" /></NuxtLink>
    <a href="/rss.xml" class="navigation-rss"><span>RSS feed</span><ArrowUpRight :size="14" aria-hidden="true" /></a>
  </nav>
</template>

<style scoped>
.main-navigation { display: flex; flex-direction: column; gap: .15rem; }
.navigation-link { display: flex; align-items: center; gap: .9rem; min-height: 3.25rem; padding: .75rem .5rem; border-radius: .4rem; color: var(--studio-muted); font-size: 1rem; transition: color 160ms, background 160ms; }
.navigation-icon { display: none; }
.navigation-link[aria-current="page"] { color: hsl(var(--foreground)); }
.navigation-link:hover { color: hsl(var(--foreground)); background: hsl(var(--muted)); }
.nav-active-dot { width: 4px; height: 4px; border-radius: 50%; margin-left: auto; background: currentColor; opacity: 0; }
.navigation-link[aria-current="page"] .nav-active-dot { opacity: 1; }
.navigation-rss { display: flex; align-items: center; gap: .5rem; min-height: 2.75rem; padding: .75rem .5rem; margin-top: .5rem; font-size: .75rem; color: var(--studio-muted); }
@media (min-width: 1024px) {
  .main-navigation { flex-direction: row; gap: .4rem; }
  .navigation-link { min-height: 44px; padding: .65rem .7rem; font-size: 12px; }
  .navigation-rss, .nav-active-dot { display: none; }
  .navigation-link[aria-current="page"] { text-decoration: underline; text-underline-offset: 6px; text-decoration-thickness: 1px; }
  .navigation-link:hover { background: transparent; }
}
</style>
