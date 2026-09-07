import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import articlePreviews from '../../scripts/article-previews.json'

interface PageSeoOptions {
  title: MaybeRefOrGetter<string | undefined>
  description: MaybeRefOrGetter<string | undefined>
  type?: MaybeRefOrGetter<'website' | 'article'>
  image?: MaybeRefOrGetter<string | undefined>
  publishedTime?: MaybeRefOrGetter<string | undefined>
  noindex?: MaybeRefOrGetter<boolean>
  author?: MaybeRefOrGetter<string | undefined>
}

const siteName = 'AbdurRahaman Shah'
const siteUrl = 'https://www.arhmn.sh'

export function usePageSeo(options: PageSeoOptions) {
  const route = useRoute()
  const title = computed(() => {
    const pageTitle = toValue(options.title)?.trim()
    return !pageTitle ? siteName : pageTitle.includes(siteName) ? pageTitle : `${pageTitle} · ${siteName}`
  })
  const description = computed(() => toValue(options.description) || 'Writing, projects, books, and photographs by AbdurRahaman Shah, a product engineer building AI and computer vision systems.')
  const canonical = computed(() => {
    const pathname = route.path.split(/[?#]/, 1)[0] || '/'
    return `${siteUrl}${pathname === '/' ? '/' : `${pathname.replace(/\/+$/, '')}/`}`
  })
  const type = computed(() => toValue(options.type) || 'website')
  const image = computed(() => {
    const articleImage = type.value === 'article'
      ? (articlePreviews as Record<string, string>)[route.path.replace(/\/+$/, '')]
      : undefined
    return new URL(toValue(options.image) || articleImage || '/images/og-arhmn.jpg', siteUrl).href
  })
  const author = computed(() => toValue(options.author) || siteName)
  const publishedTime = computed(() => toValue(options.publishedTime) || undefined)

  useSeoMeta({
    title: () => title.value,
    description: () => description.value,
    author: () => author.value,
    robots: () => toValue(options.noindex) ? 'noindex, follow' : 'index, follow',
    ogTitle: () => title.value,
    ogDescription: () => description.value,
    ogType: () => type.value,
    ogUrl: () => canonical.value,
    ogSiteName: siteName,
    ogLocale: 'en_US',
    ogImage: () => image.value,
    ogImageAlt: () => `${toValue(options.title) || siteName} — arhmn.sh`,
    articlePublishedTime: () => type.value === 'article' ? publishedTime.value : undefined,
    twitterCard: 'summary_large_image',
    twitterTitle: () => title.value,
    twitterDescription: () => description.value,
    twitterImage: () => image.value
  })

  useHead(() => ({
    link: [{ key: 'canonical', rel: 'canonical', href: canonical.value }],
    script: type.value === 'article' ? [{
      key: 'article-schema',
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: toValue(options.title),
        description: description.value,
        image: image.value,
        datePublished: publishedTime.value,
        author: { '@type': 'Person', name: author.value, ...(author.value === siteName ? { url: `${siteUrl}/` } : {}) },
        mainEntityOfPage: canonical.value,
        url: canonical.value
      }).replace(/</g, '\\u003c')
    }] : []
  }))

  return { title, description, canonical, image }
}
