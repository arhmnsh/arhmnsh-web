<script setup lang="ts">
import { Search } from 'lucide-vue-next'
const { isOpen, close } = useSidebar()
const { open: openSearch } = useCommandMenu()
const route = useRoute()
const { data: poems } = await useAsyncData('navigation-poems', () => queryCollection('shayris').select('path').all())
const isMac = ref(true)
const search = async () => { close(); await nextTick(); openSearch() }
watch(() => route.fullPath, close)
let desktop: MediaQueryList | undefined
const handleDesktop = () => { if (desktop?.matches) close() }
onMounted(() => {
  isMac.value = /Mac|iPhone|iPad/.test(navigator.platform)
  desktop = window.matchMedia('(min-width: 1024px)')
  desktop.addEventListener('change', handleDesktop)
})
onUnmounted(() => desktop?.removeEventListener('change', handleDesktop))
</script>

<template>
  <aside class="site-sidebar fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border bg-background lg:flex" aria-label="Site sidebar">
    <div class="flex h-20 items-center px-6"><NuxtLink to="/" class="font-serif text-xl font-bold italic">AbdurRahaman</NuxtLink></div>
    <div class="px-4">
      <button type="button" class="flex min-h-11 w-full items-center justify-between gap-2 rounded-md px-3 text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground" aria-label="Search this site" aria-haspopup="dialog" @click="search"><span class="flex items-center gap-2"><Search class="h-4 w-4" aria-hidden="true" />Search this site</span><kbd class="text-xs" aria-hidden="true">{{ isMac ? '⌘' : 'Ctrl' }} K</kbd></button>
    </div>
    <div class="flex-1 overflow-y-auto px-4 py-6"><SiteNavigation :has-poems="Boolean(poems?.length)" /></div>
    <div class="border-t border-border p-4"><ThemeToggle /></div>
  </aside>
  <AccessibleDialog v-model:open="isOpen" title="Navigation" close-label="Close navigation">
    <button type="button" class="mb-4 flex min-h-11 w-full items-center gap-3 rounded-md border border-border px-3 text-sm" aria-haspopup="dialog" @click="search"><Search class="h-4 w-4" aria-hidden="true" />Search this site</button>
    <SiteNavigation :has-poems="Boolean(poems?.length)" @navigate="close" />
  </AccessibleDialog>
</template>
