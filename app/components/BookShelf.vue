<script setup lang="ts">
interface Book {
  id: string
  title: string
  author: string
  cover: string
  review: string
  purchaseUrl: string
}

const props = defineProps<{
  books: any[]
}>()

const focusedBookId = ref<string | null>(null)

const handleFocus = (id: string) => {
  focusedBookId.value = id
}

const handleBlur = () => {
  focusedBookId.value = null
}
</script>

<template>
  <div class="relative">
    <!-- Backdrop Overlay -->
    <div
      class="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] transition-opacity duration-500 pointer-events-auto"
      :class="{ 'opacity-100': focusedBookId, 'opacity-0 pointer-events-none': !focusedBookId }"
      @click="handleBlur"
    ></div>

    <!-- Books Grid -->
    <div class="relative grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-10 gap-y-16 sm:gap-x-14 mb-24">
      <BookItem
        v-for="book in books"
        :key="book.id"
        :book="book"
        :is-focused="focusedBookId === book.id"
        @focus="handleFocus(book.id)"
        @blur="handleBlur"
      />
    </div>

    <!-- Empty state -->
    <div v-if="books.length === 0" class="text-center py-16 text-muted-foreground">
      <p class="font-serif text-lg">No books yet.</p>
    </div>
  </div>
</template>

<style scoped>
.bookshelf {
  /* Subtle shelf styling without wooden texture */
}
</style>
