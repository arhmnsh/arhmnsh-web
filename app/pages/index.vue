<script setup lang="ts">
usePageSeo({ title: 'AbdurRahaman Shah', description: 'Engineer and designer in Riyadh. Founder and former CTO of Baseer, where the team built AI products for airports and cities. Writing, books, photographs, and poetry.' })
</script>

<template>
  <div class="studio-page intro-page">
    <h1 class="page-title">Introduction</h1>
    <div class="intro-scene">
      <div class="intro-text">
        <p class="intro-lead">Hello. I’m AbdurRahaman Shah, an engineer and designer based in Riyadh.</p>
        <p>I founded Baseer and led it as CTO. There, the team built AI products for airports, cities, and the people who run them: aircraft turnaround management, no-code AI tooling, knowledge systems, and speech recognition for Arabic dialects. I have since moved on from that role and am figuring out what to build next.</p>
        <p>Outside of work I write about building software with AI, read biographies and design books, photograph whatever I am near, and collect Urdu poetry.</p>
        <nav class="intro-links" aria-label="Contact links">
          <a href="mailto:hi@arhmn.sh">Email</a>
          <a href="https://x.com/arhmnsh" target="_blank" rel="noopener noreferrer">X<span class="sr-only"> (opens in a new tab)</span></a>
          <a href="https://github.com/arhmnsh" target="_blank" rel="noopener noreferrer">GitHub<span class="sr-only"> (opens in a new tab)</span></a>
          <a href="/rss.xml">RSS</a>
        </nav>
      </div>
      <SkydivePhoto class="intro-photo" />
    </div>
  </div>
</template>

<style scoped>
.intro-scene { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); gap: clamp(2rem, 5vw, 4rem); align-items: center; padding-top: .5rem; }
.intro-text { font-size: var(--ui-size); font-weight: 300; line-height: 1.5; }
.intro-text p { margin: 0 0 1em; }
.intro-lead { font-size: 1.35em; font-weight: 400; letter-spacing: -.02em; line-height: 1.3; }
.intro-links { display: flex; flex-direction: column; margin-top: 1.6em; color: var(--studio-muted); }
.intro-links a { padding: .15em 0; min-height: 2em; display: inline-flex; align-items: center; transition: color 200ms; }
.intro-links a:hover { color: hsl(var(--foreground)); }
@media (max-width: 760px) { .intro-scene { grid-template-columns: 1fr; } .intro-photo { order: -1; } }
</style>
