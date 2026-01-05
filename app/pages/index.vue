<script setup lang="ts">
import { format, parseISO } from 'date-fns'

const { data: latestArticles } = await useAsyncData('latest-articles', () => 
  queryCollection('articles')
    .order('date', 'DESC')
    .limit(3)
    .all()
)
</script>

<template>
  <div class="mx-auto max-w-4xl px-8 py-16">
    <div class="flex flex-col gap-12">
      <!-- Intro / Bio -->
      <section class="flex flex-col gap-4">
        <h1 class="font-serif text-5xl font-bold italic tracking-tight lg:text-7xl">
          AbdurRahaman Shah
        </h1>
        <p class="max-w-xl text-xl leading-relaxed text-muted-foreground">
          CTO at <a href="https://nabeh.sa" target="_blank" class="font-medium text-foreground underline decoration-muted-foreground/30 underline-offset-4 hover:decoration-muted-foreground">Nabeh</a>, 
          a subsidiary of <a href="https://master-works.sa" target="_blank" class="font-medium text-foreground underline decoration-muted-foreground/30 underline-offset-4 hover:decoration-muted-foreground">Master Works</a>. 
          <br /><br />
          We work on AI products with technologies like computer vision, LLM, STT, etc.
        </p>
      </section>

      <hr class="border-muted" />

      <!-- Latest Articles Section -->
      <section class="flex flex-col gap-6">
        <h2 class="text-2xl font-bold font-serif italic">Latest Articles</h2>
        <div v-if="latestArticles && latestArticles.length > 0" class="flex flex-col gap-4">
          <NuxtLink
            v-for="article in latestArticles"
            :key="article.path"
            :to="{ path: article.path, query: { c: article.categories?.[0] } }"
            class="group flex flex-col gap-1 rounded-xl border p-5 transition-all hover:bg-muted/50 hover:border-foreground/20"
          >
            <div class="flex items-center justify-between gap-4">
              <h3 class="font-bold group-hover:underline decoration-muted-foreground/30 underline-offset-4">{{ article.title }}</h3>
              <span class="shrink-0 text-xs text-muted-foreground">
                {{ format(parseISO(article.date), "d MMM yyyy") }}
              </span>
            </div>
            <p v-if="article.description" class="text-sm text-muted-foreground line-clamp-2 mt-1">
              {{ article.description }}
            </p>
          </NuxtLink>
        </div>
        <NuxtLink to="/articles" class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors self-start">
          View all articles →
        </NuxtLink>
      </section>
    </div>
  </div>
</template>
