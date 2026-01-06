<script setup lang="ts">
const route = useRoute()

const tabs = [
  { name: 'Home', path: '/', icon: 'home' },
  { name: 'Articles', path: '/articles', icon: 'file-text' },
  { name: 'Bookmarks', path: '/bookmarks', icon: 'bookmark' }
]

const isActive = (path: string) => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}
</script>

<template>
  <nav class="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-background border-t border-border">
    <div class="flex items-center justify-around h-14">
      <NuxtLink
        v-for="tab in tabs"
        :key="tab.path"
        :to="tab.path"
        class="flex flex-col items-center justify-center flex-1 h-full transition-colors"
        :class="isActive(tab.path) ? 'text-foreground' : 'text-muted-foreground'"
      >
        <!-- Home Icon -->
        <svg v-if="tab.icon === 'home'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/>
          <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        </svg>
        <!-- File Text Icon -->
        <svg v-else-if="tab.icon === 'file-text'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/>
          <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
          <path d="M10 9H8"/>
          <path d="M16 13H8"/>
          <path d="M16 17H8"/>
        </svg>
        <!-- Bookmark Icon -->
        <svg v-else-if="tab.icon === 'bookmark'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
        </svg>
        <span class="text-xs mt-1">{{ tab.name }}</span>
      </NuxtLink>
    </div>
  </nav>
</template>
