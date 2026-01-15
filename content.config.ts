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
        }),
        books: defineCollection({
            type: 'data',
            source: 'books.json',
            schema: z.object({
                id: z.string(),
                title: z.string(),
                author: z.string(),
                cover: z.string(),
                review: z.string(),
                purchaseUrl: z.string()
            })
        }),
        gallery: defineCollection({
            type: 'data',
            source: 'gallery.json',
            schema: z.object({
                id: z.string(),
                type: z.enum(['image', 'video']),
                platform: z.enum(['instagram', 'youtube']),
                embedUrl: z.string(),
                externalUrl: z.string(),
                thumbnail: z.string(),
                title: z.string(),
                aspectRatio: z.enum(['portrait', 'landscape', 'square'])
            })
        })
    }
})
