<script setup lang="ts">
const route = useRoute()
const tag = computed(() => route.query.t as string | undefined)
const author = computed(() => route.query.a as string | undefined)

const { data: allShayris } = await useAsyncData('shayris-index-redirect', () =>
  queryCollection('shayris').order('date', 'DESC').all()
)

const latest = computed(() => {
  const entries = allShayris.value || []
  if (author.value) {
    return entries.find((shayri: any) => shayri.author === author.value)
  }
  if (tag.value) {
    return entries.find((shayri: any) => shayri.tags?.includes(tag.value))
  }
  return entries[0]
})

if (latest.value) {
  await navigateTo({
    path: latest.value.path,
    query: author.value ? { a: author.value } : tag.value ? { t: tag.value } : {}
  }, { replace: true })
}
</script>

<template>
  <div class="flex min-h-[60vh] items-center justify-center px-6 text-center">
    <div v-if="latest" class="text-muted-foreground">
      <p>Opening latest shayri...</p>
    </div>
    <div v-else class="max-w-md">
      <p class="font-serif text-3xl text-foreground">No shayris yet.</p>
      <p class="mt-3 text-sm leading-relaxed text-muted-foreground">
        New shayris will appear here soon.
      </p>
    </div>
  </div>
</template>
