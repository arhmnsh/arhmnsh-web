<script setup lang="ts">
/*
  3-column layout implementation:
  1. Sidebar (Fixed)
  2. Main Content (Flexible)
     Inside Main Content, pages like /articles/[category] will further split into ArticleList + ArticleContent
*/
</script>

<template>
  <div class="flex min-h-screen bg-background font-sans text-foreground">
    <NuxtLoadingIndicator color="#888" :height="2" />
    <Sidebar />
    <div class="flex flex-1 flex-col ml-0 lg:ml-64 min-w-0 w-full pb-14 lg:pb-0">
      <MobileNav />
      <div class="flex-1 min-w-0 w-full">
        <slot />
      </div>
    </div>
    <CommandMenu />
    <BottomTabBar />
  </div>
</template>

