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
  <div class="flex h-full items-center justify-center text-muted-foreground">
    <p>Opening latest shayri...</p>
  </div>
</template>
