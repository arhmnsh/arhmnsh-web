<script setup lang="ts">
import type { ShelfBook } from '~/utils/bookAppearance'
usePageSeo({ title: 'Books', description: 'A personal library of biographies, design, technology, faith, and fiction. Pick up a book, turn it over, and read a note from my shelf.' })
const { data: booksData } = await useAsyncData('books', () => queryCollection('books').all())
const books = computed(() => (booksData.value?.[0]?.meta?.body || []) as ShelfBook[])
</script>

<template>
  <div class="personal-library">
    <div class="library-inner">
      <header class="library-header"><div><h1>Books</h1><p class="library-subtitle">Books I’ve read that shaped my thinking.</p></div><span>{{ books.length }} books</span></header>
      <BookShelf v-if="books.length" :books="books" />
      <p v-else class="library-empty">No books yet.</p>
    </div>
  </div>
</template>

<style>
.personal-library {
  --library-ink:#38220f; --library-muted:#563a20; --library-faint:#705233;
  min-height:100vh; color:var(--library-ink);
  background:linear-gradient(90deg,#43250955,transparent 5%,transparent 95%,#43250955),url('/textures/oak.svg'),#c29158;
  box-shadow:inset 8px 0 18px #3c200d55;
}
.dark .personal-library { --library-ink:#f4dbb6; --library-muted:#e0bb89; --library-faint:#c29c6c; background:linear-gradient(#25140866,#25140866),url('/textures/oak.svg'),#80522e; }
</style>
<style scoped>
.library-inner { width:100%; margin:0 auto; padding:0 28px 36px; }
.library-header { display:flex; align-items:center; justify-content:space-between; margin:0 -28px 22px; padding:22px 38px; border-bottom:1px solid #593314; background:linear-gradient(#ffffff25,#2a160025),url('/textures/oak.svg'),#ba8249; box-shadow:inset 0 1px #f9d59b,0 3px 0 #dfb17a,0 7px 14px #40230c66; }
.library-header h1 { margin:0; font:600 27px var(--font-serif); text-shadow:0 1px #f1cfa480; }
.library-subtitle { margin:7px 0 0; font:13px/1.5 var(--font-serif); color:var(--library-muted); }
.library-header > span { flex-shrink:0; margin-left:16px; font-size:12px; text-shadow:0 1px #f1cfa450; }
.library-empty { padding:60px 0; }
@media(max-width:700px) { .library-inner { padding:0 14px 24px; } .library-header { margin:0 -14px 12px; padding:18px 24px; } .library-header h1 { font-size:24px; } }
</style>
