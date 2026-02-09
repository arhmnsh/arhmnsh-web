# Personal Website Template

A minimal, typography-focused personal website with blog, bookmarks, book reviews, and photo/video gallery. Built with Nuxt 4, Nuxt Content, and Tailwind CSS.

## Features

- 📝 **Markdown-based content** via Nuxt Content
- 📚 **Book reviews** with cover images and purchase links
- 📸 **Photo/Video gallery** with Instagram and YouTube integration
- 🎨 **Clean typography** with Inter and IBM Plex fonts
- 🌓 **Dark/Light mode** with system preference detection
- 🔍 **Global search** with `⌘K` / `Ctrl+K` shortcuts
- 📱 **Responsive design** with mobile-first approach
- 📑 **Category-based organization** for articles
- 🔖 **Bookmarks page** with tag filtering

## Quick Start

```bash
# Option 1: Fork this repository on GitHub, then clone your fork
git clone https://github.com/arhmnsh/arhmnsh-web.git
cd arhmnsh-web

# Option 2: Use this as a template (click "Use this template" on GitHub), then clone
git clone https://github.com/arhmnsh/arhmnsh-web.git
cd arhmnsh-web

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your blog.

## Project Structure

```
├── app/
│   ├── components/       # Vue components
│   ├── layouts/          # Page layouts
│   ├── pages/            # Route pages
│   └── assets/css/       # Global styles
├── content/
│   ├── articles/         # Blog posts (markdown)
│   ├── bookmarks.json    # Bookmarks data
│   ├── books.json        # Book reviews data
│   └── gallery.json      # Gallery media items
├── public/
│   └── images/
│       ├── articles/     # Article media
│       ├── books/        # Book covers
│       └── gallery/      # Gallery thumbnails
└── nuxt.config.ts        # Nuxt configuration
```

## Writing Articles

Create a new markdown file in `content/articles/`:

```markdown
---
title: "Your Article Title"
date: 2025-01-06
description: "A brief description for SEO and previews."
categories:
  - technology
---

Your content here. The first paragraph will have a drop cap.

## Subheading

More content...
```

### Adding Images

1. Create a folder for your article's media:
   ```
   public/images/articles/your-article-slug/
   ```

2. Add images to that folder

3. Reference in markdown:
   ```markdown
   ![Alt text](/images/articles/your-article-slug/image.png)
   ```

### Embedding Videos

Use iframe directly in markdown:

```html
<iframe 
  width="100%" 
  height="400" 
  src="https://www.youtube.com/embed/VIDEO_ID" 
  title="Video title" 
  frameborder="0" 
  allowfullscreen>
</iframe>
```

## Adding Categories

Categories are auto-generated from article frontmatter. Add a new category by using it in an article:

```yaml
categories:
  - new-category
```

The sidebar will automatically display the new category.

## Customization

### Typography

Edit `app/assets/css/main.css` to customize:
- Font families (Inter, IBM Plex Serif, IBM Plex Mono)
- Color variables for light/dark modes
- Prose styling for article content

### Fonts

Fonts are loaded via Google Fonts in `nuxt.config.ts`. To change:

```typescript
// nuxt.config.ts
app: {
  head: {
    link: [
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=YourFont...' }
    ]
  }
}
```

## Deployment

### GitHub Pages

1. Generate static files:
   ```bash
   npm run generate
   ```

2. The output will be in `.output/public/`

3. Push to GitHub and enable GitHub Pages in your repository settings, pointing to the generated output.

### Other Platforms

You can also deploy to Netlify, Cloudflare Pages, or any static hosting provider.

## Tech Stack

- [Nuxt 4](https://nuxt.com) - Vue framework
- [Nuxt Content](https://content.nuxt.com) - Markdown content management
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS
- [@tailwindcss/typography](https://tailwindcss.com/docs/typography-plugin) - Prose styling

## License

MIT
