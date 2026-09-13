/**
 * Shared-element transitions between a list and its detail page.
 *
 * Mark the same piece of content on both pages with `data-shared="<detail path>"`: the title in a
 * list row and the heading on the detail page. When the route moves between parent and child, a
 * copy of the marked text lifts off the page, the rest fades out, and after the new page has
 * rendered the copy flies into the heading's place while the page fades back in. Going back plays
 * the same motion towards the list row. Skipped for reduced motion and when the marked element is
 * not on screen.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const router = useRouter()
  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const normalize = (path: string) => path.replace(/\/+$/, '') || '/'
  const related = (a: string, b: string) => a !== b && (a.startsWith(b + '/') || b.startsWith(a + '/'))
  const ease = 'cubic-bezier(.3, .7, .2, 1)'
  const body = () => document.querySelector<HTMLElement>('.frame-body')

  type Flight = { key: string, rect: DOMRect, fontSize: number, ghost: HTMLElement, origin: HTMLElement, target?: HTMLElement, timeout: number }
  let flight: Flight | null = null

  function land(current: Flight) {
    if (flight !== current) return
    clearTimeout(current.timeout)
    current.ghost.remove()
    current.origin.style.visibility = ''
    if (current.target) current.target.style.visibility = ''
    const page = body()
    if (page) page.style.opacity = ''
    flight = null
  }

  router.beforeEach(async (to, from) => {
    if (flight) land(flight)
    const toKey = normalize(to.path), fromKey = normalize(from.path)
    if (reduced() || !related(toKey, fromKey)) return
    const origin = document.querySelector<HTMLElement>(`[data-shared="${toKey}"]`) || document.querySelector<HTMLElement>(`[data-shared="${fromKey}"]`)
    if (!origin) return
    const rect = origin.getBoundingClientRect()
    if (!rect.width || rect.bottom < 0 || rect.top > window.innerHeight) return
    const style = getComputedStyle(origin)
    const ghost = document.createElement('div')
    ghost.textContent = origin.textContent
    ghost.setAttribute('aria-hidden', 'true')
    Object.assign(ghost.style, {
      position: 'fixed', left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, margin: '0', zIndex: '25', pointerEvents: 'none',
      font: style.font, letterSpacing: style.letterSpacing, color: style.color, textAlign: style.textAlign, transformOrigin: 'left top', willChange: 'transform'
    })
    document.body.appendChild(ghost)
    origin.style.visibility = 'hidden'
    const current: Flight = { key: origin.dataset.shared || toKey, rect, fontSize: parseFloat(style.fontSize), ghost, origin, timeout: window.setTimeout(() => land(current), 8000) }
    flight = current
    // The page settles away beneath the lifted title before the route changes.
    const page = body()
    if (page) {
      const fade = page.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 150, easing: 'ease-out', fill: 'forwards' })
      await fade.finished.catch(() => {})
      if (flight === current) page.style.opacity = '0'
      fade.cancel()
    }
  })

  nuxtApp.hook('page:finish', () => {
    const current = flight
    if (!current) return
    // The router restores or resets the scroll position just after this hook; measure once it has.
    setTimeout(() => {
      if (flight !== current) return
      const page = body()
      const target = document.querySelector<HTMLElement>(`[data-shared="${current.key}"]`)
      const arrive = () => page?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 420, easing: 'ease-out', delay: 60, fill: 'backwards' })
      if (!target || !page) { if (page) page.style.opacity = ''; arrive(); return land(current) }
      const to = target.getBoundingClientRect()
      const scale = parseFloat(getComputedStyle(target).fontSize) / current.fontSize
      current.target = target
      target.style.visibility = 'hidden'
      page.style.opacity = ''
      arrive()
      const fly = current.ghost.animate(
        [{ transform: 'none' }, { transform: `translate(${to.left - current.rect.left}px, ${to.top - current.rect.top}px) scale(${scale})` }],
        { duration: 460, easing: ease, fill: 'forwards' }
      )
      fly.finished.then(() => {
        if (flight !== current) return
        target.style.visibility = ''
        target.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 140 })
        const fade = current.ghost.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 140, fill: 'forwards' })
        fade.finished.then(() => land(current)).catch(() => land(current))
      }).catch(() => land(current))
    }, 70)
  })
})
