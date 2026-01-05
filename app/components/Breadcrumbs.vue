<script setup lang="ts">
import { ChevronRight, Home } from 'lucide-vue-next'

const route = useRoute()

interface BreadcrumbItem {
  label: string
  path: string
  icon?: any
}

const breadcrumbs = computed(() => {
  const items: BreadcrumbItem[] = [
    { label: 'Home', path: '/', icon: Home }
  ]

  const path = route.path

  if (path.startsWith('/articles')) {
    items.push({ label: 'Articles', path: '/articles' })
    
    const category = route.query.c as string
    if (category) {
      items.push({ 
        label: category.replace(/-/g, ' '), 
        path: `/articles?c=${category}` 
      })
    }
    
    // If viewing an actual article
    if (route.params.slug) {
      // In a real app we might fetch the title, but for now we can slugify or use a placeholder
      items.push({ 
        label: 'Article', 
        path: route.path 
      })
    }
  } else if (path.startsWith('/bookmarks')) {
    items.push({ label: 'Bookmarks', path: '/bookmarks' })
    const tag = route.query.tag as string
    if (tag) {
      items.push({ label: `#${tag}`, path: `/bookmarks?tag=${tag}` })
    }
  }

  return items
})
</script>

<template>
  <nav class="flex items-center gap-1.5 px-4 h-12 border-b bg-background/50 backdrop-blur-md sticky top-16 z-40 lg:hidden overflow-x-auto whitespace-nowrap">
    <div v-for="(item, index) in breadcrumbs" :key="item.path" class="flex items-center gap-1.5 shrink-0">
      <NuxtLink 
        :to="item.path"
        class="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
      >
        <component v-if="item.icon" :is="item.icon" class="h-3 w-3" />
        <span class="capitalize">{{ item.label }}</span>
      </NuxtLink>
      <ChevronRight v-if="index < breadcrumbs.length - 1" class="h-3 w-3 text-muted-foreground/50" />
    </div>
  </nav>
</template>
