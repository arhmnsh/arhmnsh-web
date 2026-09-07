<script setup lang="ts">
const props = defineProps<{ error: { statusCode?: number, statusMessage?: string } }>()
const notFound = computed(() => props.error.statusCode === 404)
useSeoMeta({ title: () => `${notFound.value ? 'Page not found' : 'Something went wrong'} · AbdurRahaman Shah`, robots: 'noindex, follow' })
</script>
<template>
  <main class="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6 py-16">
    <p class="text-sm text-muted-foreground">{{ error.statusCode || 500 }}</p>
    <h1 class="mt-3 text-3xl font-bold tracking-tight">{{ notFound ? 'Page not found' : 'Something went wrong' }}</h1>
    <p class="mt-5 font-serif text-lg leading-relaxed text-muted-foreground">{{ notFound ? 'This page may have moved, or the address may be incomplete. You can continue with the latest writing or return home.' : 'The page could not be loaded. Please try again or return home.' }}</p>
    <div class="mt-8 flex flex-wrap gap-6"><a href="/articles/" class="min-h-11 py-3 font-medium underline underline-offset-4">Browse articles</a><a href="/" class="min-h-11 py-3 font-medium underline underline-offset-4">Go home</a></div>
  </main>
</template>
