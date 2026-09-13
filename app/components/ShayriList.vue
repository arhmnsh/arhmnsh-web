<script setup lang="ts">

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
  <section class="compact-poetry-list" :aria-label="title">
    <div class="compact-poetry-heading"><h2>{{ title }}</h2><span>{{ shayris.length }}</span></div>
    <div class="compact-poetry-scroll"><p v-if="shayris.length === 0" class="compact-poetry-empty">No poems found.</p><ul v-else><li v-for="shayri in shayris" :key="shayri.path"><NuxtLink :to="{ path: shayri.path, query }" :aria-current="isShayriActive(shayri.path) ? 'page' : undefined" class="compact-poem"><span class="compact-poem-title">{{ shayri.title }}</span><span class="compact-poem-author">{{ shayri.author }}</span><time :datetime="dateTime(shayri.date)">{{ formatDate(shayri.date) }}</time></NuxtLink></li></ul></div>
  </section>
</template>

<style scoped>
.compact-poetry-list { display: flex; flex-direction: column; height: 100%; }
.compact-poetry-heading { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 24px; border-bottom: 1px solid var(--studio-line); }
.compact-poetry-heading h2 { font-size: 11px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; }
.compact-poetry-heading > span { font-size: 11px; color: hsl(var(--muted-foreground)); }
.compact-poetry-scroll { flex: 1; overflow-y: auto; }
.compact-poetry-empty { padding: 24px; color: hsl(var(--muted-foreground)); font-size: 13px; }
.compact-poem { display: flex; flex-direction: column; gap: 9px; padding: 24px; border-bottom: 1px solid var(--studio-line); transition: background .2s; }
.compact-poem:hover, .compact-poem[aria-current="page"] { background: var(--studio-paper); }
.compact-poem[aria-current="page"] { box-shadow: inset 3px 0 var(--studio-accent); }
.compact-poem-title { font: 19px/1.4 Georgia, serif; }
.compact-poem-author { color: var(--studio-accent); font-size: 11px; }
.compact-poem time { font-size: 10px; color: hsl(var(--muted-foreground)); }
</style>
