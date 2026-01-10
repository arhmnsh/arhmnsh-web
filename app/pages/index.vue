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
        <div class="flex items-center gap-6 pt-2">
          <a 
            href="https://x.com/arhmnsh" 
            target="_blank" 
            class="group flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            <span class="text-sm">arhmnsh</span>
          </a>
          <a 
            href="https://instagram.com/harleynkd" 
            target="_blank" 
            class="group flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            <span class="text-sm">harleynkd</span>
          </a>
          <a 
            href="https://youtube.com/@harleynkd" 
            target="_blank" 
            class="group flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            <span class="text-sm">@harleynkd</span>
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
