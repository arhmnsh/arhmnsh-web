<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'
const props = defineProps<{ error: { statusCode?: number, statusMessage?: string } }>()
const notFound = computed(() => props.error.statusCode === 404)
useSeoMeta({ title: () => `${notFound.value ? 'Page not found' : 'Something went wrong'} · AbdurRahaman Shah`, robots: 'noindex, follow' })
</script>
<template>
  <main class="error-page">
    <a href="/" class="error-brand" aria-label="AbdurRahaman Shah, home">as<span>.</span></a>
    <div class="error-note"><p class="error-number" aria-hidden="true">{{ error.statusCode || 500 }}<span>↗</span></p><h1>{{ notFound ? 'Page not found' : 'Something went wrong' }}</h1><p class="sr-only">{{ notFound ? 'Page not found' : 'Something went wrong' }}</p><p class="error-description">{{ notFound ? 'Check the address or return home.' : 'The page could not be loaded. Please try again or return home.' }}</p><div class="error-actions"><a href="/" class="tactile-button">Back to home <ArrowRight class="h-4 w-4" aria-hidden="true" /></a><a href="/articles/" class="text-link">Articles</a></div><span class="error-corner" aria-hidden="true" /></div>
    <p class="error-footnote">AbdurRahaman Shah · A personal space on the internet</p>
  </main>
</template>

<style scoped>
.error-page { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100dvh; padding: 40px 24px; background: hsl(var(--background)); color: hsl(var(--foreground)); }
.error-brand { align-self: flex-start; width: min(100%, 650px); margin: 0 auto 40px; font-size: 32px; font-weight: 700; letter-spacing: -.08em; }
.error-brand span { color: var(--studio-accent); }
.error-note { position: relative; max-width: 650px; width: 100%; padding: clamp(28px, 5vw, 60px); border: 1px solid var(--studio-line); border-radius: 4px 4px 35px 4px; background: var(--studio-paper); box-shadow: 4px 5px 0 -1px hsl(var(--background)), 4px 5px 0 0 var(--studio-line), 0 15px 50px -35px #1c3e2955; }
.error-number { display: flex; align-items: center; gap: 32px; margin: 12px 0 16px; font-size: clamp(90px, 20vw, 160px); letter-spacing: -.08em; line-height: 1; font-weight: 500; color: var(--studio-accent); }
.error-number span { font-family: Georgia, serif; font-size: .5em; }
.error-note h1 { font-size: clamp(26px, 4vw, 37px); font-weight: 500; letter-spacing: -.045em; }
.error-description { max-width: 420px; font-size: 14px; line-height: 1.8; margin-top: 18px; color: hsl(var(--muted-foreground)); }
.error-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 18px 26px; margin-top: 30px; }
.error-corner { position: absolute; right: 0; bottom: 0; width: 32px; height: 32px; border-top-left-radius: 5px; border-top: 1px solid var(--studio-line); border-left: 1px solid var(--studio-line); background: linear-gradient(135deg, hsl(var(--background)), var(--studio-paper)); }
.error-footnote { max-width: 650px; width: 100%; margin-top: 28px; font-size: 10px; color: hsl(var(--muted-foreground)); line-height: 1.7; }
</style>
