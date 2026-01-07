<script setup lang="ts">
import { Sun, Moon, ArrowLeft } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const slug = computed(() => route.params.slug as string)

const colorMode = useColorMode()
const toggleTheme = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

const { data: article } = await useAsyncData(`article-${slug.value}`, () => 
  queryCollection('articles').path(route.path).first()
)
const readingTime = computed(() => {
  const body = article.value?.body as any
  if (!body?.children) return '1 MIN READ'
  const text = JSON.stringify(body)
  const estWords = text.length / 10 
  const min = Math.ceil(estWords / 200)
  return `${min} MINUTE READ`
})

const goBack = () => {
  const category = route.query.c
  router.push(category ? `/articles?c=${category}` : '/articles')
}
</script>

<template>
  <div v-if="article" class="w-full max-w-3xl mx-auto px-4 sm:px-6 py-8 lg:py-16">
    <!-- Mobile Back Button -->
    <button 
      @click="goBack"
      class="lg:hidden flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 -ml-1"
    >
      <ArrowLeft class="h-4 w-4" />
      <span class="text-sm">Back</span>
    </button>

    <!-- Header Area -->
    <header class="mb-16 flex flex-col items-center text-center">
      <!-- Meta Row (Date & Read Time & Theme Toggle) -->
      <div class="mb-6 flex w-full items-center justify-between font-sans text-xs font-bold tracking-widest text-muted-foreground uppercase">
        <span>{{ new Date(article.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }}</span>
        <div class="flex items-center gap-4">
          <span>{{ readingTime }}</span>
          <button 
            @click="toggleTheme"
            class="p-1 hover:text-foreground transition-colors hidden lg:block"
            aria-label="Toggle Theme"
          >
            <Sun v-if="colorMode.value === 'dark'" class="h-4 w-4" />
            <Moon v-else class="h-4 w-4" />
          </button>
        </div>
      </div>

      <!-- Title -->
      <h1 class="mb-6 font-sans text-4xl font-bold uppercase tracking-tight lg:text-5xl lg:leading-[1.1]">
        {{ article.title }}
      </h1>

      <!-- Description / Subtitle -->
      <p v-if="article.description" class="font-serif text-xl leading-relaxed text-muted-foreground lg:text-2xl">
        {{ article.description }}
      </p>
    </header>

    <!-- Content -->
    <article class="prose prose-lg prose-neutral dark:prose-invert max-w-none font-serif leading-loose prose-headings:font-sans prose-headings:font-bold prose-headings:tracking-tight prose-h2:text-center prose-h3:text-center prose-h2:mt-12 prose-h2:mb-6">
      <ContentRenderer :value="article" />
    </article>
  </div>
  <div v-else class="flex h-full items-center justify-center text-muted-foreground">
    <p>Article not found</p>
  </div>
</template>
