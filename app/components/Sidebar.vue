<script setup lang="ts">
import {
  Search,
  Home,
  Newspaper,
  Zap,
  GraduationCap,
  Briefcase,
  Monitor,
  LayoutTemplate,
  Wrench,
  Bot,
  ChartNoAxesColumn,
  CodeXml,
  Map,
  Bookmark
} from 'lucide-vue-next'

const route = useRoute()

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
  <aside class="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r bg-muted/30 dark:bg-muted/10">
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
      <nav class="flex flex-col gap-8">
        <!-- Main Links -->
        <div class="flex flex-col gap-1">
          <NuxtLink
            to="/"
            :class="cn(
              'flex items-center gap-3 rounded-md px-2 py-1.5 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground',
              route.path === '/' ? 'bg-muted text-foreground' : 'text-muted-foreground'
            )"
          >
            <Home class="h-4 w-4" />
            <span>Home</span>
          </NuxtLink>
        </div>

        <!-- Mentorship -->
        <div class="flex flex-col gap-1">
          <div class="flex items-center justify-between px-2 py-1 text-xs font-semibold uppercase text-muted-foreground">
             <span>Mentorship</span>
          </div>
          <NuxtLink
            to="/getting-started"
            :class="cn(
              'flex items-center gap-3 rounded-md px-2 py-1.5 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground',
              isActive('/getting-started') ? 'bg-muted text-foreground' : 'text-muted-foreground'
            )"
          >
            <Map class="h-4 w-4" />
            <span>Getting Started</span>
          </NuxtLink>
          <NuxtLink
            to="/courses"
            :class="cn(
              'flex items-center gap-3 rounded-md px-2 py-1.5 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground',
              isActive('/courses') ? 'bg-muted text-foreground' : 'text-muted-foreground'
            )"
          >
            <GraduationCap class="h-4 w-4" />
            <span>Leadership</span>
          </NuxtLink>
           <NuxtLink
            to="/prompts"
            :class="cn(
              'flex items-center gap-3 rounded-md px-2 py-1.5 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground',
              isActive('/prompts') ? 'bg-muted text-foreground' : 'text-muted-foreground'
            )"
          >
            <Zap class="h-4 w-4" />
            <span>AI Prompts</span>
          </NuxtLink>
        </div>

        <!-- Resources -->
        <div class="flex flex-col gap-1">
          <div class="px-2 py-1 text-xs font-semibold uppercase text-muted-foreground">
            Resources
          </div>
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
          <NuxtLink
            to="/academy"
            :class="cn(
              'flex items-center gap-3 rounded-md px-2 py-1.5 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground',
              isActive('/academy') ? 'bg-muted text-foreground' : 'text-muted-foreground'
            )"
          >
            <Monitor class="h-4 w-4" />
            <span>Tech Stack</span>
          </NuxtLink>
          <NuxtLink
            to="/gear"
            :class="cn(
              'flex items-center gap-3 rounded-md px-2 py-1.5 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground',
              isActive('/gear') ? 'bg-muted text-foreground' : 'text-muted-foreground'
            )"
          >
            <Wrench class="h-4 w-4" />
            <span>Gear</span>
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
            :to="`/articles/${cat}`"
            :class="cn(
              'flex items-center gap-3 rounded-md px-2 py-1.5 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground',
              isActive(`/articles/${cat}`) ? 'bg-muted text-foreground' : 'text-muted-foreground'
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
</template>
