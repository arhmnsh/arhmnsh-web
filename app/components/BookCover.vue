<script setup lang="ts">
defineProps<{ src: string }>()
</script>
<template>
  <span class="cover-surface" aria-hidden="true">
    <img class="cover-art" :src="src" alt="" width="240" height="360" decoding="async" />
    <span class="cover-grain" /><span class="cover-gutter" /><span class="cover-light" />
  </span>
</template>
<style scoped>
.cover-surface { position:absolute; inset:0; display:block; border-radius:inherit; }
.cover-art { width: 100%; height: 100%; object-fit: contain; background: #f5f3ed; border-radius: inherit; display: block; backface-visibility: hidden; }
.cover-gutter { position: absolute; inset: 0 auto 0 0; width: 9%; border-radius: 2px 0 0 2px; background: linear-gradient(90deg,#0005,#fff3 18%,#0001 30%,#0004 48%,#fff2 66%,transparent); }
.cover-grain { position: absolute; inset: 0; border-radius: inherit; opacity: .22; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 150 150' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Cpath fill='%23fff' filter='url(%23n)' opacity='.3' d='M0 0h150v150H0z'/%3E%3C/svg%3E"); mix-blend-mode: soft-light; }
.cover-light { position: absolute; inset: 0; border-radius: inherit; background: linear-gradient(115deg,#fff3 0%,#fff0 36%,#fff0 62%,#0002 100%); box-shadow: inset 0 1px 1px #fff5,inset -1px -1px 1px #0005; }
</style>
