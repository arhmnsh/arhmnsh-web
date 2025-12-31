<script setup lang="ts">
/*
  This page renders the individual article.
  The parent layout `pages/articles/[category].vue` already renders the list.
  This component is rendered inside the <NuxtPage /> slot of the parent.
*/
const route = useRoute()
const { data: article } = await useAsyncData(route.path, () => 
  queryCollection('articles').path(route.path).first()
)
</script>

<template>
  <div v-if="article">
    <div class="mb-8">
      <h1 class="font-serif text-4xl font-bold leading-tight lg:text-5xl">{{ article.title }}</h1>
      <p class="mt-4 text-sm text-muted-foreground">{{ new Date(article.date).toLocaleDateString() }}</p>
    </div>
    <article class="prose prose-zinc dark:prose-invert max-w-none">
      <ContentRenderer :value="article" />
    </article>
  </div>
  <div v-else class="flex h-full items-center justify-center text-muted-foreground">
    Article not found.
  </div>
</template>
