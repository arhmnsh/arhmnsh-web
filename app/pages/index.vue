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
  <div class="mx-auto max-w-4xl px-6 py-12 lg:py-24">
    <div class="flex flex-col gap-8 lg:gap-12">
      <!-- Intro / Bio -->
      <section class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <!-- Left: Text Content -->
        <!-- ... content omitted ... -->
        
        <!-- Right: Image -->
        <div class="order-1 lg:order-2">
          <div class="relative w-full aspect-square rounded-xl overflow-hidden bg-muted/20">
            <img src="/images/me.jpg" alt="AbdurRahaman Shah" class="w-full h-full object-cover lg:grayscale transform-gpu transition-all duration-500 ease-out hover:scale-[1.02] lg:hover:grayscale-0 will-change-transform" />
          </div>
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
