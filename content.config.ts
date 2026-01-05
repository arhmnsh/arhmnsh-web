import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
    collections: {
        articles: defineCollection({
            type: 'page',
            source: 'articles/**/*.md',
            schema: z.object({
                date: z.string(),
                description: z.string().optional(),
                categories: z.array(z.string()),
                tags: z.array(z.string()).optional()
            })
        }),
        bookmarks: defineCollection({
            type: 'data',
            source: 'bookmarks.json',
            schema: z.object({
                title: z.string(),
                url: z.string(),
                description: z.string().optional(),
                tags: z.array(z.string())
            })
        })
    }
})
