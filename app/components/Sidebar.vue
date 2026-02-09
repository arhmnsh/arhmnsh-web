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
  BookOpen,
  Car,
  Building2,
  HeartPulse,
  User,
  Cpu,
  Plane,
  PenTool,
  Eye,
  Image
} from 'lucide-vue-next'

const route = useRoute()
const { isOpen, close } = useSidebar()

// Fetch articles once to extract categories (no await to keep component sync)
const { data: articlesForCategories } = useAsyncData('sidebar-categories', () => 
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

// Format category for display - preserve all-caps (AI, LLM), otherwise sentence case
const formatCategory = (cat: string) => {
  // If all uppercase, keep as-is (e.g., AI, LLM)
  if (cat === cat.toUpperCase()) {
    return cat
  }
  // Otherwise apply proper sentence case
  return cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase()
}

const getCategoryIcon = (cat: string) => {
  switch (cat.toLowerCase()) {
    case 'ai': return Bot
    case 'llm': return Bot
    case 'productivity': return ChartNoAxesColumn
    case 'job-search': return Briefcase
    case 'career': return CodeXml
    case 'engineering': return CodeXml
    case 'automotive': return Car
    case 'business': return Building2
    case 'health': return HeartPulse
    case 'personal': return User
    case 'technology': return Cpu
    case 'travel': return Plane
    case 'writing': return PenTool
    case 'learning': return BookOpen
    case 'philosophy': return Eye
    case 'baseer': return Eye
    default: return Newspaper
  }
}

const { open } = useCommandMenu()

const openSearch = () => {
  close() // Close mobile sidebar
  open() // Open command menu
}

const isActive = (path: string) => route.path === path || route.path.startsWith(path + '/')

const isMac = ref(true) // Default to Mac (cmd) for SSR/Hydration match, update on mount
onMounted(() => {
  isMac.value = navigator.platform.toUpperCase().indexOf('MAC') >= 0
})
</script>

<template>
  <!-- Backdrop for mobile -->
    <div 
      v-if="isOpen" 
      class="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm lg:hidden"
      @click="close"
    />

    <aside 
      :class="[
        'fixed left-0 top-0 z-[70] flex h-screen w-64 flex-col border-r border-muted bg-background transition-transform duration-300 ease-in-out lg:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
    >
      <!-- Header / Logo -->
      <div class="flex h-16 items-center px-6">
        <NuxtLink to="/" class="font-serif text-xl font-bold italic tracking-wide">
          AbdurRahaman
        </NuxtLink>
      </div>

    <!-- Search Bar (minimal) -->
    <div class="px-4 py-2">
      <button
        class="flex w-full items-center justify-between px-2 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        @click="openSearch"
      >
        <div class="flex items-center gap-2">
          <Search class="h-4 w-4" />
          <span>Search...</span>
        </div>
        <div class="hidden lg:flex items-center gap-1 text-xs text-muted-foreground/60">
          <kbd class="font-mono text-[10px]">
            {{ isMac ? '⌘' : 'Ctrl' }}
          </kbd>
          <kbd class="font-mono text-[10px]">
            K
          </kbd>
        </div>
      </button>
    </div>

    <!-- Navigation Content -->
    <div class="flex-1 overflow-y-auto px-4 py-4">
      <nav class="flex flex-col gap-6">
        <!-- Main Links -->
        <div class="flex flex-col gap-0.5">
          <NuxtLink
            to="/"
            @click="close"
            :class="cn(
              'flex items-center gap-3 px-2 py-2 text-sm transition-colors hover:text-foreground',
              isActive('/') ? 'text-foreground font-medium' : 'text-muted-foreground'
            )"
          >
            <Home class="h-4 w-4" />
            <span>Home</span>
          </NuxtLink>
          <NuxtLink
            to="/books"
            @click="close"
            :class="cn(
              'flex items-center gap-3 px-2 py-2 text-sm transition-colors hover:text-foreground',
              isActive('/books') ? 'text-foreground font-medium' : 'text-muted-foreground'
            )"
          >
            <BookOpen class="h-4 w-4" />
            <span>Books</span>
          </NuxtLink>
          <NuxtLink
            to="/bookmarks"
            @click="close"
            :class="cn(
              'flex items-center gap-3 px-2 py-2 text-sm transition-colors hover:text-foreground',
              isActive('/bookmarks') ? 'text-foreground font-medium' : 'text-muted-foreground'
            )"
          >
            <Bookmark class="h-4 w-4" />
            <span>Bookmarks</span>
          </NuxtLink>
          <NuxtLink
            to="/gallery"
            @click="close"
            :class="cn(
              'flex items-center gap-3 px-2 py-2 text-sm transition-colors hover:text-foreground',
              isActive('/gallery') ? 'text-foreground font-medium' : 'text-muted-foreground'
            )"
          >
            <Image class="h-4 w-4" />
            <span>Gallery</span>
          </NuxtLink>
        </div>

        <!-- Articles -->
        <div class="flex flex-col gap-0.5">
          <div class="px-2 py-1 text-xs font-medium uppercase tracking-wider text-muted-foreground/60">
            Articles
          </div>
          <NuxtLink
            v-for="cat in dynamicCategories"
            :key="cat"
            :to="{ path: '/articles', query: { c: cat } }"
            @click="close"
            :class="cn(
              'flex items-center gap-3 px-2 py-2 text-sm transition-colors hover:text-foreground',
              route.query.c === cat ? 'text-foreground font-medium' : 'text-muted-foreground'
            )"
          >
            <component :is="getCategoryIcon(cat)" class="h-4 w-4" />
            <span>{{ formatCategory(cat.replace('-', ' ')) }}</span>
          </NuxtLink>
        </div>
      </nav>
    </div>

    <!-- Footer / Theme Toggle -->
    <div class="border-t border-muted p-4">
      <ThemeToggle />
    </div>
  </aside>
</template>
