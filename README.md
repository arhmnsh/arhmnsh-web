# arhmn.sh

AbdurRahaman Shah’s personal website: projects, articles, books, and photographs. Built with Nuxt 4, Nuxt Content, Vue, and Tailwind CSS, and published as static HTML on GitHub Pages.

## Development

```bash
npm ci
npm run dev
```

The development site opens at [localhost:3000](http://localhost:3000). The header lists work, writing, books, photos, about, and search on every page. Poetry and bookmarks appear when those collections contain published entries; their existing URLs remain available while empty.

## Content

- `content/articles/*.md`: articles, discovered automatically for static generation.
- `content/shayris/*.md`: poetry with the original author and optional recording URL.
- `content/books.json`: books, cover paths, notes, and purchase links.
- `content/bookmarks.json`: saved links, descriptions, and tags.
- `content/gallery.json`: photos/videos, captions, thumbnails, and source URLs.
- `public/images/`: local images, book covers, gallery thumbnails, and article sharing cards.

Article frontmatter uses quoted calendar dates and categories:

```markdown
---
title: "Article title"
date: "2026-09-06"
description: "A specific description of what the article covers."
categories: ["AI", "Learning"]
readTime: 4
---

Article content starts here.
```

Use descriptive Markdown links and image alt text. Place article media in `public/images/articles/<slug>/` and reference it as `/images/articles/<slug>/<filename>`. Give video embeds a descriptive title and a visible link to watch on the source site.

Poetry also requires `author` and `tags`; `youtubeUrl` is optional, and `youtubeUrls` can be used for multiple recordings. Set `author` to the actual poet’s name. The poetry index supports author/theme filters and the detail page handles attribution. Publication dates render consistently across time zones.

Search indexes article and poetry text, books, saved links, and gallery captions. Article categories are collected from frontmatter and shown as filters on the article index.

## Book presentation

The bookshelf uses CSS 3D covers. Selecting a book moves, enlarges, and opens one rigid cover into a readable spread in a single 520 ms transition. Closing reverses the same movement. The title page is printed on the inside of the cover, with no extra blank leaf. Cover images are contained so titles and artwork are not cropped. Title, author, purchase link, and the personal reading note live on the book pages. Paper grain, gutter shading, layered edges, and binding shadows give the pages depth. These interior pages are custom presentation elements, not reproductions of the publisher’s interior.

On phones, page controls move between book details and the reading note; the offscreen page is inert for keyboard and assistive technology. The book lifts from its shelf position, opens, then closes and returns on dismissal. Reduced motion, `?book=` links, keyboard dismissal, focus restoration, and purchase links are supported. The reading view uses selectable HTML text and does not require WebGL.

## Page metadata and sharing cards

Pages use `usePageSeo` for titles, descriptions, canonical URLs, Open Graph/Twitter previews, and article structured data. Canonical URLs use `https://www.arhmn.sh/` and trailing slashes. Empty collections have `noindex` metadata and are excluded from the sitemap.

To regenerate article title cards after changing titles or adding articles, run with Python, Pillow, and Georgia/Arial or DejaVu Serif/Sans fonts installed:

```bash
python3 scripts/generate-article-previews.py
```

Commit the generated JPGs in `public/images/articles/` and `scripts/article-previews.json`. The site uses this manifest to select a card and falls back to the shared site image for articles without one. Deployment uses the committed images and does not need Python or Pillow.

Global fonts are Inter and IBM Plex Serif; monospace text uses system fonts. Poetry uses Georgia, so it needs no separate font request. Colors and reading styles live in `app/assets/css/main.css`.

## Verification and deployment

```bash
npm test
npm run generate
npm run verify:static
```

The tests cover visible-text extraction, poetry filters, and search shortcuts before the search interface loads. Static verification checks every page’s generated HTML and metadata, article text, image files, sitemap, RSS, and robots.txt. Generation explicitly includes Markdown routes so direct article requests work without waiting for browser JavaScript.

Preview the generated files with a static server:

```bash
python3 scripts/preview-static.py
npm run verify:static -- --base-url http://127.0.0.1:4173
```

Run the verification command in a second terminal. It also checks fresh HTTP requests with and without trailing slashes, category query strings, and referenced code assets. The site’s feeds are `/sitemap.xml` and `/rss.xml`.

The preview serves only on your computer, disables caching, and accepts bursts of code-chunk requests. Finish generation before opening it; use `--port 4176` for a fresh address if a browser retained failures from an interrupted build. Query-based filters apply after hydration so a filtered URL starts from the same HTML as its unfiltered page.

The GitHub Pages workflow runs tests, generates the site, verifies the output, and deploys `.output/public` on pushes to `main` or a manual workflow run. Keep the existing custom-domain configuration in `public/CNAME` aligned with the repository’s Pages settings.

### Design and interactions

The site uses a neutral white/charcoal palette, light grotesque typography, and open space inspired by Mike Matas’s portfolio. The shared tokens and primitives live in `app/assets/css/main.css`.

Every page renders inside one frame (`app/components/SiteFrame.vue`): a sticky header with the name, the open section's title beneath it, search and theme controls, and a bar of pills for the other sections defined in `app/data/sections.ts`. The introduction is open at `/`; the other sections are ordinary routes. Choosing a pill is a route change: its title travels up under the name, the previous title settles back into the bar as a pill, the remaining pills slide over, and the page eases in beneath. The animation snapshots positions before the route changes and plays them with the Web Animations API, so it is skipped for reduced motion and never affects layout. Once the reader scrolls into a page the header folds to a smaller size and unfolds again at the top. Section index pages keep an `h1` for structure, visually hidden because the title already appears in the header.

Work items live in `app/data/projects.ts`; a project can carry an `image` path once real screenshots exist.

The homepage has a horizontal collection of photographs, book covers, and writing. Touch uses native scrolling and scroll snap; mouse users can drag or use the visible arrows. Arrow keys, Home, and End move between collections. Project rows expand natively. The library retains its book opening experience. Gallery filters switch between all media, photographs, and films; the viewer follows the active collection and supports horizontal swipes on photos as well as buttons and arrow keys.

A translucent cursor appears only for a mouse with a fine pointer and no reduced-motion preference. It grows over interactive elements, yields to the native cursor in dialogs and reading/editing surfaces, and disappears for keyboard navigation or touch. The native cursor remains the fallback before JavaScript and whenever the effect is disabled.

Page transitions, book arrivals, photo details, and control feedback respect reduced-motion preferences. The homepage photo still wobbles and grows with each tap, opening the hidden video on the fifth tap. Dragging the collection does not activate it.

Search is loaded on first use; the shell handles Cmd/Ctrl+K before the search component exists. Navigation closes and restores focus before handing off to search. Content indexes request metadata only, while full article/poetry bodies are reserved for detail pages and text search. Optional analytics loads after hydration. Route prefetching happens on hover or keyboard focus rather than for every visible link.
