<script setup lang="ts">
defineProps<{ authors: string[], tags: string[], selectedAuthors: string[], selectedTags: string[] }>()
const emit = defineEmits<{ toggle: [key: 'a' | 't', value: string], clear: [] }>()
</script>

<template>
  <div class="poetry-filters">

    <fieldset v-for="group in [{ title: 'Authors', key: 'a' as const, options: authors, selected: selectedAuthors }, { title: 'Themes', key: 't' as const, options: tags, selected: selectedTags }]" :key="group.key">
      <legend>{{ group.title }} <span>{{ group.options.length }}</span></legend>
      <p v-if="!group.options.length" class="filter-empty">Coming with the first poems.</p>
      <label v-for="name in group.options" :key="name" class="poetry-filter-option" :class="{ selected: group.selected.includes(name) }"><input type="checkbox" :checked="group.selected.includes(name)" @change="emit('toggle', group.key, name)" /><span>{{ name }}</span></label>
    </fieldset>
    <button v-if="selectedAuthors.length || selectedTags.length" type="button" class="text-link clear-filters" @click="emit('clear')">Clear all filters</button>
  </div>
</template>

<style scoped>
.filter-intro { margin-bottom: 32px; }
.filter-intro .eyebrow { font-size: 9px; margin-bottom: 12px; }
.filter-intro > p:last-child { font: italic 23px/1.35 Georgia, serif; letter-spacing: -.03em; }
fieldset + fieldset { margin-top: 28px; }
legend { width: 100%; display: flex; justify-content: space-between; font-size: 11px; font-weight: 600; padding-bottom: 12px; border-bottom: 1px solid var(--studio-line); margin-bottom: 8px; }
legend span { font-weight: 400; color: hsl(var(--muted-foreground)); }
.poetry-filter-option { min-height: 44px; display: flex; align-items: center; gap: 11px; padding: 8px 5px; cursor: pointer; font-size: 12px; line-height: 1.5; color: hsl(var(--muted-foreground)); transition: color .2s; }
.poetry-filter-option input { flex: 0 0 auto; width: 15px; height: 15px; accent-color: var(--studio-accent); cursor: pointer; }
.poetry-filter-option:hover, .poetry-filter-option.selected { color: var(--studio-accent); }
.filter-empty { font-size: 12px; line-height: 1.6; color: hsl(var(--muted-foreground)); }
.clear-filters { margin-top: 24px; }
</style>
