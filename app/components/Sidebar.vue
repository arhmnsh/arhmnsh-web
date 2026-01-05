<script setup lang="ts">
import {
  Search,
  Home,
  Newspaper,
  Bot,
  ChartNoAxesColumn,
  Briefcase,
  CodeXml,
  Bookmark,
  Car,
  Building2,
  HeartPulse,
  User,
  Cpu,
  Plane,
  PenTool
} from 'lucide-vue-next'

const route = useRoute()
const { isOpen, close } = useSidebar()

// Close on route change (for mobile)
watch(() => route.fullPath, () => {
  if (isOpen.value) close()
}, { immediate: true })

// Fetch articles once to extract categories
const { data: articlesForCategories } = await useAsyncData('sidebar-categories', () => 
  queryCollection('articles').all()
)

const dynamicCategories = computed(() => {
  if (!articlesForCategories.value) return []
  const cats = new Set<string>()
  articlesForCategories.value.forEach(article => {
    if (article.categories) {
      article.categories.forEach(c => cats.add(c))
    }
  })
  return Array.from(cats).sort()
})

const getCategoryIcon = (cat: string) => {
  switch (cat.toLowerCase()) {
    case 'ai': return Bot
    case 'productivity': return ChartNoAxesColumn
    case 'job-search': return Briefcase
    case 'career': return CodeXml
    case 'automotive': return Car
    case 'business': return Building2
    case 'health': return HeartPulse
    case 'personal': return User
    case 'technology': return Cpu
    case 'travel': return Plane
    case 'writing': return PenTool
    default: return Newspaper
  }
}

const { open } = useCommandMenu()

const openSearch = () => {
  open()
}

const isActive = (path: string) => route.path === path || route.path.startsWith(path + '/')
</script>

<template>
  <div>
    <!-- Backdrop for mobile -->
    <div 
      v-if="isOpen" 
      class="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm lg:hidden"
      @click="close"
    />

    <aside 
      :class="cn(
        'fixed left-0 top-0 z-[70] flex h-screen w-64 flex-col border-r bg-muted/30 dark:bg-muted/10 transition-transform duration-300 ease-in-out lg:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )"
    >
      <!-- Header / Logo -->
      <div class="flex h-16 items-center px-6">
        <NuxtLink to="/" class="font-serif text-xl font-bold italic tracking-wide">
          AbdurRahaman
        </NuxtLink>
      </div>

    <!-- Search Bar -->
    <div class="px-4 py-2">
      <button
        class="flex w-full items-center justify-between rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground shadow-sm transition-colors hover:bg-muted/50 hover:text-foreground"
        @click="openSearch"
      >
        <div class="flex items-center gap-2">
          <Search class="h-4 w-4" />
          <span>Search...</span>
        </div>
        <div class="flex items-center gap-1 text-xs">
          <kbd class="rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            ⌘
          </kbd>
          <kbd class="rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            K
          </kbd>
        </div>
      </button>
    </div>

    <!-- Navigation Content -->
    <div class="flex-1 overflow-y-auto px-4 py-4">
      <nav class="flex flex-col gap-8" @click="close">
        <!-- Main Links -->
        <div class="flex flex-col gap-1">
          <NuxtLink
            to="/"
            :class="cn(
              'flex items-center gap-3 rounded-md px-2 py-1.5 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground',
              isActive('/') ? 'bg-muted text-foreground' : 'text-muted-foreground'
            )"
          >
            <Home class="h-4 w-4" />
            <span>Home</span>
          </NuxtLink>
        </div>

        <!-- Resources (Only Bookmarks now) -->
        <div class="flex flex-col gap-1">
          <NuxtLink
            to="/bookmarks"
            :class="cn(
              'flex items-center gap-3 rounded-md px-2 py-1.5 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground',
              isActive('/bookmarks') ? 'bg-muted text-foreground' : 'text-muted-foreground'
            )"
          >
            <Bookmark class="h-4 w-4" />
            <span>Bookmarks</span>
          </NuxtLink>
        </div>

        <!-- Articles -->
        <div class="flex flex-col gap-1">
          <div class="px-2 py-1 text-xs font-semibold uppercase text-muted-foreground">
            Articles
          </div>
          <NuxtLink
            v-for="cat in dynamicCategories"
            :key="cat"
            :to="{ path: '/articles', query: { c: cat } }"
            :class="cn(
              'flex items-center gap-3 rounded-md px-2 py-1.5 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground',
              route.query.c === cat ? 'bg-muted text-foreground' : 'text-muted-foreground'
            )"
          >
            <component :is="getCategoryIcon(cat)" class="h-4 w-4" />
            <span class="capitalize">{{ cat.replace('-', ' ') }}</span>
          </NuxtLink>
        </div>
      </nav>
    </div>

    <!-- Footer / Theme Toggle -->
    <div class="border-t p-4">
      <div class="flex items-center justify-between">
        <ThemeToggle />
      </div>
    </div>
  </aside>
  </div>
</template>
