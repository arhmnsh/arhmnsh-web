# Media Storage Guidelines

## Directory Structure
```
public/
└── images/
    └── articles/
        └── [article-slug]/
            ├── hero.png           # Featured/header image
            ├── image-name.png     # In-article images
            └── ...
```

## Convention
- **Location**: `public/images/articles/[article-slug]/`
- **Naming**: Use descriptive, kebab-case names (e.g., `font-comparison.png`)
- **Path in Markdown**: `/images/articles/[article-slug]/filename.png`

## Usage in Markdown
```markdown
![Alt text description](/images/articles/my-article/hero.png)
```

## Video Embeds
Embed external videos (like YouTube) directly in markdown using iframes:
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

## Example
For article `a-typographic-christmas.md`:
- Images stored in: `public/images/articles/a-typographic-christmas/`
- Referenced as: `![Description](/images/articles/a-typographic-christmas/hero.png)`
