<script setup lang="ts">
const route = useRoute()
const slug = computed(() => route.params.slug as string)

const { data: article } = await useAsyncData(`article-${slug.value}`, () => 
  queryCollection('articles').path(route.path).first()
)
const readingTime = computed(() => {
  const body = article.value?.body as any
  if (!body?.children) return '1 MIN READ' // Fallback
  // Rough estimate based on JSON body structure or just length
  const text = JSON.stringify(body)
  const estWords = text.length / 10 
  const min = Math.ceil(estWords / 200)
  return `${min} MINUTE READ`
})
</script>

<template>
  <div v-if="article" class="mx-auto max-w-3xl px-6 py-12 lg:py-20">
    <!-- Header Area -->
    <header class="mb-16 flex flex-col items-center text-center">
      <!-- Date Kicker -->
      <div class="mb-6 font-sans text-sm font-bold tracking-widest text-muted-foreground uppercase">
        {{ new Date(article.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }}
      </div>

      <!-- Title -->
      <h1 class="mb-6 font-sans text-4xl font-bold uppercase tracking-tight lg:text-5xl lg:leading-[1.1]">
        {{ article.title }}
      </h1>

      <!-- Description / Subtitle -->
      <p v-if="article.description" class="mb-8 font-serif text-xl leading-relaxed text-muted-foreground lg:text-2xl">
        {{ article.description }}
      </p>

      <!-- Reading Time / Navigation Bar -->
      <div class="flex w-full max-w-lg items-center justify-center border-t border-b py-3 md:justify-between">
         <!-- Placeholder Nav -->
         <span class="hidden text-xs font-bold tracking-widest text-muted-foreground hover:text-foreground cursor-pointer md:block">‹ PREV</span>
         
         <span class="font-sans text-xs font-bold tracking-widest text-muted-foreground uppercase">
           {{ readingTime }}
         </span>

         <span class="hidden text-xs font-bold tracking-widest text-muted-foreground hover:text-foreground cursor-pointer md:block">NEXT ›</span>
      </div>
    </header>

    <!-- Content -->
    <article class="prose prose-lg prose-neutral dark:prose-invert max-w-none font-serif leading-loose prose-headings:font-sans prose-headings:font-bold prose-headings:uppercase prose-headings:tracking-tight hover:prose-a:text-primary">
      <ContentRenderer :value="article" />
    </article>
  </div>
  <div v-else class="flex h-full items-center justify-center text-muted-foreground">
    <p>Article not found</p>
  </div>
</template>
