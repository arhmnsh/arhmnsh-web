<script setup lang="ts">
import { Home, Newspaper, BookOpen, Bookmark, PenTool, Image, Rss } from 'lucide-vue-next'
import bookmarks from '../../content/bookmarks.json'

const emit = defineEmits<{ navigate: [] }>()
const props = defineProps<{ hasPoems: boolean }>()
const route = useRoute()
const links = computed(() => [
  { to: '/', title: 'Home', icon: Home },
  { to: '/articles', title: 'Articles', icon: Newspaper },
  { to: '/books', title: 'Books', icon: BookOpen },
  { to: '/gallery', title: 'Gallery', icon: Image },
  ...(bookmarks.length ? [{ to: '/bookmarks', title: 'Bookmarks', icon: Bookmark }] : []),
  ...(props.hasPoems ? [{ to: '/shayris', title: 'Shayris', icon: PenTool }] : [])
])
const isActive = (path: string) => path === '/' ? route.path === '/' : route.path.replace(/\/$/, '') === path || route.path.startsWith(path + '/')
</script>

<template>
  <nav aria-label="Main navigation" class="flex flex-col gap-1">
    <NuxtLink v-for="link in links" :key="link.to" :to="link.to" :aria-current="isActive(link.to) ? 'page' : undefined" :class="['flex min-h-11 items-center gap-3 rounded-md px-3 py-3 text-sm transition-colors hover:bg-muted/50 hover:text-foreground', isActive(link.to) ? 'bg-muted/50 font-medium text-foreground' : 'text-muted-foreground']" @click="emit('navigate')">
      <component :is="link.icon" class="h-4 w-4" aria-hidden="true" />{{ link.title }}
    </NuxtLink>
    <a href="/rss.xml" class="mt-5 flex min-h-11 items-center gap-3 rounded-md px-3 py-3 text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground"><Rss class="h-4 w-4" aria-hidden="true" />RSS feed</a>
  </nav>
</template>
