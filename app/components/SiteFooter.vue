<template>
  <footer class="site-footer"><span>© {{ new Date().getFullYear() }} AbdurRahaman Shah</span><nav aria-label="Social links"><a href="mailto:hi@arhmn.sh">Email</a><a href="https://github.com/arhmnsh" target="_blank" rel="noopener noreferrer">GitHub<span class="sr-only"> (opens in a new tab)</span></a><a href="https://x.com/arhmnsh" target="_blank" rel="noopener noreferrer">X<span class="sr-only"> (opens in a new tab)</span></a><a href="/rss.xml">RSS</a></nav></footer>
</template>
<style scoped>
.site-footer { margin-inline: max(28px, calc((100vw - 1160px) / 2)); padding: 28px 0 max(35px, env(safe-area-inset-bottom)); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: .5rem 2rem; color: var(--studio-muted); font-size: 11px; }
nav { display: flex; gap: 24px; } a { display: inline-flex; align-items: center; min-height: 44px; } a:hover { color: hsl(var(--foreground)); }
@media (max-width: 700px) { .site-footer { margin-inline: 24px; padding-top: 15px; font-size: 10px; } }
</style>
