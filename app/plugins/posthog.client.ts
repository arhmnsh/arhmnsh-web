import type { PostHog } from 'posthog-js'

export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig()
    const router = useRouter()
    let posthogClient: PostHog | undefined

    if (config.public.posthogPublicKey) {
        const capturePageview = () => {
            posthogClient?.capture('$pageview', { $current_url: window.location.href })
        }
        const stopTracking = router.afterEach((_to, _from, failure) => {
            if (!failure) nextTick(capturePageview)
        })
        if (import.meta.hot) import.meta.hot.dispose(stopTracking)

        // Analytics is optional and must not delay hydration or the first paint.
        onNuxtReady(async () => {
            try {
                const { default: posthog } = await import('posthog-js')
                posthog.init(config.public.posthogPublicKey, {
                    api_host: config.public.posthogHost || 'https://us.i.posthog.com',
                    capture_pageview: false,
                    loaded: (client) => { if (import.meta.dev) client.debug() }
                })
                posthogClient = posthog
                capturePageview()
            } catch (error) {
                if (import.meta.dev) console.warn('Analytics could not be loaded.', error)
            }
        })
    }

    return { provide: { posthog: () => posthogClient } }
})
