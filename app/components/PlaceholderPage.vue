<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <div class="flex h-screen flex-col items-center justify-center p-8 text-center text-foreground">
    <h1 class="mb-4 font-serif text-4xl font-bold">{{ title }}</h1>
    <p class="max-w-md text-muted-foreground">
      {{ description || "This page is currently under construction. Check back soon for updates." }}
    </p>
  </div>
</template>
