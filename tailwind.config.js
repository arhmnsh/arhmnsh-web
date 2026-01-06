/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./app/components/**/*.{js,vue,ts}",
        "./app/layouts/**/*.vue",
        "./app/pages/**/*.vue",
        "./app/plugins/**/*.{js,ts}",
        "./app/app.vue",
        "./app/error.vue"
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['"Inter"', 'sans-serif'],
                serif: ['"IBM Plex Serif"', 'serif'],
                mono: ['"IBM Plex Mono"', 'monospace'],
            },
            typography: {
                DEFAULT: {
                    css: {
                        maxWidth: '65ch',
                        color: 'var(--tw-prose-body)',
                        h1: {
                            fontWeight: '700',
                            letterSpacing: '-0.025em',
                            textDecoration: 'none',
                        },
                        'h2, h3, h4': {
                            fontWeight: '600',
                            letterSpacing: '-0.025em',
                            textDecoration: 'none',
                        }
                    }
                }
            }
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
}
