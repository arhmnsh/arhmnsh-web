# arhmn.sh

AbdurRahaman Shah’s personal website: projects, articles, books, and photographs. Built with Nuxt 4, Nuxt Content, Vue, and Tailwind CSS, and published as static HTML on GitHub Pages.

## Development

```bash
npm ci
npm run dev
```

The development site opens at [localhost:3000](http://localhost:3000). The shared navigation includes articles, books, gallery, and RSS. Bookmarks and poetry appear when those collections contain published entries; their existing URLs remain available while empty.

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

Poetry also requires `author` and `tags`; `youtubeUrl` is optional. Set `author` to the actual poet’s name. The poetry index supports author/theme filters and the detail page handles attribution. Publication dates render consistently across time zones.

Search indexes article and poetry text, books, saved links, and gallery captions. Article categories are collected from frontmatter and shown as filters on the article index.

## Book presentation

The bookshelf uses CSS 3D covers. Selecting a book moves, enlarges, and opens one rigid cover into a readable spread in a single 720 ms transition. Closing reverses the same movement. The title page is printed on the inside of the cover, with no extra blank leaf. Cover images are contained so titles and artwork are not cropped. Title, author, purchase link, and the personal reading note live on the book pages. Paper grain, gutter shading, layered edges, and binding shadows give the pages depth. These interior pages are custom presentation elements, not reproductions of the publisher’s interior.

On phones, page controls move between book details and the reading note; the offscreen page is inert for keyboard and assistive technology. The book lifts from its shelf position, opens, then closes and returns on dismissal. Reduced motion, `?book=` links, keyboard dismissal, focus restoration, and purchase links are supported. The reading view uses selectable HTML text and does not require WebGL.

## Page metadata and sharing cards

Pages use `usePageSeo` for titles, descriptions, canonical URLs, Open Graph/Twitter previews, and article structured data. Canonical URLs use `https://www.arhmn.sh/` and trailing slashes. Empty collections have `noindex` metadata and are excluded from the sitemap.

To regenerate article title cards after changing titles or adding articles, run with Python, Pillow, and Georgia/Arial or DejaVu Serif/Sans fonts installed:

```bash
python3 scripts/generate-article-previews.py
```

Commit the generated JPGs in `public/images/articles/` and `scripts/article-previews.json`. The site uses this manifest to select a card and falls back to the shared site image for articles without one. Deployment uses the committed images and does not need Python or Pillow.

Global fonts are Inter and IBM Plex Serif; monospace text uses system fonts. Poetry fonts load only when a poetry detail page needs them. Colors and reading styles live in `app/assets/css/main.css`.

## Verification and deployment

```bash
npm test
npm run generate
npm run verify:static
```

The tests cover visible-text extraction used by search. Static verification checks every page’s generated HTML and metadata, article text, image files, sitemap, RSS, and robots.txt. Generation explicitly includes Markdown routes so direct article requests work without waiting for browser JavaScript.

Preview the generated files with a static server:

```bash
python3 scripts/preview-static.py
npm run verify:static -- --base-url http://127.0.0.1:4173
```

Run the verification command in a second terminal. It also checks fresh HTTP requests with and without trailing slashes, category query strings, and referenced code assets. The site’s feeds are `/sitemap.xml` and `/rss.xml`.

The preview serves only on your computer, disables caching, and accepts bursts of code-chunk requests. Finish generation before opening it; use `--port 4176` for a fresh address if a browser retained failures from an interrupted build. Query-based filters apply after hydration so a filtered URL starts from the same HTML as its unfiltered page.

The GitHub Pages workflow runs tests, generates the site, verifies the output, and deploys `.output/public` on pushes to `main` or a manual workflow run. Keep the existing custom-domain configuration in `public/CNAME` aligned with the repository’s Pages settings.

### Theme and bookshelf

The neutral site theme and shared glass/aqua controls live in `app/assets/css/main.css`. Wood texture is limited to the library; book pages retain their paper rendering. The library uses full-width planks for incomplete rows. The homepage photo wobbles and grows with each tap, opening the hidden video on the fifth tap; reduced-motion preferences suppress movement.
