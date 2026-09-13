<script setup lang="ts">
import { ArrowUpRight, ArrowRight, Plus } from 'lucide-vue-next'
import { formatDate } from '~/utils/date'

usePageSeo({ title: 'AbdurRahaman Shah', description: 'CTO, engineer and designer in Riyadh. Building AI products for airports, cities, and teams. Writing, books, and photography.' })
const { data: latestArticles } = await useAsyncData('latest-articles', () => queryCollection('articles').select('path', 'title', 'date', 'description', 'categories', 'readTime').order('date', 'DESC').limit(3).all())
const { data: latestShayris } = await useAsyncData('latest-shayris', () => queryCollection('shayris').select('path', 'title', 'author').order('date', 'DESC').limit(3).all())
const projects = [
  { name: 'Baseer TMS', field: 'Aviation · Operations', description: 'Aircraft turnaround management with real-time event tracking and predictive analytics. Deployed at Riyadh Airport.', icon: '↗' },
  { name: 'Baseer Builder', field: 'AI · No-code', description: 'A no-code and low-code platform for building AI use cases. Deployed at Eastern Province Municipality in Dammam.', icon: '⌘' },
  { name: 'Baseer GPT', field: 'AI · Knowledge', description: 'An internal knowledge platform with retrieval-augmented generation, contextual conversations, and semantic search.', icon: '✳' },
  { name: 'Baseer STT', field: 'Language · Speech', description: 'Speech-to-text for local Arabic dialects, with speaker and sentiment analysis.', icon: '≋' },
  { name: 'Altanfeethi', field: 'Aviation · Experience', description: 'Passenger journey analytics for airport VIP terminals.', icon: '⌁' }
]
const personalProjects = [
  { name: 'Salaf Sayings', href: 'https://salafsayings.arhmn.sh', description: 'Sayings from the early generations.', mark: 'S' },
  { name: 'Athkar', href: 'https://athkar.arhmn.sh', description: 'Daily remembrances.', mark: 'A' }
]
</script>
<template>
  <div class="home-page">
    <section class="home-intro" aria-labelledby="intro-title">
      <div><h1 id="intro-title">Engineer & designer.<br /><span>Building thoughtful things.</span></h1><p>AI products, engineering teams, and a few things in between.</p></div>
      <div class="intro-aside"><span>Based in Riyadh</span><a href="mailto:hi@arhmn.sh">Say hello <ArrowUpRight :size="14" aria-hidden="true" /></a></div>
    </section>

    <CollectionRail />

    <div class="home-index">
      <section class="work-section" aria-labelledby="work-title">
        <h2 id="work-title" class="section-label">Selected work</h2>
        <details v-for="project in projects" :key="project.name" class="project-row">
          <summary><span>{{ project.name }}<small>{{ project.field }}</small></span><Plus :size="16" aria-hidden="true" /></summary>
          <p>{{ project.description }}</p>
        </details>
        <div class="side-projects"><a v-for="project in personalProjects" :key="project.name" :href="project.href" target="_blank" rel="noopener noreferrer">{{ project.name }} <ArrowUpRight :size="14" aria-hidden="true" /><span class="sr-only">Opens in a new tab.</span></a></div>
      </section>
      <div class="home-notes">
        <section v-if="latestArticles?.length" aria-labelledby="writing-title">
          <div class="section-heading"><h2 id="writing-title" class="section-label">Recent writing</h2><NuxtLink to="/articles" aria-label="All articles">All <ArrowRight :size="14" aria-hidden="true" /></NuxtLink></div>
          <NuxtLink v-for="article in latestArticles" :key="article.path" :to="article.path" class="writing-entry"><div><h3>{{ article.title }}</h3><time :datetime="article.date">{{ formatDate(article.date) }}</time></div><ArrowUpRight :size="15" aria-hidden="true" /></NuxtLink>
        </section>
        <section v-if="latestShayris?.length" class="poetry-section" aria-labelledby="poetry-title"><div class="section-heading"><h2 id="poetry-title" class="section-label">A little poetry</h2><NuxtLink to="/shayris" aria-label="All poems">All <ArrowRight :size="14" aria-hidden="true" /></NuxtLink></div><NuxtLink v-for="poem in latestShayris.slice(0, 2)" :key="poem.path" :to="poem.path" class="writing-entry"><div><h3>{{ poem.title }}</h3><span class="poem-author">{{ poem.author }}</span></div><ArrowUpRight :size="15" aria-hidden="true" /></NuxtLink></section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-page { --page-gutter: max(28px, calc((100vw - 1160px) / 2)); padding-block: 80px 90px; }
