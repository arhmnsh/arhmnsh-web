<script setup lang="ts">
import { ref, watch, nextTick, computed, onUnmounted } from 'vue'
import { X } from 'lucide-vue-next'

interface Book {
  id: string
  title: string
  author: string
  cover: string
  review: string
  purchaseUrl: string
}

const props = defineProps<{
  book: Book
  isFocused: boolean
}>()

const emit = defineEmits<{
  (e: 'focus'): void
  (e: 'blur'): void
}>()

const bookItemRef = ref<HTMLElement | null>(null)
const transformStyle = ref({})

const updateLayout = () => {
  if (!props.isFocused || !bookItemRef.value) {
    transformStyle.value = {}
    return
  }

  const el = bookItemRef.value
  const rect = el.getBoundingClientRect()
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight

  // Centering Logic: Center the SPINE (Left Edge)
  // Target: spine at viewport center
  const targetX = viewportWidth / 2
  const targetY = viewportHeight / 2
  
  // dx = Distance to move Left Edge (rect.left) to Center (targetX)
  const dx = targetX - rect.left
  
  // dy = Distance to move Vertical Center (rect.top + h/2) to Center (targetY)
  const dy = targetY - (rect.top + rect.height / 2)

  // Scaling Logic
  const isMobile = viewportWidth < 768
  const margin = isMobile ? 20 : 80 
  
  // Open book width = 2 * baseWidth (Cover + Back)
  const expandedWidth = rect.width * 2
  const targetWidth = viewportWidth - margin
  
  // Fit width
  const scaleX = targetWidth / expandedWidth
  
  // Fit height
  const targetHeight = viewportHeight - margin
  const scaleY = targetHeight / rect.height
  
  // Choose smallest scale
  let targetScale = Math.min(scaleX, scaleY)
  
  // Clamp scale
  const maxScale = isMobile ? 1.0 : 1.5 
  targetScale = Math.min(targetScale, maxScale) 
  targetScale = Math.max(targetScale, 0.45) // Allow shrinking for mobile

  transformStyle.value = {
    transformOrigin: '0px 50%', 
    transform: `translate(${dx}px, ${dy}px) scale(${targetScale})`,
    zIndex: 100
  }
}

