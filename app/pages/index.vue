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
  <div class="mx-auto max-w-3xl px-6 py-12 lg:py-20">
    <div class="flex flex-col gap-12">
      <!-- Intro / Bio -->
      <section class="flex flex-col gap-6">
        <h1 class="font-serif text-4xl font-bold italic tracking-tight lg:text-6xl">
          AbdurRahaman Shah
        </h1>
        <p class="max-w-xl text-lg leading-relaxed text-muted-foreground">
          CTO & AI Engineer building intelligent products at <a href="https://nabeh.sa" target="_blank" class="text-foreground underline decoration-muted-foreground/30 underline-offset-4 hover:decoration-muted-foreground">Nabeh</a>.
        </p>
        <p class="max-w-xl text-base leading-relaxed text-muted-foreground">
          Working on AI products with computer vision, LLMs, and speech technologies. Passionate about building tools that make a difference.
        </p>
        <p class="max-w-xl text-sm leading-relaxed text-muted-foreground/70">
          When not coding: cars, motorcycles, travel, painting, and stargazing.
        </p>
        <div class="flex items-center gap-4">
          <a 
            href="https://x.com/arhmnsh" 
            target="_blank" 
            class="text-sm text-muted-foreground hover:text-foreground transition-colors"
            title="Twitter / X"
          >
            𝕏
          </a>
          <a 
            href="https://instagram.com/harleynkd" 
            target="_blank" 
            class="text-sm text-muted-foreground hover:text-foreground transition-colors"
            title="Instagram"
          >
            Instagram
          </a>
          <a 
            href="https://youtube.com/@harleynkd" 
            target="_blank" 
            class="text-sm text-muted-foreground hover:text-foreground transition-colors"
            title="YouTube"
          >
            YouTube
          </a>
        </div>
      </section>

      <!-- Latest Articles Section -->
      <section class="flex flex-col gap-6">
        <h2 class="text-lg font-semibold uppercase tracking-wider text-muted-foreground">Latest Articles</h2>
        <div v-if="latestArticles && latestArticles.length > 0" class="flex flex-col">
          <NuxtLink
            v-for="article in latestArticles"
            :key="article.path"
            :to="{ path: article.path, query: { c: article.categories?.[0] } }"
            class="group flex flex-col gap-2 py-5 border-b border-muted/50 transition-all last:border-0 hover:bg-transparent"
          >
            <div class="flex flex-col gap-1">
              <div class="flex items-center justify-between gap-4">
                <h3 class="font-medium text-base group-hover:underline decoration-muted-foreground/30 underline-offset-4">{{ article.title }}</h3>
                <span class="shrink-0 text-xs text-muted-foreground/60 font-mono">
                  {{ format(parseISO(article.date), "dd MMM yyyy") }}
                </span>
              </div>
              <p v-if="article.description" class="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {{ article.description }}
              </p>
            </div>
          </NuxtLink>
        </div>
        <NuxtLink to="/articles" class="text-sm text-muted-foreground hover:text-foreground transition-colors self-start">
          View all articles →
        </NuxtLink>
      </section>
    </div>
  </div>
</template>
