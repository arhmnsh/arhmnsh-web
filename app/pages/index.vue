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
    <div class="flex flex-col gap-12">
      <!-- Intro / Bio -->
      <!-- Intro / Bio -->
      <section class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <!-- Left: Text Content -->
        <div class="flex flex-col gap-8 order-2 lg:order-1">
          <div class="flex flex-col gap-5 text-lg leading-relaxed text-muted-foreground/90 font-serif">
            <p>
              <strong class="text-foreground font-sans">AbdurRahaman Shah</strong> is an engineer and designer based in Riyadh, Saudi Arabia. He currently serves as the CTO at <a href="https://nabeh.sa" target="_blank" class="text-foreground underline decoration-muted-foreground/30 underline-offset-4 hover:decoration-muted-foreground">Nabeh</a>, a subsidiary of <a href="https://masterworks.sa" target="_blank" class="text-foreground underline decoration-muted-foreground/30 underline-offset-4 hover:decoration-muted-foreground">Master Works</a>.
            </p>
            <p>
              His work includes building impactful AI products such as:
            </p>
            <ul class="list-none space-y-2 pl-1 text-base">
              <li>
                — <strong class="font-sans text-foreground/80">Baseer TMS</strong> (Turnaround Management System), the first AI TMS deployment in the Middle East at Riyadh Airport. It automates turnaround events with real-time timestamps and predictive analytics.
              </li>
              <li>
                — <strong class="font-sans text-foreground/80">Baseer Builder</strong>, a no-code/low-code platform for building AI use cases, deployed in Eastern Province Municipality (Dammam).
              </li>
              <li>
                — <strong class="font-sans text-foreground/80">Baseer GPT</strong>, an in-house built LLM platform with RAGops, maintaining context and offering semantic search.
              </li>
              <li>
                — <strong class="font-sans text-foreground/80">Baseer STT</strong>, an in-house STT model trained on local Arabic dialects, capable of distinguishing multiple speakers and analyzing sentiment.
              </li>
              <li>
                — <strong class="font-sans text-foreground/80">Passenger Journey Analytics</strong> for Altanfeethi, a VIP terminal in Saudi airports, optimizing the passenger experience.
              </li>
            </ul>
          </div>

          <!-- Social Links (List Style with Icons) -->
          <div class="flex flex-col gap-3 pt-2 text-base font-sans font-medium text-muted-foreground/60">
            <a href="mailto:ar@arhmn.sh" class="flex items-center gap-3 hover:text-foreground transition-colors w-fit group">
              <svg class="h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              <span>ar@arhmn.sh</span>
            </a>
            <a href="https://x.com/arhmnsh" target="_blank" class="flex items-center gap-3 hover:text-foreground transition-colors w-fit group">
              <svg class="h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              <span>arhmnsh</span>
            </a>
            <a href="https://instagram.com/harleynkd" target="_blank" class="flex items-center gap-3 hover:text-foreground transition-colors w-fit group">
              <svg class="h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              <span>harleynkd</span>
            </a>
            <a href="https://youtube.com/@harleynkd" target="_blank" class="flex items-center gap-3 hover:text-foreground transition-colors w-fit group">
              <svg class="h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              <span>harleynkd</span>
            </a>
          </div>
        </div>

        <!-- Right: Image -->
        <div class="order-1 lg:order-2">
          <div class="relative w-full aspect-square rounded-xl overflow-hidden bg-muted/20">
            <img src="/images/me.jpg" alt="AbdurRahaman Shah" class="w-full h-full object-cover grayscale transform-gpu transition-all duration-500 ease-out hover:scale-[1.02] hover:grayscale-0 will-change-transform" />
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
