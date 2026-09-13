<script setup lang="ts">
import { ArrowUpRight } from 'lucide-vue-next'
import { workProjects, sideProjects } from '~/data/projects'
usePageSeo({ title: 'Work', description: 'AI products for airports and cities built with the team at Baseer, followed by a few personal side projects.' })
</script>

<template>
  <div class="studio-page work-page">
    <h1 class="page-title">Work</h1>
    <p class="page-description">Products built with the team at Baseer in Riyadh, then a few things made on my own. Screens will follow; for now, the short version of each.</p>
    <ol class="project-list">
      <li v-for="(project, index) in [...workProjects, ...sideProjects]" :key="project.name" class="project" :class="{ 'project-personal': index === workProjects.length }">
        <span class="project-glyph" aria-hidden="true">{{ project.glyph }}</span>
        <div class="project-body">
          <h2><a v-if="project.href" :href="project.href" target="_blank" rel="noopener noreferrer">{{ project.name }} <ArrowUpRight :size="15" aria-hidden="true" /><span class="sr-only">Opens in a new tab.</span></a><template v-else>{{ project.name }}</template> <span>{{ project.field }}</span></h2>
          <p>{{ project.description }}</p>
          <ul v-if="project.notes.length" class="project-notes"><li v-for="note in project.notes" :key="note">{{ note }}</li></ul>
        </div>
        <img v-if="project.image" :src="project.image" :alt="`${project.name} screens`" class="project-image" loading="lazy" />
      </li>
    </ol>
  </div>
</template>

<style scoped>
.project-list { margin: 2.5rem 0 0; padding: 0; list-style: none; }
.project { display: grid; grid-template-columns: 3.5rem minmax(0, 1fr); gap: 1rem 1.25rem; padding: 1.6rem 0; border-top: 1px solid var(--studio-line); }
.project-glyph { display: grid; place-items: center; width: 3.5rem; height: 3.5rem; border-radius: 1rem; background: hsl(var(--foreground) / .05); font-size: 1.6rem; font-weight: 200; line-height: 1; }
.project h2 { display: flex; flex-wrap: wrap; align-items: baseline; gap: .3rem .9rem; font-size: 1.15rem; font-weight: 500; letter-spacing: -.015em; }
.project h2 span { color: var(--studio-muted); font-size: .8rem; font-weight: 300; }
.project h2 a { display: inline-flex; align-items: center; gap: .3rem; }
.project h2 a svg { color: var(--studio-muted); }
/* A wider gap marks where the personal projects begin. */
.project-personal { margin-top: 2.25rem; border-top-width: 1px; }
.project-personal::before { content: 'On the side'; grid-column: 1 / -1; margin-top: -2.9rem; font-size: .75rem; letter-spacing: .04em; text-transform: uppercase; color: var(--studio-muted); }
.project p { max-width: 42rem; margin-top: .6rem; color: hsl(var(--foreground) / .8); font-size: .95rem; font-weight: 300; line-height: 1.6; }
.project-notes { display: flex; flex-wrap: wrap; gap: .4rem 1.1rem; margin-top: .9rem; padding: 0; list-style: none; color: var(--studio-muted); font-size: .8rem; font-weight: 300; }
.project-image { grid-column: 1 / -1; width: 100%; border-radius: 1rem; }
@media (max-width: 600px) { .project { grid-template-columns: 2.75rem minmax(0, 1fr); } .project-glyph { width: 2.75rem; height: 2.75rem; font-size: 1.3rem; } }
</style>