watch(() => props.isFocused, async (newVal) => {
  if (newVal) {
    document.body.style.overflow = 'hidden'
    transformStyle.value = {}
    await nextTick()
    updateLayout()
    window.addEventListener('resize', updateLayout)
  } else {
    document.body.style.overflow = ''
    transformStyle.value = {}
    window.removeEventListener('resize', updateLayout)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', updateLayout)
  document.body.style.overflow = ''
})

const handleClick = (e: MouseEvent) => {
  if (!props.isFocused) {
    e.preventDefault()
    emit('focus')
  } else {
    // Already focused: Click on book should CLOSE (deselect)
    emit('blur')
  }
}

const handleBuy = (e: MouseEvent) => {
  e.stopPropagation() // Prevent bubbling to handleClick (which would close/blur)
  window.open(props.book.purchaseUrl, '_blank')
}

const handleClose = (e: MouseEvent) => {
  e.stopPropagation()
  emit('blur')
}
</script>

<template>
  <div 
    ref="bookItemRef"
    class="book-item relative cursor-pointer group transition-all duration-700 cubic-bezier(0.25, 0.8, 0.25, 1)"
    :class="{ 'z-20': !isFocused }"
    :style="transformStyle"
    @click="handleClick"
  >
    <Teleport to="body">
       <!-- Backdrop -->
      <div 
        v-if="isFocused"
        class="fixed inset-0 z-[90] bg-background/80 backdrop-blur-md animate-fade-in"
        @click="handleClose"
      ></div>
      
      <!-- Close Button (Fixed on screen top-right, guaranteed visible) -->
      <button 
        v-if="isFocused"
        @click="handleClose"
        class="fixed top-4 right-4 p-3 text-neutral-400 hover:text-neutral-900 transition-colors z-[110] opacity-0 animate-fade-in rounded-full bg-white/10 hover:bg-white/30 backdrop-blur-sm shadow-sm"
        style="animation-delay: 0.3s; animation-fill-mode: forwards;"
      >
        <X class="w-6 h-6" />
      </button>
    </Teleport>

    <div 
      class="book-scene w-full h-full"
      :class="{ 'translate-y-[-5%]': isFocused }"
    >
      <div class="book w-full h-full" :class="{ 'book--open': isFocused }">
        
        <div class="book__cover_assembly">
          <div class="face front bg-gray-100">
             <img 
              :src="book.cover" 
              :alt="book.title"
              class="w-full h-full object-cover rounded-r-sm rounded-l-md"
              loading="lazy"
            />
            <div class="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-white/20 to-transparent pointer-events-none"></div>
            <div class="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
          </div>
          <div class="face back bg-[#fdfbf7]">
            <div class="h-full w-full p-4 flex flex-col justify-center border-r border-black/5">
              <h3 class="font-sans text-[clamp(12px,3cqw,18px)] font-bold uppercase tracking-wide text-neutral-800 mb-2 line-clamp-2 leading-tight">
                {{ book.title }}
              </h3>
              <p class="text-[clamp(10px,2.5cqw,14px)] text-neutral-500 uppercase tracking-wider">
                {{ book.author }}
              </p>
              
              <!-- External Link Hint -->
              <div 
                class="mt-6 flex items-center justify-center gap-1 text-neutral-400 hover:text-neutral-800 transition-colors cursor-pointer group/link"
                @click="handleBuy"
              >
                 <span class="text-[10px] font-sans uppercase tracking-widest border-b border-transparent group-hover/link:border-neutral-800 transition-colors">Get this book</span>
                 <svg class="group-hover/link:translate-x-0.5 transition-transform" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17l9.2-9.2M17 17V7H7"/></svg>
              </div>
            </div>
          </div>
        </div>

        <div class="book__back_assembly">
           <div class="face right-page bg-[#fdfbf7]">
              <div class="h-full w-full p-4 flex flex-col justify-center text-center">
                 <!-- Clamp font size to be readable but scalable -->
                <p class="font-serif text-[clamp(11px,1.4cqw,16px)] leading-relaxed text-neutral-800 line-clamp-[10] text-left">
                  {{ book.review }}
                </p>
              </div>
              <div class="texture-overlay"></div>
           </div>
           <!-- Hide thickness when open to avoid artifacts -->
           <div v-if="!isFocused" class="thickness-right"></div>
           <div v-if="!isFocused" class="thickness-bottom"></div>
        </div>

      </div>
    </div>
    
    <!-- External Title -->
    <div 
      class="mt-4 text-center transition-opacity duration-300"
      :class="{ 'opacity-0': isFocused, 'opacity-100': !isFocused }"
    >
      <p class="text-xs font-sans font-medium text-muted-foreground truncate px-2">
        {{ book.title }}
      </p>
    </div>

  </div>
</template>

<style scoped>
.book-scene {
  perspective: 1200px;
  transform-style: preserve-3d;
  width: 100%;
  aspect-ratio: 2/3;
}

.book {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transform: rotateY(-10deg); 
  transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.book--open {
  transform: rotateY(0deg); 
}

/* Hover Effect: Rotate to show thickness when closed */
.group:hover .book:not(.book--open) {
  transform: rotateY(-30deg) translateX(5px);
}

/* Cover Assembly */
.book__cover_assembly {
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
  transform-origin: left center;
  transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1);
  z-index: 10;
}

.book--open .book__cover_assembly {
  transform: rotateY(-180deg); /* Open flat */
}

/* Faces */
.face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  overflow: hidden;
  border-radius: 2px 4px 4px 2px;
}

.front {
  transform: rotateY(0deg);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.back {
  transform: rotateY(180deg);
  box-shadow: inset 5px 0 10px rgba(0,0,0,0.05);
}

.book__back_assembly {
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
  z-index: 5;
}

.right-page {
  transform: translateZ(-0.5px);
  box-shadow: inset 2px 0 5px rgba(0,0,0,0.05), 10px 10px 30px rgba(0,0,0,0.15);
}

.thickness-right {
  position: absolute;
  top: 1%; bottom: 1%; right: 0;
  width: 12px;
  background: linear-gradient(90deg, #e3e3e3, #f7f7f7);
  transform-origin: right center;
  transform: rotateY(90deg) translateZ(0);
}

.thickness-bottom {
  position: absolute;
  bottom: 0; left: 2px; right: 1px;
  height: 12px;
  background: #e6e6e6;
  transform-origin: bottom center;
  transform: rotateX(-90deg);
}

.texture-overlay {
  position: absolute; inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  opacity: 0.04; pointer-events: none; mix-blend-mode: multiply;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out forwards;
}
</style>
