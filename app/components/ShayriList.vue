<script setup lang="ts">
import { format, parseISO } from 'date-fns'

defineProps<{
  title: string
  query: Record<string, string>
  shayris: Array<{
    path: string
    title: string
    date: string
    author: string
    tags: string[]
  }>
}>()

const route = useRoute()

const isShayriActive = (shayriPath: string) => route.path === shayriPath
</script>

<template>
  <div class="flex h-full flex-col">
    <div class="flex min-h-16 items-center border-b border-muted px-6">
      <h2 class="text-lg font-semibold uppercase tracking-wider text-muted-foreground capitalize">{{ title }}</h2>
    </div>
    <div class="flex-1 overflow-y-auto">
      <div v-if="shayris.length === 0" class="p-6 text-sm text-muted-foreground">
        No shayris found.
      </div>
      <div v-else class="flex flex-col">
        <NuxtLink
          v-for="shayri in shayris"
          :key="shayri.path"
          :to="{ path: shayri.path, query }"
          :class="cn(
            'flex flex-col gap-2 px-6 py-4 text-sm transition-colors border-b border-muted hover:bg-muted/30',
            isShayriActive(shayri.path) ? 'bg-muted/50' : ''
          )"
        >
          <div class="flex items-start justify-between gap-3">
            <span class="font-medium leading-tight line-clamp-2">{{ shayri.title }}</span>
            <span class="shrink-0 text-xs text-muted-foreground font-mono">
              {{ format(parseISO(shayri.date), "d MMM yyyy") }}
            </span>
          </div>
          <span class="text-xs uppercase tracking-[0.16em] text-muted-foreground/70">{{ shayri.author }}</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
