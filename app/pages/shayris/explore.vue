<script setup lang="ts">
import { PenTool, User } from 'lucide-vue-next'

const { data: allShayris } = await useAsyncData('shayris-explore', () =>
  queryCollection('shayris').order('date', 'DESC').all()
)

const tags = computed(() => {
  if (!allShayris.value) return []
  const counts = new Map<string, number>()
  allShayris.value.forEach((shayri: any) => {
    shayri.tags?.forEach((tag: string) => {
      counts.set(tag, (counts.get(tag) || 0) + 1)
    })
  })
  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name))
})

const authors = computed(() => {
  if (!allShayris.value) return []
  const counts = new Map<string, number>()
  allShayris.value.forEach((shayri: any) => {
    counts.set(shayri.author, (counts.get(shayri.author) || 0) + 1)
  })
  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name))
})
</script>

<template>
  <div class="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 lg:py-16">
    <header class="mb-12">
      <p class="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-muted-foreground">
        Explore Shayris
      </p>
      <h1 class="font-sans text-4xl font-bold uppercase tracking-tight lg:text-5xl">
        Tags & Authors
      </h1>
    </header>

    <div class="grid gap-12 lg:grid-cols-2">
      <section>
        <h2 class="mb-6 text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">Tags</h2>
        <div class="space-y-1">
          <NuxtLink
            v-for="entry in tags"
            :key="entry.name"
            :to="{ path: '/shayris', query: { t: entry.name } }"
            class="group flex items-center justify-between border-b border-muted py-4 transition-colors hover:text-foreground"
          >
            <div class="flex items-center gap-3">
              <PenTool class="h-5 w-5 text-muted-foreground transition-colors group-hover:text-foreground" />
              <span class="font-medium capitalize decoration-muted-foreground/30 underline-offset-4 group-hover:underline">{{ entry.name }}</span>
            </div>
            <span class="font-mono text-sm text-muted-foreground">{{ entry.count }}</span>
          </NuxtLink>
        </div>
      </section>

      <section>
        <h2 class="mb-6 text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">Authors</h2>
        <div class="space-y-1">
          <NuxtLink
            v-for="entry in authors"
            :key="entry.name"
            :to="{ path: '/shayris', query: { a: entry.name } }"
            class="group flex items-center justify-between border-b border-muted py-4 transition-colors hover:text-foreground"
          >
            <div class="flex items-center gap-3">
              <User class="h-5 w-5 text-muted-foreground transition-colors group-hover:text-foreground" />
              <span class="font-medium decoration-muted-foreground/30 underline-offset-4 group-hover:underline">{{ entry.name }}</span>
            </div>
            <span class="font-mono text-sm text-muted-foreground">{{ entry.count }}</span>
          </NuxtLink>
        </div>
      </section>
    </div>
  </div>
</template>
