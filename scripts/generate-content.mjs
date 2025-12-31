import fs from 'fs';
import path from 'path';

const categories = ['ai', 'productivity', 'job-search', 'career'];
const baseDir = path.join(process.cwd(), 'app/content/articles');

// Ensure directories exist
categories.forEach(cat => {
    const dir = path.join(baseDir, cat);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

const templates = [
    {
        title: "Understanding {Topic}",
        excerpt: "A comprehensive guide to understanding {topic} in the modern era."
    },
    {
        title: "10 Tips for {Topic}",
        excerpt: "Here are the top 10 tips you need to know about {topic}."
    },
    {
        title: "{Topic} for Beginners",
        excerpt: "Starting your journey in {topic}? Read this first."
    },
    {
        title: "Advanced {Topic} Strategies",
        excerpt: "Take your {topic} skills to the next level."
    },
    {
        title: "Why {Topic} Matters",
        excerpt: "The importance of {topic} cannot be overstated."
    }
];

const topics = {
    ai: ["LLMs", "Computer Vision", "Prompt Engineering", "RAG", "Transformers", "Agents", "Stable Diffusion", "OpenAI", "Anthropic", "Local Models", "Fine Tuning", "Vector DBs", "Embeddings", "Chain of Thought", "AI Safety"],
    productivity: ["Deep Work", "Time Blocking", "Notion", "Obsidian", "Flow State", "Inbox Zero", "Pomodoro", "GTD", "Habit Building", "Focus", "Minimalism", "Digital Detox", "Automation", "Raycast", "Shortcuts"],
    'job-search': ["Resume Tips", "LinkedIn Optimization", "Networking", "Interview Prep", "Negotiation", "Cold Emailing", "Portfolio Building", "Personal Branding", "Cover Letters", "Referrals", "Recruiters", "Remote Work", "Contracting", "Freelancing", "Visa Sponsorship"],
    career: ["Promotion", "Staff Engineer", "Management", "Mentorship", "Soft Skills", "Public Speaking", "Writing", "System Design", "Architecture", "Code Review", "Onboarding", "Team Building", "Conflict Resolution", "Burnout", "Career Path"]
};

categories.forEach(cat => {
    const catTopics = topics[cat];
    catTopics.forEach((topic, i) => {
        const template = templates[i % templates.length];
        const title = template.title.replace('{Topic}', topic);
        const excerpt = template.excerpt.replace('{topic}', topic.toLowerCase());
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const date = new Date(2025, 11, i + 1).toISOString().split('T')[0];

        const content = `---
title: "${title}"
date: "${date}"
excerpt: "${excerpt}"
category: "${cat}"
---

# ${title}

${excerpt}

## Introduction
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

## Key Concepts
1. **Concept 1**: Essential for ${topic}.
2. **Concept 2**: Building blocks.
3. **Concept 3**: Advanced techniques.

## Conclusion
Mastering ${topic} takes time, but it's worth the effort.
`;

        fs.writeFileSync(path.join(baseDir, cat, `${slug}.md`), content);
        console.log(`Created ${cat}/${slug}.md`);
    });
});
