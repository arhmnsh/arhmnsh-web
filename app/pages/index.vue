<script setup lang="ts">
import { ArrowUpRight, ArrowRight, Mail, Github, Rss } from 'lucide-vue-next'
import { formatDate } from '~/utils/date'

usePageSeo({ title: 'AbdurRahaman Shah', description: 'CTO, engineer and designer in Riyadh. Building AI products for airports, cities, and teams. Writing, books, and photography.' })
const { data: latestArticles } = await useAsyncData('latest-articles', () => queryCollection('articles').order('date', 'DESC').limit(3).all())
const { data: latestShayris } = await useAsyncData('latest-shayris', () => queryCollection('shayris').order('date', 'DESC').limit(3).all())
const projects = [
  { name: 'Baseer TMS', description: 'Aircraft turnaround management with real-time event tracking and predictive analytics. Deployed at Riyadh Airport.' },
  { name: 'Baseer Builder', description: 'A no-code and low-code platform for building AI use cases. Deployed at Eastern Province Municipality in Dammam.' },
  { name: 'Baseer GPT', description: 'An internal knowledge platform with retrieval-augmented generation, contextual conversations, and semantic search.' },
  { name: 'Baseer STT', description: 'Speech-to-text for local Arabic dialects, with speaker and sentiment analysis.' },
  { name: 'Altanfeethi', description: 'Passenger journey analytics for airport VIP terminals.' }
]
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-10 sm:px-10 lg:py-16">
    <section class="grid items-start gap-8 sm:gap-12 xl:grid-cols-[1.2fr_1fr]" aria-labelledby="intro-title">
      <div>
        <p class="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Engineer · designer</p>
        <h1 id="intro-title" class="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">AbdurRahaman Shah</h1>
        <p class="mt-6 max-w-xl font-serif text-lg leading-relaxed text-muted-foreground sm:text-xl">I build AI products and lead the teams behind them. Based in Riyadh, my work spans airport operations, tools for cities, and language systems.</p>
        <p class="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">Away from the keyboard: cars, motorcycles, travel, photography, painting, and astronomy.</p>
        <div class="mt-7 flex flex-wrap items-center gap-5 text-sm font-medium">
          <a href="#projects" class="inline-flex min-h-11 items-center gap-2">Explore my work <ArrowRight class="h-4 w-4" aria-hidden="true" /></a>
          <NuxtLink to="/articles" class="inline-flex min-h-11 items-center gap-2 text-muted-foreground hover:text-foreground">Read my writing <ArrowRight class="h-4 w-4" aria-hidden="true" /></NuxtLink>
          <a href="mailto:hi@arhmn.sh" class="inline-flex min-h-11 items-center gap-2 text-muted-foreground hover:text-foreground"><Mail class="h-4 w-4" aria-hidden="true" />Get in touch</a>
        </div>
      </div>
      <figure class="max-w-xl">
        <SkydivePhoto />

      </figure>
    </section>

    <section id="projects" class="mt-16 scroll-mt-24 border-t border-border pt-10 sm:mt-20" aria-labelledby="work-title">
      <h2 id="work-title" class="text-2xl font-semibold tracking-tight">Projects</h2>
      <ul class="mt-5 divide-y divide-border">
        <li v-for="project in projects" :key="project.name" class="py-6">
          <h3 class="text-lg font-medium">{{ project.name }}</h3>
          <p class="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{{ project.description }}</p>

        </li>
      </ul>
    </section>

    <section class="mt-14 border-t border-border pt-10" aria-labelledby="personal-projects-title">
      <h2 id="personal-projects-title" class="text-xl font-semibold tracking-tight">Personal projects</h2>
      <div class="mt-5 divide-y divide-border">
        <a href="https://salafsayings.arhmn.sh" target="_blank" rel="noopener noreferrer" class="block py-5 hover:text-foreground"><span class="flex items-center justify-between gap-4 font-medium">Salaf Sayings <ArrowUpRight class="h-4 w-4" aria-hidden="true" /></span><p class="mt-2 text-sm leading-relaxed text-muted-foreground">A collection of sayings from the early generations.</p><span class="sr-only">Opens in a new tab.</span></a>
        <a href="https://athkar.arhmn.sh" target="_blank" rel="noopener noreferrer" class="block py-5 hover:text-foreground"><span class="flex items-center justify-between gap-4 font-medium">Athkar <ArrowUpRight class="h-4 w-4" aria-hidden="true" /></span><p class="mt-2 text-sm leading-relaxed text-muted-foreground">Daily remembrances in a focused reading experience.</p><span class="sr-only">Opens in a new tab.</span></a>
      </div>
    </section>

    <section v-if="latestArticles?.length" class="mt-14 border-t border-border pt-10" aria-labelledby="writing-title">
      <div class="flex flex-wrap items-center justify-between gap-4"><h2 id="writing-title" class="text-2xl font-semibold tracking-tight">Latest writing</h2><a href="/rss.xml" class="inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><Rss class="h-4 w-4" aria-hidden="true" />RSS feed</a></div>
      <div class="mt-3 divide-y divide-border">
        <NuxtLink v-for="article in latestArticles" :key="article.path" :to="article.path" class="group block py-5">
          <div class="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"><h3 class="font-medium group-hover:underline underline-offset-4">{{ article.title }}</h3><time :datetime="article.date" class="shrink-0 text-xs text-muted-foreground">{{ formatDate(article.date) }}</time></div>
          <p v-if="article.description" class="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{{ article.description }}</p>
        </NuxtLink>
      </div>
      <NuxtLink to="/articles" class="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-medium">View all articles <ArrowRight class="h-4 w-4" aria-hidden="true" /></NuxtLink>
    </section>

    <section class="mt-14 border-t border-border pt-10" aria-labelledby="elsewhere-title">
      <h2 id="elsewhere-title" class="text-xl font-semibold tracking-tight">Beyond work</h2>
      <div class="mt-5 grid gap-5 sm:grid-cols-2">
        <NuxtLink to="/books" class="rounded-lg border border-border p-5 hover:bg-muted/40"><h3 class="font-medium">On my bookshelf</h3><p class="mt-2 text-sm leading-relaxed text-muted-foreground">Books on design, technology, faith, and the people who build things.</p></NuxtLink>
        <NuxtLink to="/gallery" class="rounded-lg border border-border p-5 hover:bg-muted/40"><h3 class="font-medium">Through my lens</h3><p class="mt-2 text-sm leading-relaxed text-muted-foreground">Photography, rides, and moments along the way.</p></NuxtLink>
      </div>
    </section>

    <section v-if="latestShayris?.length" class="mt-14 border-t border-border pt-10" aria-labelledby="poetry-title">
      <h2 id="poetry-title" class="text-xl font-semibold">From the poetry collection</h2>
      <NuxtLink v-for="shayri in latestShayris" :key="shayri.path" :to="shayri.path" class="mt-4 block py-2"><span class="font-medium">{{ shayri.title }}</span><span class="ml-3 text-sm text-muted-foreground">{{ shayri.author }}</span></NuxtLink>
      <NuxtLink to="/shayris" class="mt-3 inline-flex min-h-11 items-center gap-2 text-sm">Browse all shayris <ArrowRight class="h-4 w-4" aria-hidden="true" /></NuxtLink>
    </section>

    <footer class="mt-14 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border pt-7 text-sm text-muted-foreground">
      <a href="mailto:hi@arhmn.sh" class="inline-flex min-h-11 items-center gap-2 hover:text-foreground"><Mail class="h-4 w-4" aria-hidden="true" />hi@arhmn.sh</a>
      <a href="https://github.com/arhmnsh" target="_blank" rel="noopener noreferrer" class="inline-flex min-h-11 items-center gap-2 hover:text-foreground"><Github class="h-4 w-4" aria-hidden="true" />GitHub<span class="sr-only"> (opens in a new tab)</span></a>
      <a href="https://x.com/arhmnsh" target="_blank" rel="noopener noreferrer" class="inline-flex min-h-11 items-center hover:text-foreground">X / arhmnsh<span class="sr-only"> (opens in a new tab)</span></a>
    </footer>
  </div>
</template>