.home-intro { display: flex; justify-content: space-between; align-items: flex-end; gap: 2rem; margin-inline: var(--page-gutter); }
h1 { font-size: clamp(25px, 2.6vw, 36px); font-weight: 450; line-height: 1.35; letter-spacing: -.045em; }
h1 span { color: var(--studio-muted); }
.home-intro p { margin-top: 20px; max-width: 30rem; font-size: 13px; line-height: 1.8; color: var(--studio-muted); }
.intro-aside { display: flex; flex-direction: column; align-items: flex-end; flex-shrink: 0; font-size: 12px; color: var(--studio-muted); }
.intro-aside a { display: inline-flex; gap: 10px; align-items: center; min-height: 44px; color: hsl(var(--foreground)); }
.home-index { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(3rem, 9vw, 9rem); margin-inline: var(--page-gutter); }
.section-label { font-size: 12px; font-weight: 400; color: var(--studio-muted); }
.work-section > .section-label { min-height: 44px; display: flex; align-items: center; }
.section-heading { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.section-heading a { display: flex; align-items: center; gap: 8px; min-height: 44px; font-size: 11px; color: var(--studio-muted); }
.project-row, .writing-entry { border-bottom: 1px solid var(--studio-line); }
.project-row summary { display: flex; align-items: center; justify-content: space-between; gap: 1rem; min-height: 80px; padding-block: 17px; list-style: none; font-size: 15px; }
.project-row summary::-webkit-details-marker { display: none; }
.project-row summary small { display: block; margin-top: 5px; font-size: 11px; color: var(--studio-muted); }
.project-row summary svg { color: var(--studio-muted); transition: transform .2s; }
.project-row[open] summary svg { transform: rotate(45deg); }
.project-row p { padding: 0 25px 22px 0; color: var(--studio-muted); font-size: 13px; line-height: 1.8; }
.side-projects { display: flex; flex-wrap: wrap; gap: 12px 25px; padding-top: 22px; }
.side-projects a { display: inline-flex; align-items: center; gap: 8px; min-height: 44px; font-size: 12px; }
.writing-entry { display: flex; align-items: center; justify-content: space-between; gap: 20px; min-height: 80px; padding-block: 17px; }
.writing-entry h3 { font-size: 14px; line-height: 1.6; font-weight: 400; }
.writing-entry time, .poem-author { display: block; margin-top: 5px; color: var(--studio-muted); font-size: 11px; }
.writing-entry svg { flex-shrink: 0; color: var(--studio-muted); transition: transform .2s; }
.poetry-section { margin-top: 38px; }
@media (hover: hover) and (pointer: fine) { .writing-entry:hover svg { transform: translate(2px,-2px); } .project-row summary:hover, a:hover { color: var(--studio-muted); } }
.project-row summary:active, .writing-entry:active { opacity: .6; }
@media (max-width: 700px) {
  .home-page { --page-gutter: 24px; padding-block: 44px 55px; }
  .home-intro { align-items: flex-start; flex-direction: column; gap: 14px; }
  .home-intro p { max-width: 300px; margin-top: 16px; font-size: 12px; }
  .intro-aside { width: 100%; flex-direction: row; align-items: center; justify-content: space-between; font-size: 11px; }
  .home-index { grid-template-columns: 1fr; gap: 44px; }
}
</style>
