<script setup lang="ts">
/*
  3-column layout implementation:
  1. Sidebar (Fixed)
  2. Main Content (Flexible)
     Inside Main Content, pages like /articles/[category] will further split into ArticleList + ArticleContent
*/
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-background font-sans text-foreground">
    <Sidebar />
    <div class="flex flex-1 flex-col overflow-hidden lg:ml-64">
      <MobileNav />
      <Breadcrumbs />
      <div class="flex-1 overflow-hidden">
        <slot />
      </div>
    </div>
    <CommandMenu />
  </div>
</template>
