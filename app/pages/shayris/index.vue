<script setup lang="ts">
const pageQuery = usePageQuery()
const tag = computed(() => typeof pageQuery.value.t === 'string' ? pageQuery.value.t : '')
const author = computed(() => typeof pageQuery.value.a === 'string' ? pageQuery.value.a : '')
const { data: allShayris } = await useAsyncData('poetry-index', () =>
  queryCollection('shayris').order('date', 'DESC').order('title', 'ASC').all()
)
const tags = computed(() => [...new Set((allShayris.value || []).flatMap(item => item.tags))].sort())
const authors = computed(() => [...new Set((allShayris.value || []).map(item => item.author))].sort())
const navigationQuery = computed(() => ({ ...(tag.value ? { t: tag.value } : {}), ...(author.value ? { a: author.value } : {}) }))
const poems = computed(() => (allShayris.value || []).filter(item =>
  (!author.value || item.author.toLowerCase() === author.value.toLowerCase()) &&
  (!tag.value || item.tags.some(name => name.toLowerCase() === tag.value.toLowerCase()))
))
function changeFilter(key: 't' | 'a', event: Event) {
  const query = { ...navigationQuery.value, [key]: (event.target as HTMLSelectElement).value || undefined }
  return navigateTo({ path: '/shayris', query })
}
usePageSeo({
  title: 'Poetry',
  description: 'Browse poems by author and theme, with word meanings alongside the reading.',
  noindex: () => !allShayris.value?.length,
})
</script>

<template>
  <div class="mx-auto w-full max-w-4xl px-5 py-10 sm:px-8 lg:py-16">
    <header class="mb-8">
      <h1 class="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl">Poetry</h1>
      <p class="max-w-xl leading-relaxed text-muted-foreground">{{ allShayris?.length ? 'Browse the collection by author and theme.' : 'This collection is still in preparation.' }}</p>
    </header>
    <div v-if="!allShayris?.length" class="rounded-xl border border-border p-6 sm:p-8">
      <h2 class="text-xl font-medium">A little space for words</h2>
      <p class="mt-3 max-w-xl leading-relaxed text-muted-foreground">There are no published poems here yet. In the meantime, explore my writing or the books on my shelf.</p>
      <div class="mt-6 flex flex-wrap gap-5 text-sm">
        <NuxtLink to="/articles" class="underline underline-offset-4">Read the articles</NuxtLink>
        <NuxtLink to="/books" class="underline underline-offset-4">Visit the bookshelf</NuxtLink>
      </div>
    </div>
    <template v-else>
      <nav aria-label="Poetry navigation" class="mb-6"><NuxtLink to="/shayris/explore" class="text-sm underline underline-offset-4">Explore themes and authors</NuxtLink></nav>
      <form class="mb-8 grid gap-4 sm:grid-cols-2" @submit.prevent>
        <label class="text-sm font-medium" for="poetry-author">Author
          <select id="poetry-author" :value="author" class="mt-2 block w-full rounded-md border border-border bg-background px-3 py-3 font-normal text-foreground" @change="changeFilter('a', $event)">
            <option value="">All authors</option><option v-for="name in authors" :key="name" :value="name">{{ name }}</option>
            <option v-if="author && !authors.includes(author)" :value="author">{{ author }}</option>
          </select>
        </label>
        <label class="text-sm font-medium" for="poetry-theme">Theme
          <select id="poetry-theme" :value="tag" class="mt-2 block w-full rounded-md border border-border bg-background px-3 py-3 font-normal text-foreground" @change="changeFilter('t', $event)">
            <option value="">All themes</option><option v-for="name in tags" :key="name" :value="name">{{ name }}</option>
            <option v-if="tag && !tags.includes(tag)" :value="tag">{{ tag }}</option>
          </select>
        </label>
      </form>
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
        <p aria-live="polite">{{ poems.length }} {{ poems.length === 1 ? 'poem' : 'poems' }} · Newest first</p>
        <NuxtLink v-if="tag || author" to="/shayris" class="underline underline-offset-4">Clear filters</NuxtLink>
      </div>
      <p v-if="!poems.length" class="rounded-lg border border-border p-6 text-muted-foreground">No poems match these filters. Try another author or theme.</p>
      <ul v-else class="divide-y divide-border border-y border-border">
        <li v-for="poem in poems" :key="poem.path">
          <NuxtLink :to="{ path: poem.path, query: navigationQuery }" class="group block rounded-sm py-6">
            <h2 class="font-serif text-2xl font-medium group-hover:underline underline-offset-4">{{ poem.title }}</h2>
            <p class="mt-2 text-sm text-muted-foreground">By {{ poem.author }} · <time :datetime="dateTime(poem.date)">{{ formatDate(poem.date) }}</time></p>
            <p v-if="poem.description" class="mt-3 text-sm leading-relaxed text-muted-foreground">{{ poem.description }}</p>
            <p v-if="poem.tags.length" class="mt-3 text-xs text-muted-foreground">{{ poem.tags.join(' · ') }}</p>
          </NuxtLink>
        </li>
      </ul>
    </template>
  </div>
</template>
