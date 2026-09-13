<template>
  <footer class="site-footer"><nav aria-label="Social links"><a href="mailto:hi@arhmn.sh">Email</a><a href="https://github.com/arhmnsh" target="_blank" rel="noopener noreferrer">GitHub<span class="sr-only"> (opens in a new tab)</span></a><a href="https://x.com/arhmnsh" target="_blank" rel="noopener noreferrer">X<span class="sr-only"> (opens in a new tab)</span></a><a href="/rss.xml">RSS</a></nav></footer>
</template>
<style scoped>
.site-footer { display: flex; align-items: center; justify-content: flex-end; flex-wrap: wrap; gap: .5rem 2rem; padding: 2rem var(--frame-x) max(2.5rem, env(safe-area-inset-bottom)); color: var(--studio-muted); font-size: calc(var(--ui-size) * .75); font-weight: 300; }
nav { display: flex; gap: 1.5rem; } a { display: inline-flex; align-items: center; min-height: 44px; transition: color 200ms; } a:hover { color: hsl(var(--foreground)); }
</style>
