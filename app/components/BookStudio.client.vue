<script setup lang="ts">
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { bookAppearance, type ShelfBook } from '~/utils/bookAppearance'
const props = defineProps<{ book: ShelfBook; origin?: { left: number; top: number; width: number; height: number } }>()
const emit = defineEmits<{ opened: [] }>()
const controlsReady = ref(false)
const opened = ref(false)
const ready = ref(false)
const mobile = ref(false)
const travel = ref<HTMLElement | null>(null)
const cover = ref<HTMLElement | null>(null)
const page = ref<'details' | 'take'>('take')
const appearance = computed(() => bookAppearance(props.book.id))
let mobileQuery: MediaQueryList | undefined
let animation: Animation | undefined
let disposed = false
let closing = false
let landingAnimations: Animation[] = []
let closedBounds: { x: number; y: number; width: number; height: number; hostWidth: number; hostHeight: number } | undefined
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
function syncMobile() { mobile.value = mobileQuery?.matches ?? false }
function shelfTransform(target: {left:number;top:number;width:number;height:number}) {
  const host = travel.value?.getBoundingClientRect()
  if (!host || !closedBounds) return 'none'
  const rx = host.width / closedBounds.hostWidth, ry = host.height / closedBounds.hostHeight
  const sx = target.width / (closedBounds.width * rx), sy = target.height / (closedBounds.height * ry)
  const x = target.left - host.left - closedBounds.x * rx * sx
  const y = target.top - host.top - closedBounds.y * ry * sy
  return `translate(${x}px, ${y}px) scale(${sx}, ${sy})`
}
async function move(from: string, to: string) {
  if (!travel.value || reduced()) return
  const movement = travel.value.animate([{transform:from},{transform:to}], {duration:720,easing:'cubic-bezier(.22,.7,.2,1)',fill:'both'})
  animation = movement
  await movement.finished.catch(() => {})
  if (!closing) movement.cancel()
}
async function closeBook() {
  const currentTransform = travel.value ? getComputedStyle(travel.value).transform : 'none'
  closing = true
  controlsReady.value = false
  animation?.cancel()
  const target = document.getElementById(`book-${props.book.id}`)?.querySelector('.front-board')?.getBoundingClientRect()
  const destination = target ? shelfTransform(target) : 'scale(.9)'
  opened.value = false
  page.value = 'take'
  // Blend into the real shelf object before the modal is removed. Both surfaces
  // use BookCover, and the shelf pose stays fixed during the landing.
  if (!reduced() && travel.value) {
    const shelf = document.getElementById(`book-${props.book.id}`)
    const duration = 720
    const fade = [{opacity:1,offset:0},{opacity:1,offset:.82},{opacity:0,offset:1}]
    landingAnimations.push(travel.value.animate(fade, {duration,fill:'forwards'}))
    for (const part of shelf?.querySelectorAll<HTMLElement>('.volume-model,.volume-shadow') || []) {
      const opacity = getComputedStyle(part).opacity
      landingAnimations.push(part.animate([
        {visibility:'visible',opacity:0,offset:0},
        {visibility:'visible',opacity:0,offset:.82},
        {visibility:'visible',opacity,offset:1}
      ], {duration,fill:'forwards'}))
    }
  }
  await move(currentTransform, destination)
}
defineExpose({ closeBook })
onMounted(async () => {
  mobileQuery = window.matchMedia('(max-width: 700px)'); syncMobile(); mobileQuery.addEventListener('change', syncMobile)
  await nextTick()
  await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
  if (disposed || closing) return
  const host = travel.value?.getBoundingClientRect(), front = cover.value?.getBoundingClientRect()
  if (host && front) closedBounds = {x:front.left-host.left,y:front.top-host.top,width:front.width,height:front.height,hostWidth:host.width,hostHeight:host.height}
  const start = props.origin ? shelfTransform(props.origin) : 'scale(.96)'
  ready.value = true
  // One object travels, grows and opens concurrently; no clone handoff or intermediate camera stops.
  const movement = move(start, 'none')
  opened.value = true
  await movement
  if (!disposed && !closing) { controlsReady.value = true; emit('opened') }
})
onBeforeUnmount(() => { disposed = true; animation?.cancel(); landingAnimations.forEach(item => item.cancel()); mobileQuery?.removeEventListener('change', syncMobile) })
</script>

