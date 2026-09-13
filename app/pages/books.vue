<script setup lang="ts">
import { MoveUpRight } from 'lucide-vue-next'
import type { ShelfBook } from '~/utils/bookAppearance'
usePageSeo({ title: 'Books', description: 'A personal library of biographies, design, technology, faith, and fiction. Pick up a book, turn it over, and read a note from my shelf.' })
const { data: booksData } = await useAsyncData('books', () => queryCollection('books').all())
const books = computed(() => (booksData.value?.[0]?.meta?.body || []) as ShelfBook[])
</script>

<template>
  <div class="personal-library studio-page">
    <header class="library-header">
      <div>

        <h1 class="page-title">Books</h1>
        <p class="page-description">Books I’ve read that shaped my thinking.</p>

      </div>

    </header>
    <div class="library-toolbar">
      <p><span class="library-dot" aria-hidden="true" />{{ books.length }} books</p>
      <p class="shelf-instruction">Select a book <MoveUpRight :size="14" aria-hidden="true" /></p>
    </div>
    <div class="library-room">
      <BookShelf v-if="books.length" :books="books" />
      <p v-else class="library-empty">The first books will be on the shelf soon.</p>
    </div>

  </div>
</template>

<style scoped>
.personal-library { --library-ink:hsl(var(--foreground)); --library-muted:var(--studio-muted); --library-faint:var(--studio-muted); }
.library-header { display:flex; align-items:center; justify-content:space-between; gap:32px; margin-bottom:40px; }
.library-header .eyebrow { margin-bottom:16px; }
.library-header .page-title { max-width:760px; }
.library-header em { font-family:var(--font-serif); font-weight:400; }
.library-header .page-description { max-width:540px; }
.library-stamp { flex-shrink:0; display:flex; align-items:center; gap:12px; color:var(--studio-accent); border:1px solid var(--studio-line); border-radius:14px; padding:16px 19px; transform:rotate(4deg); background:var(--studio-paper); box-shadow:0 2px 2px rgb(37 40 27 / 4%); }
.library-stamp span { font:italic 15px/1.4 var(--font-serif); }
.library-toolbar { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px 24px; padding:0 0 18px; font-size:12px; color:var(--studio-muted); }
.library-toolbar p { display:flex; align-items:center; gap:9px; margin:0; }
.library-dot { width:6px; height:6px; border-radius:50%; background:var(--studio-accent); }
.library-room { overflow:hidden; padding:8px 0 0; background:transparent; }
.library-footnote { margin:24px 0 0; color:var(--studio-muted); text-align:center; font:italic 14px/1.5 var(--font-serif); }
.library-empty { padding:60px 24px; text-align:center; color:var(--studio-muted); }
@media(max-width:700px) { .library-header { margin-bottom:28px; } .library-stamp { display:none; } .library-room { padding:4px 0 0; border-radius:14px; } .library-toolbar { gap:8px; } .shelf-instruction { font-size:11px; } }
</style>
