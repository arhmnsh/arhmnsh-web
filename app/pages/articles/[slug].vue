<script setup lang="ts">
const route = useRoute()
const slug = computed(() => route.params.slug as string)

const { data: article } = await useAsyncData(`article-${slug.value}`, () => 
  queryCollection('articles').path(route.path).first()
)
</script>

<template>
  <div v-if="article" class="mx-auto max-w-3xl">
    <div class="mb-8">
      <h1 class="mb-2 text-4xl font-bold">{{ article.title }}</h1>
      <p class="text-sm text-muted-foreground">
        {{ new Date(article.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }}
      </p>
    </div>
    <div class="prose prose-neutral dark:prose-invert max-w-none">
      <ContentRenderer :value="article" />
    </div>
  </div>
  <div v-else class="flex h-full items-center justify-center text-muted-foreground">
    <p>Article not found</p>
  </div>
</template>