<template>
  <div class="book-studio" :style="{ '--binding': appearance.color, '--shelf-lean': `${appearance.lean}deg` }">
    <div ref="travel" class="book-travel" :style="{ visibility: ready ? 'visible' : 'hidden' }">
    <div class="reading-stage" :class="{ 'is-open': opened, 'show-details': page === 'details' }">
      <div class="reading-book">
        <div class="back-binding" aria-hidden="true" />
        <article class="paper-page take-page" :inert="!opened || (mobile && page !== 'take')">
          <div class="page-body">
            <span class="ink-rule" aria-hidden="true" />
            <h3>My take.</h3>
            <p class="personal-take">{{ book.review }}</p>
            <p class="signature">AbdurRahaman Shah</p>
          </div>
        </article>
        <div class="hinged-cover">
          <div ref="cover" class="cover-face" aria-hidden="true"><BookCover :src="book.cover" /></div>
          <span class="board-edge board-edge-top" aria-hidden="true" /><span class="board-edge board-edge-bottom" aria-hidden="true" /><span class="board-edge board-edge-fore" aria-hidden="true" />
          <article class="paper-page title-page" :inert="!opened || (mobile && page !== 'details')">
            <div class="title-body">
              <h3>{{ book.title }}</h3>
              <p class="book-author">{{ book.author }}</p>
              <span class="ink-rule" aria-hidden="true" />
              <a :href="book.purchaseUrl" target="_blank" rel="noopener noreferrer" class="find-book">Find this book <ArrowUpRight :size="13" aria-hidden="true" /><span class="sr-only">on Amazon India (opens in a new tab)</span></a>
              <span class="purchase-caption">Amazon India · external link</span>
            </div>
          </article>
        </div>
      </div>
    </div>
    </div>
    <div class="reading-controls" :class="{ 'controls-hidden': !controlsReady }">
      <nav class="page-controls" aria-label="Book pages"><button type="button" :aria-pressed="page === 'details'" @click="page = 'details'"><ChevronLeft :size="14" aria-hidden="true" />Book details</button><button type="button" :aria-pressed="page === 'take'" @click="page = 'take'">My take<ChevronRight :size="14" aria-hidden="true" /></button></nav>
    </div>
  </div>
</template>

