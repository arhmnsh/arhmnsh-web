/** Static HTML is shared by every query string; apply filters after hydration. */
export function usePageQuery() {
  const route = useRoute()
  const ready = ref(false)
  onMounted(() => { ready.value = true })
  return computed(() => ready.value ? route.query : {})
}
