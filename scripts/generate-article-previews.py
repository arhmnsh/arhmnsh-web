"""Regenerate 1200×630 article sharing cards from Markdown frontmatter.

Run with Python and Pillow installed. Committed JPGs and the JSON manifest are
used directly by the site, so deploying does not require Python or image tools.
"""

from datetime import date
import json
from pathlib import Path
import re

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "public/images/articles"
MANIFEST = ROOT / "scripts/article-previews.json"


def font_path(candidates):
    for candidate in candidates:
        if Path(candidate).exists():
            return candidate
    raise RuntimeError("Install Georgia/Arial or DejaVu Serif/Sans fonts to generate cards.")


SERIF = font_path([
    "/System/Library/Fonts/Supplemental/Georgia.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf",
])
SANS = font_path([
    "/System/Library/Fonts/Supplemental/Arial.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
])


def frontmatter_value(markdown, key):
    frontmatter = markdown.split("---", 2)[1]
    match = re.search(rf"^{key}:\s*(.+)$", frontmatter, re.MULTILINE)
    if not match:
        return ""
    value = match.group(1).strip()
    if value.startswith('"'):
        return json.loads(value)
    return value.strip("'").replace("''", "'")


def wrap_title(draw, title, font, width):
    lines = []
    line = ""
    for word in title.split():
        candidate = f"{line} {word}".strip()
        if line and draw.textlength(candidate, font=font) > width:
            lines.append(line)
            line = word
        else:
            line = candidate
    if line:
        lines.append(line)
    return lines


def render_card(title, published, destination):
    image = Image.new("RGB", (1200, 630), "#f7f5ef")
    draw = ImageDraw.Draw(image)
    ink, muted, accent = "#252523", "#66655f", "#a84d36"
    label_font = ImageFont.truetype(SANS, 23)
    author_font = ImageFont.truetype(SANS, 25)
    draw.rectangle((0, 0, 1200, 8), fill=accent)
    draw.text((76, 70), "arhmn.sh", font=author_font, fill=ink)
    draw.text((1124, 73), "WRITING", font=label_font, fill=muted, anchor="ra")
    draw.line((76, 126, 1124, 126), fill="#d6d2c8", width=1)

    size = 76
    while True:
        title_font = ImageFont.truetype(SERIF, size)
        lines = wrap_title(draw, title, title_font, 1038)
        if len(lines) <= 3 or size <= 40:
            break
        size -= 2
    assert len(lines) <= 3, f"Title does not fit: {title}"
    line_height = int(size * 1.26)
    y = 175 + (280 - line_height * len(lines)) / 2
    for line in lines:
        draw.text((73, y), line, font=title_font, fill=ink)
        y += line_height

    draw.line((76, 510, 1124, 510), fill="#d6d2c8", width=1)
    draw.text((76, 549), "AbdurRahaman Shah", font=author_font, fill=ink)
    publication_label = date.fromisoformat(published).strftime("%B %Y").upper()
    draw.text((1124, 552), publication_label, font=label_font, fill=muted, anchor="ra")
    image.save(destination, "JPEG", quality=91, optimize=True, progressive=True)


OUTPUT.mkdir(parents=True, exist_ok=True)
manifest = {}
for article in sorted((ROOT / "content/articles").glob("**/*.md")):
    markdown = article.read_text()
    title = frontmatter_value(markdown, "title")
    published = frontmatter_value(markdown, "date")
    relative = article.relative_to(ROOT / "content/articles").with_suffix("")
    filename = str(relative).replace("/", "-") + ".jpg"
    render_card(title, published, OUTPUT / filename)
    manifest[f"/articles/{relative}"] = f"/images/articles/{filename}"
    print(f"Generated {filename}: {title}")

MANIFEST.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n")