<style scoped>
.book-studio { min-width:0; }
.book-travel { transform-origin:top left; }
.controls-hidden { visibility:hidden; }
.reading-stage { perspective:5000px; padding:20px 22px 30px; }
.reading-book { position:relative; width:100%; height:500px; transform-style:preserve-3d; transform:translateX(-25%) rotateX(3deg) rotateY(-22deg) rotateZ(var(--shelf-lean)); transition:transform 720ms cubic-bezier(.22,.7,.2,1); }
.is-open .reading-book { transform:translateX(0) rotateX(3deg) scale(1); }
.back-binding { position:absolute; inset:-7px -7px -10px 50%; background:var(--binding); border-radius:3px 8px 8px 3px; transform:translateZ(-8px); box-shadow:9px 22px 28px #21170d40,2px 4px 5px #21170d60; }
.paper-page { position:absolute; width:50%; height:100%; padding:32px 40px 25px; display:flex; flex-direction:column; color:#443b2c; background-color:#f5efdf; background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.72' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Cpath fill='%23766545' opacity='.085' filter='url(%23n)' d='M0 0h180v180H0z'/%3E%3C/svg%3E"); }
.take-page { right:0; border-radius:0 5px 7px 0; box-shadow:inset 22px 0 25px -18px #402c16a0,inset -3px 0 7px #80603925,1px 1px #bfb49b,2px 3px #f7f0dc,3px 4px #bfb49b,4px 6px #e9dfc8,5px 7px #b7aa91,6px 9px #e9dfc8; }
.page-body { margin:auto 0; padding:20px 0; }
.page-body h3 { font:italic 32px/1.2 var(--font-serif); margin:0 0 24px; }
.ink-rule { display:block; height:1px; width:28px; background:#a08756; margin-bottom:22px; }
.personal-take { font:19px/1.85 var(--font-serif); white-space:pre-line; }
.signature { font:italic 12px/1.5 var(--font-serif); color:#88775e; margin-top:24px; }
.hinged-cover { position:absolute; left:50%; width:50%; height:100%; transform-style:preserve-3d; transform-origin:0 50%; transform:translateZ(7px) rotateY(0deg); transition:transform 720ms cubic-bezier(.26,.62,.2,1); }
.is-open .hinged-cover { transform:translateZ(-4px) rotateY(-180deg); }
.cover-face { position:absolute; inset:-5px -5px -5px 0; transform:translateZ(3px); backface-visibility:hidden; border:0; border-radius:2px 5px 5px 2px; background:var(--binding); overflow:hidden; box-shadow:inset 0 0 0 1px #fff2; }
.cover-face img { width:100%; height:100%; object-fit:contain; background:#f5f3ed; }
.cover-light { position:absolute; inset:0; background:linear-gradient(90deg,#0006,transparent 2%,#fff4 3%,#0002 5%,transparent 9%,#fff1 70%,#0003); box-shadow:inset 0 0 2px 2px #fff3; }
.title-page { width:100%; inset:0; transform:rotateY(180deg) translateZ(3px); backface-visibility:hidden; border:3px solid var(--binding); border-radius:5px 0 0 7px; box-shadow:inset -20px 0 22px -18px #402c1670,-1px 1px 0 #c9bea8; }
.title-body { margin:auto 0; padding:24px 0; text-align:center; }
.title-body h3 { font:500 clamp(23px,3vw,36px)/1.18 var(--font-serif); margin:24px 0 15px; text-wrap:balance; }
.book-author { font:italic 15px/1.5 var(--font-serif); color:#817058; }
.title-body .ink-rule { margin:25px auto; }
.find-book { display:flex; align-items:center; justify-content:center; gap:7px; font-size:11px; text-decoration:underline; text-underline-offset:4px; }
.purchase-caption { display:block; margin-top:10px; color:#8f8066; font-size:8px; }
.board-edge { position:absolute; background:var(--binding); backface-visibility:hidden; }
.board-edge-top,.board-edge-bottom { left:0; width:calc(100% + 5px); height:6px; }
.board-edge-top { top:-5px; transform:translateZ(3px) rotateX(-90deg); transform-origin:top; }
.board-edge-bottom { bottom:-5px; transform:translateZ(3px) rotateX(90deg); transform-origin:bottom; }
.board-edge-fore { top:-5px; right:-5px; width:6px; height:calc(100% + 10px); transform:translateZ(3px) rotateY(-90deg); transform-origin:right; }
.reading-controls { display:flex; justify-content:center; gap:15px; color:#eee8dc; }
.reading-controls button { display:flex; align-items:center; gap:7px; min-height:40px; padding:0 10px; font-size:10px; }
.reading-controls button:hover { color:#fff; }
.page-controls { display:none; }
@media(max-width:700px) {
  .reading-stage { overflow:visible; padding:15px 15px 28px; perspective:5000px; }
  .reading-book { width:200%; height:500px; transform:translateX(-50%) rotateX(3deg) rotateY(-22deg) rotateZ(var(--shelf-lean)); }
  .is-open .reading-book { transform:translateX(-50%) scale(1); }
  .is-open.show-details .reading-book { transform:translateX(0); }
  .paper-page { padding:26px 29px 22px; }
  .personal-take { font-size:18px; line-height:1.85; }
  .title-body h3 { font-size:30px; }
  .page-running,.page-folio { font-size:7px; }
  .page-controls { display:flex; gap:4px; }
  .page-controls button[aria-pressed=true] { color:#fff; text-decoration:underline; text-underline-offset:5px; }
  .reading-controls { flex-wrap:wrap; gap:0 12px; }
}
@media(max-width:700px) and (max-height:760px) {
  .reading-book { height:max(340px,calc(100dvh - 220px)); }
  .personal-take { font-size:16px; line-height:1.65; }
  .page-body h3 { font-size:26px; margin-bottom:16px; }
  .signature { margin-top:15px; }
}
@media(max-height:650px) and (min-width:701px) {
  .reading-stage { padding:8px 18px 16px; max-width:740px; margin:auto; }
  .reading-book { height:calc(100dvh - 135px); min-height:220px; }
  .paper-page { padding:14px 24px; }
  .page-body,.title-body { padding:8px 0; }
  .page-body h3 { font-size:22px; margin-bottom:12px; }
  .personal-take { font-size:13px; line-height:1.55; }
  .signature { font-size:10px; margin-top:10px; }
  .ink-rule { margin-bottom:10px; }
  .title-body h3 { font-size:24px; margin:10px 0; }
  .book-author { font-size:12px; }
  .title-body .ink-rule { margin:12px auto; }
}
@media(prefers-reduced-motion:reduce) { .reading-book,.hinged-cover { transition:none; } }
</style>
