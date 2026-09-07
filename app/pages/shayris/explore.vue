<script setup lang="ts">
const { data: allShayris } = await useAsyncData('poetry-index', () =>
  queryCollection('shayris').order('date', 'DESC').order('title', 'ASC').all()
)
function countEntries(values: string[]) {
  const counts = new Map<string, number>()
  for (const name of values) counts.set(name, (counts.get(name) || 0) + 1)
  return [...counts].map(([name, count]) => ({ name, count })).sort((a, b) => a.name.localeCompare(b.name))
}
const tags = computed(() => countEntries((allShayris.value || []).flatMap(item => item.tags)))
const authors = computed(() => countEntries((allShayris.value || []).map(item => item.author)))
usePageSeo({
  title: 'Explore poetry',
  description: 'Find poems by theme or author in the poetry collection.',
  noindex: () => !allShayris.value?.length,
})
</script>

<template>
  <div class="mx-auto w-full max-w-4xl px-5 py-10 sm:px-8 lg:py-16">
    <NuxtLink to="/shayris" class="mb-8 inline-block text-sm text-muted-foreground underline underline-offset-4">Browse all poetry</NuxtLink>
    <header class="mb-10"><h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">Themes and authors</h1></header>
    <div v-if="!allShayris?.length" class="rounded-xl border border-border p-6 sm:p-8">
      <p class="leading-relaxed text-muted-foreground">The poetry collection is still in preparation. Themes and authors will appear as poems are published.</p>
      <div class="mt-6 flex flex-wrap gap-5 text-sm">
        <NuxtLink to="/articles" class="underline underline-offset-4">Read the articles</NuxtLink>
        <NuxtLink to="/books" class="underline underline-offset-4">Visit the bookshelf</NuxtLink>
      </div>
    </div>
    <div v-else class="grid gap-10 sm:grid-cols-2">
      <section aria-labelledby="poetry-themes">
        <h2 id="poetry-themes" class="mb-4 text-lg font-medium">Themes</h2>
        <p v-if="!tags.length" class="text-sm text-muted-foreground">No themes have been added yet.</p>
        <ul class="divide-y divide-border">
          <li v-for="entry in tags" :key="entry.name">
            <NuxtLink :to="{ path: '/shayris', query: { t: entry.name } }" class="flex items-center justify-between gap-3 rounded-sm py-4 hover:underline underline-offset-4">
              <span>{{ entry.name }}</span><span class="text-sm text-muted-foreground">{{ entry.count }} {{ entry.count === 1 ? 'poem' : 'poems' }}</span>
            </NuxtLink>
          </li>
        </ul>
      </section>
      <section aria-labelledby="poetry-authors">
        <h2 id="poetry-authors" class="mb-4 text-lg font-medium">Authors</h2>
        <ul class="divide-y divide-border">
          <li v-for="entry in authors" :key="entry.name">
            <NuxtLink :to="{ path: '/shayris', query: { a: entry.name } }" class="flex items-center justify-between gap-3 rounded-sm py-4 hover:underline underline-offset-4">
              <span>{{ entry.name }}</span><span class="text-sm text-muted-foreground">{{ entry.count }} {{ entry.count === 1 ? 'poem' : 'poems' }}</span>
            </NuxtLink>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>
