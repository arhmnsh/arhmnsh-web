<script setup lang="ts">
defineProps<{ authors: string[], tags: string[], selectedAuthors: string[], selectedTags: string[] }>()
const emit = defineEmits<{ toggle: [key: 'a' | 't', value: string], clear: [] }>()
</script>

<template>
  <div class="space-y-8">
    <fieldset v-for="group in [{ title: 'Authors', key: 'a' as const, options: authors, selected: selectedAuthors }, { title: 'Tags', key: 't' as const, options: tags, selected: selectedTags }]" :key="group.key">
      <legend class="mb-3 text-sm font-semibold">{{ group.title }}</legend>
      <label v-for="name in group.options" :key="name" class="flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-2 text-sm hover:bg-muted/50">
        <input type="checkbox" :checked="group.selected.includes(name)" class="h-4 w-4 shrink-0 accent-sky-600" @change="emit('toggle', group.key, name)" />
        <span>{{ name }}</span>
      </label>
    </fieldset>
    <button v-if="selectedAuthors.length || selectedTags.length" class="min-h-11 text-sm underline underline-offset-4" @click="emit('clear')">Clear filters</button>
  </div>
</template>
