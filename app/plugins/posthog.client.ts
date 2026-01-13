import posthog from 'posthog-js'

export default defineNuxtPlugin((nuxtApp) => {
    const config = useRuntimeConfig()
    const posthogClient = posthog

    if (config.public.posthogPublicKey) {
        posthogClient.init(config.public.posthogPublicKey, {
            api_host: config.public.posthogHost || 'https://us.i.posthog.com',
            capture_pageview: false, // We handle this manually for route changes
            loaded: (ph) => {
                if (import.meta.dev) ph.debug()
            }
        })

        // Track page views manually to ensure accuracy with Nuxt routing
        const router = useRouter()
        router.afterEach((to) => {
            nextTick(() => {
                posthog.capture('$pageview', {
                    $current_url: to.fullPath
                })
            })
        })
    }

    return {
        provide: {
            posthog: () => posthogClient
        }
    }
})
