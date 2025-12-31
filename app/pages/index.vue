<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'
</script>

<template>
  <div class="mx-auto max-w-4xl px-8 py-16">
    <div class="flex flex-col gap-8">
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
        <div class="flex items-center gap-4 pt-4">
          <NuxtLink
            to="/articles/ai"
            class="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            Read Articles
            <ArrowRight class="h-4 w-4" />
          </NuxtLink>
          <NuxtLink
            to="/about"
            class="inline-flex items-center gap-2 rounded-full border px-6 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            About Me
          </NuxtLink>
        </div>
      </section>

      <hr class="my-8 border-muted" />

      <!-- Featured Section -->
      <section class="grid gap-8 md:grid-cols-2">
        <div class="flex flex-col gap-4 rounded-xl border p-6 transition-colors hover:bg-muted/50">
          <h3 class="text-xl font-bold">Nabeh AI</h3>
          <p class="text-sm text-muted-foreground">
            Building the next generation of enterprise AI solutions using State-of-the-Art models.
          </p>
          <div class="mt-auto flex flex-col gap-2 pt-4">
             <a href="https://nabeh.sa" target="_blank" class="text-sm font-medium underline-offset-4 hover:underline">Visit Nabeh →</a>
          </div>
        </div>

        <div class="flex flex-col gap-4 rounded-xl border p-6 transition-colors hover:bg-muted/50">
          <h3 class="text-xl font-bold">Latest Articles</h3>
          <div class="flex flex-col gap-3">
            <NuxtLink to="/articles/ai/gemini-3-updates" class="group">
              <span class="block text-sm font-medium group-hover:underline">5 Gemini 3.0 Updates That Actually Matter</span>
              <span class="text-xs text-muted-foreground">Dec 16, 2025</span>
            </NuxtLink>
            <div class="h-px bg-muted" />
            <NuxtLink to="/articles/ai" class="text-sm text-muted-foreground hover:text-foreground">
              View all articles →
            </NuxtLink>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
