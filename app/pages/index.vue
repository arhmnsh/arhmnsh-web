<script setup lang="ts">
const { data: allArticles } = await useAsyncData('recent-articles', () =>
  queryCollection('articles')
    .select('path', 'title', 'date')
    .order('date', 'DESC')
    .order('title', 'ASC')
    .all()
)

const recentArticles = computed(() => (allArticles.value || []).slice(0, 3))

usePageSeo({ title: 'AbdurRahaman Shah', description: 'Engineer and designer in Riyadh. Founder and former CTO of Baseer, where the team built AI products for airports and cities. Writing, books, photographs, and poetry.' })
</script>

<template>
  <div class="studio-page intro-page">
    <h1 class="page-title">Introduction</h1>
    <div class="intro-scene">
      <div class="intro-text">
        <p class="intro-lead">Hello. I’m AbdurRahaman Shah, an engineer and designer based in Riyadh.</p>
        <p>I technically founded Baseer AI and led it as CTO. There, the team built AI products for airports, cities, and the people who run them: aircraft turnaround management, no-code AI tooling, knowledge systems, and speech recognition for Arabic dialects. I have since moved on from that role and am figuring out what to build next.</p>
        <p>Outside of work I write about building software with AI, read books, photograph whatever I am near, and collect poetry.</p>
        <nav class="intro-links" aria-label="Contact links">
          <a href="mailto:hi@arhmn.sh" class="back-pill">Email</a>
          <a href="https://x.com/arhmnsh" target="_blank" rel="noopener noreferrer" class="back-pill">X<span class="sr-only"> (opens in a new tab)</span></a>
          <a href="https://github.com/arhmnsh" target="_blank" rel="noopener noreferrer" class="back-pill">GitHub<span class="sr-only"> (opens in a new tab)</span></a>
          <a href="/rss.xml" class="back-pill">RSS</a>
        </nav>
      </div>
      <div class="intro-photo"><SkydivePhoto /></div>
    </div>
    <section v-if="recentArticles.length" class="recent-writing" aria-labelledby="recent-writing-title">
      <div class="recent-writing-heading">
        <h2 id="recent-writing-title">Recent writing</h2>
        <NuxtLink to="/articles" class="recent-writing-index">View all</NuxtLink>
      </div>
      <ul class="recent-writing-list">
        <li v-for="article in recentArticles" :key="article.path">
          <NuxtLink :to="article.path" class="recent-writing-link">
            <time :datetime="dateTime(article.date)">{{ formatDate(article.date, { year: 'numeric', month: 'short', day: 'numeric' }) }}</time>
            <span>{{ article.title }}</span>
          </NuxtLink>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.intro-scene { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); gap: clamp(2rem, 5vw, 4rem); align-items: center; padding-top: .5rem; }
.intro-text { font-size: var(--ui-size); font-weight: 300; line-height: 1.5; }
.intro-text p { margin: 0 0 1em; }
.intro-lead { font-size: 1.35em; font-weight: 400; letter-spacing: -.02em; line-height: 1.3; }
.intro-links { display: flex; flex-wrap: wrap; gap: .5rem; margin-top: 1.8em; }
.intro-photo { min-width: 0; }
.recent-writing { max-width: 880px; margin-top: clamp(4rem, 9vw, 7rem); }
.recent-writing-heading { display: flex; align-items: baseline; justify-content: space-between; gap: 1.5rem; margin-bottom: .8rem; }
.recent-writing-heading h2 { font-size: .8rem; font-weight: 500; letter-spacing: .01em; }
.recent-writing-index { color: var(--studio-muted); font-size: .75rem; transition: color 180ms; }
.recent-writing-index:hover { color: hsl(var(--foreground)); }
.recent-writing-list { border-top: 1px solid var(--studio-line); }
.recent-writing-link { display: grid; grid-template-columns: 8.5rem minmax(0, 1fr); gap: 1.25rem; align-items: baseline; padding: 1rem 0; border-bottom: 1px solid var(--studio-line); color: hsl(var(--foreground)); }
.recent-writing-link time { color: var(--studio-muted); font-size: .72rem; font-variant-numeric: tabular-nums; }
.recent-writing-link span { font-family: var(--font-serif); font-size: clamp(1rem, 1.3vw, 1.15rem); line-height: 1.35; transition: color 180ms; }
.recent-writing-link:hover span { color: var(--studio-muted); }
@media (max-width: 760px) {
  .intro-scene { grid-template-columns: 1fr; gap: 1.6rem; padding-top: 0; }
  .intro-photo { order: -1; margin-inline: calc(-1 * var(--frame-x) + .75rem); }
  .intro-text { font-size: 1.05rem; line-height: 1.55; }
  .intro-lead { font-size: 1.4em; }
  .intro-links { gap: .6rem; }
  .intro-links a { min-height: 2.6rem; padding-inline: 1.1rem; font-size: .95rem; }
  .recent-writing { margin-top: 4rem; }
  .recent-writing-link { grid-template-columns: 1fr; gap: .3rem; padding: .9rem 0; }
}
@media (prefers-reduced-motion: reduce) { .recent-writing-index, .recent-writing-link span { transition: none; } }
</style>
