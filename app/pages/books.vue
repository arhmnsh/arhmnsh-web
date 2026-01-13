<script setup lang="ts">
import { Book } from 'lucide-vue-next'

// Fetch books using Nuxt Content
const { data: booksData } = await useAsyncData('books', () => 
  queryCollection('books').all()
)

// Extract the actual books array from meta.body
const books = computed(() => {
  if (!booksData.value || booksData.value.length === 0) return []
  // Nuxt Content v3 stores JSON arrays in meta.body
  return (booksData.value[0]?.meta?.body || []) as any[]
})
</script>

<template>
  <div class="flex h-full">
    <!-- Main Content -->
    <div class="flex-1 overflow-y-auto">
      <div class="max-w-[1800px] mx-auto px-6 sm:px-8 py-10 lg:py-16">
        <!-- Header -->
        <header class="mb-10">
          <h1 class="font-sans text-3xl font-bold uppercase tracking-tight mb-2">
            Books
          </h1>
          <p class="font-serif text-muted-foreground text-lg">
            Books that shaped how I think.
          </p>
        </header>

        <!-- Bookshelf -->
        <BookShelf :books="books" />
        
        <!-- Empty state -->
        <div v-if="books.length === 0" class="text-center py-20">
          <Book class="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p class="font-serif text-muted-foreground">No books added yet.</p>
        </div>
      </div>
    </div>
  </div>
</template>
