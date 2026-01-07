#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ARTICLES_DIR = path.resolve(__dirname, '../content/articles');
const WORDS_PER_MINUTE = 200;

function calculateReadTime(text) {
    // Remove frontmatter
    const contentWithoutFrontmatter = text.replace(/^---[\s\S]*?---/, '');

    // Count words (split by whitespace)
    const words = contentWithoutFrontmatter.trim().split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;

    // Calculate read time (round up, minimum 1 min)
    const minutes = Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));

    return minutes;
}

function updateArticle(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');

    // Check if already has readTime
    if (content.match(/^readTime:/m)) {
        console.log(`  Skipping (already has readTime): ${path.basename(filePath)}`);
        return;
    }

    const readTime = calculateReadTime(content);

    // Add readTime to frontmatter after the --- opening
    const updatedContent = content.replace(
        /^(---\n)/,
        `$1readTime: ${readTime}\n`
    );

    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log(`  Updated: ${path.basename(filePath)} -> ${readTime} min`);
}

function main() {
    console.log('Calculating read times for articles...\n');

    const files = fs.readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.md'));

    for (const file of files) {
        const filePath = path.join(ARTICLES_DIR, file);
        updateArticle(filePath);
    }

    console.log(`\nDone! Updated ${files.length} articles.`);
}

main();
