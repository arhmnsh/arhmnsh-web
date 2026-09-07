import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { bookAppearance, type ShelfBook } from './bookAppearance'

export interface BookStudioController {
  open: (value: boolean) => void
  rotate: (amount: number) => void
  reset: () => void
  dispose: () => void
}

/** One on-demand renderer for the selected volume; shelf cards remain lightweight. */
export async function createBookStudio(host: HTMLElement, book: ShelfBook, onFailure: () => void, signal?: AbortSignal): Promise<BookStudioController> {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = .95
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.VSMShadowMap
  renderer.domElement.setAttribute('aria-hidden', 'true')
  host.appendChild(renderer.domElement)
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(34, 1, .1, 40)
  const textures: THREE.Texture[] = []
  const appearance = bookAppearance(book.id)
  const width = 1.58, height = 2.38, depth = appearance.depth / 95, board = .035
  let disposed = false, frame = 0, previousTime = 0, targetOpen = 0, progress = 0
  let targetYaw = -.35, targetPitch = .025, dragging = false, pointerId = -1, lastX = 0, lastY = 0
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const group = new THREE.Group()
  group.position.y = height / 2 + .04
  group.rotation.y = -.35
  scene.add(group)

  function texture(canvas: HTMLCanvasElement, color = true) {
    const map = new THREE.CanvasTexture(canvas)
    if (color) map.colorSpace = THREE.SRGBColorSpace
    map.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8)
    textures.push(map)
    return map
  }
  function surface(w: number, h: number, draw: (context: CanvasRenderingContext2D) => void) {
    const canvas = document.createElement('canvas')
    canvas.width = w; canvas.height = h
    const context = canvas.getContext('2d')!
    draw(context)
    return canvas
  }
  let randomSeed = 27
  const random = () => { randomSeed = (Math.imul(randomSeed, 1664525) + 1013904223) >>> 0; return randomSeed / 4294967296 }
  const grain = texture(surface(256, 256, ctx => {
    const data = ctx.createImageData(256, 256)
    for (let i = 0; i < data.data.length; i += 4) {
      const v = 115 + random() * 35
      data.data[i] = v; data.data[i + 1] = v; data.data[i + 2] = v; data.data[i + 3] = 255
    }
    ctx.putImageData(data, 0, 0)
  }), false)
  grain.wrapS = grain.wrapT = THREE.RepeatWrapping
  grain.repeat.set(4, 6)
  const paper = texture(surface(512, 512, ctx => {
    ctx.fillStyle = '#eee6d5'; ctx.fillRect(0, 0, 512, 512)
    for (let i = 0; i < 230; i++) {
      const y = i * 2.23
      ctx.fillStyle = `rgba(98,78,47,${.04 + random() * .16})`; ctx.fillRect(0, y, 512, .4 + random() * .6)
    }
    const grad = ctx.createLinearGradient(0, 0, 512, 0)
    grad.addColorStop(0, '#85745466'); grad.addColorStop(.08, '#ffffef00'); grad.addColorStop(.85, '#ffffef00'); grad.addColorStop(1, '#a9956533')
    ctx.fillStyle = grad; ctx.fillRect(0, 0, 512, 512)
  }))
  const forePaper = paper.clone(); forePaper.center.set(.5, .5); forePaper.rotation = Math.PI / 2; textures.push(forePaper)
  const paperMaterial = (map: THREE.Texture) => new THREE.MeshStandardMaterial({ map, roughness: .93, bumpMap: grain, bumpScale: .0015 })
  const binding = new THREE.MeshStandardMaterial({ color: appearance.color, roughness: .79, bumpMap: grain, bumpScale: .005 })
  const inside = new THREE.MeshStandardMaterial({ color: '#e6dcc5', roughness: .94, bumpMap: grain, bumpScale: .002 })
  const cream = new THREE.MeshStandardMaterial({ color: '#f3eddd', roughness: .94 })
  const frontMaterial = new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: .48, metalness: 0, clearcoat: .12, clearcoatRoughness: .6, bumpMap: grain, bumpScale: .0012 })
  const backMaterial = new THREE.MeshStandardMaterial({ color: appearance.color, roughness: .65, bumpMap: grain, bumpScale: .003 })
  function mesh(geometry: THREE.BufferGeometry, material: THREE.Material | THREE.Material[], parent: THREE.Object3D = group) {
    const object = new THREE.Mesh(geometry, material)
    object.castShadow = true; object.receiveShadow = true
    parent.add(object)
    return object
  }
  const block = mesh(new RoundedBoxGeometry(width - .055, height - .07, depth - .045, 2, .008), [paperMaterial(forePaper), binding, paperMaterial(paper), paperMaterial(paper), cream, inside])
  block.position.x = .012
  const back = mesh(new RoundedBoxGeometry(width, height, board, 3, .012), [binding, binding, binding, binding, inside, backMaterial])
  back.position.z = -depth / 2
  const pivot = new THREE.Group()
  pivot.position.set(-width / 2, 0, depth / 2)
  group.add(pivot)
  const cover = mesh(new RoundedBoxGeometry(width, height, board, 3, .012), [binding, binding, binding, binding, frontMaterial, inside], pivot)
  cover.position.x = width / 2
  // A separate flexible joint lets the front board turn around the binding.
  const spine = mesh(new THREE.CylinderGeometry(depth * .51, depth * .51, height - .01, 24), binding)
  spine.position.set(-width / 2 + .015, 0, 0)
  spine.scale.z = .95
  spine.scale.x = .4
  // Endbands: a fine cloth roll at the head and tail of the binding.
  for (const y of [-height / 2 + .037, height / 2 - .037]) {
    const band = mesh(new THREE.CylinderGeometry(.012, .012, depth * .82, 10), new THREE.MeshStandardMaterial({ color: '#bda77f', roughness: .9 }))
    band.rotation.x = Math.PI / 2; band.position.set(-width / 2 + .045, y, 0)
  }
  const leaves: THREE.Group[] = []
  for (let i = 0; i < 4; i++) {
    const leafPivot = new THREE.Group()
    leafPivot.position.set(-width / 2 + .03, 0, depth / 2 - .025 - i * .005)
    group.add(leafPivot)
    const sheet = new THREE.PlaneGeometry(width - .065, height - .08, 24, 2)
    const positions = sheet.attributes.position!
    for (let vertex = 0; vertex < positions.count; vertex++) {
      const along = (positions.getX(vertex) + (width - .065) / 2) / (width - .065)
      positions.setZ(vertex, Math.sin(along * Math.PI) * (.018 + i * .008))
    }
    sheet.computeVertexNormals()
    const leaf = mesh(sheet, new THREE.MeshStandardMaterial({ color: '#eee5d1', roughness: .94, side: THREE.DoubleSide, bumpMap: grain, bumpScale: .001 }), leafPivot)
    leaf.position.x = (width - .065) / 2
    leaves.push(leafPivot)
  }
  // The opening spread carries the owner's note, never invented book text.
  const noteMap = texture(surface(768, 1152, ctx => {
    ctx.fillStyle = '#f3eddd'; ctx.fillRect(0, 0, 768, 1152)
    const shadow = ctx.createLinearGradient(0, 0, 95, 0)
    shadow.addColorStop(0, '#78614155'); shadow.addColorStop(1, '#78614100')
    ctx.fillStyle = shadow; ctx.fillRect(0, 0, 95, 1152)
    ctx.fillStyle = '#706348'; ctx.textAlign = 'center'; ctx.font = '18px Georgia'
    ctx.fillText('FROM MY BOOKSHELF', 384, 170)
    ctx.fillRect(337, 202, 94, 1)
    ctx.fillStyle = '#332e25'; ctx.font = '44px Georgia'
    let y = 320
    function wrap(text: string, maxWidth: number, lineHeight: number) {
      let line = ''
      for (const word of text.split(/\s+/)) {
        const next = line ? `${line} ${word}` : word
        if (ctx.measureText(next).width > maxWidth && line) { ctx.fillText(line, 384, y); y += lineHeight; line = word } else line = next
      }
      if (line) { ctx.fillText(line, 384, y); y += lineHeight }
    }
    wrap(book.title, 570, 53)
    y += 38; ctx.font = 'italic 23px Georgia'; ctx.fillStyle = '#766950'; wrap(book.author, 540, 33)
    y += 72; ctx.font = '31px Georgia'; ctx.fillStyle = '#514735'; wrap(book.review, 570, 44)
    ctx.font = '16px Georgia'; ctx.fillStyle = '#8e8167'; ctx.fillText('A personal reading note · arhmn.sh', 384, 1075)
  }))
  const note = mesh(new THREE.PlaneGeometry(width - .07, height - .09), new THREE.MeshStandardMaterial({ map: noteMap, roughness: .95, side: THREE.DoubleSide }))
  note.position.set(.012, 0, depth / 2 - .02)

  const floor = mesh(new THREE.PlaneGeometry(200, 200), new THREE.ShadowMaterial({ opacity: .21 }), scene)
  floor.rotation.x = -Math.PI / 2; floor.position.y = -.005; floor.castShadow = false
  const contactMap = texture(surface(128, 128, ctx => {
    const g = ctx.createRadialGradient(64, 64, 2, 64, 64, 64)
    g.addColorStop(0, 'rgba(35,24,12,.42)'); g.addColorStop(.35, 'rgba(35,24,12,.18)'); g.addColorStop(1, 'rgba(35,24,12,0)')
    ctx.fillStyle = g; ctx.fillRect(0, 0, 128, 128)
  }))
  const contact = mesh(new THREE.PlaneGeometry(2.5, 1.05), new THREE.MeshBasicMaterial({ map: contactMap, transparent: true, depthWrite: false }), scene)
  contact.rotation.x = -Math.PI / 2; contact.position.set(.05, .003, .04); contact.castShadow = false
  scene.add(new THREE.HemisphereLight('#fff5e2', '#786b57', 1.1))
  const key = new THREE.DirectionalLight('#fff5e8', 2.2)
  key.position.set(-3.5, 6, 5); key.castShadow = true
  key.shadow.mapSize.set(1024, 1024); key.shadow.camera.left = -4; key.shadow.camera.right = 4
  key.shadow.camera.top = 5; key.shadow.camera.bottom = -3
  key.shadow.normalBias = .02; key.shadow.bias = -.0001; key.shadow.radius = 5; key.shadow.blurSamples = 8
  scene.add(key)
  const fill = new THREE.DirectionalLight('#dbe7ff', .65); fill.position.set(4, 2, -1); scene.add(fill)
  const pmrem = new THREE.PMREMGenerator(renderer)
  const room = new RoomEnvironment()
  const environment = pmrem.fromScene(room, .04)
  scene.environment = environment.texture
  scene.environmentIntensity = .38
  room.dispose(); pmrem.dispose()

  function resize() {
    if (disposed) return
    const w = host.clientWidth, h = host.clientHeight
    if (!w || !h) return
    camera.aspect = w / h
    camera.position.set(0, 2.45, camera.aspect < 1 ? 6.1 : 5.4)
    camera.lookAt(0, 1.22, 0)
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
    wake()
  }
  function render(time: number) {
    frame = 0
    if (disposed || document.hidden) return
    const dt = Math.min((time - previousTime) / 1000 || .016, .06)
    previousTime = time
    const ease = reducedMotion.matches ? 1 : 1 - Math.exp(-dt * 7)
    progress += (targetOpen - progress) * ease
    group.rotation.y += (targetYaw - group.rotation.y) * ease
    group.rotation.x += (targetPitch - group.rotation.x) * ease
    group.position.x = progress * .40
    pivot.rotation.y = -progress * 2.55
    leaves.forEach((leaf, i) => { leaf.rotation.y = -Math.max(0, (progress - .07 * (i + 1)) / (1 - .07 * (i + 1))) * (2.38 - .08 * i) })
    contact.position.x = group.position.x
    camera.position.z = (camera.aspect < 1 ? 6.1 : 5.4) + progress * .9
    camera.lookAt(0, 1.22, 0)
    renderer.render(scene, camera)
    if (Math.abs(progress - targetOpen) > .0005 || Math.abs(group.rotation.y - targetYaw) > .0005 || Math.abs(group.rotation.x - targetPitch) > .0005) wake()
  }
  function wake() { if (!frame && !disposed) frame = requestAnimationFrame(render) }
  function down(event: PointerEvent) {
    if (event.button !== 0) return
    dragging = true; pointerId = event.pointerId; lastX = event.clientX; lastY = event.clientY
    host.setPointerCapture(pointerId)
    host.classList.add('is-dragging')
  }
  function move(event: PointerEvent) {
    if (!dragging || event.pointerId !== pointerId) return
    targetYaw += (event.clientX - lastX) * .009
    targetPitch = THREE.MathUtils.clamp(targetPitch + (event.clientY - lastY) * .005, -.45, .45)
    lastX = event.clientX; lastY = event.clientY; wake()
  }
  function up(event: PointerEvent) {
    if (event.pointerId !== pointerId) return
    dragging = false; host.classList.remove('is-dragging')
    if (host.hasPointerCapture(pointerId)) host.releasePointerCapture(pointerId)
  }
  function visibility() { if (!document.hidden) { previousTime = performance.now(); wake() } }
  function lost(event: Event) { event.preventDefault(); onFailure() }
  host.addEventListener('pointerdown', down); host.addEventListener('pointermove', move)
  host.addEventListener('pointerup', up); host.addEventListener('pointercancel', up)
  renderer.domElement.addEventListener('webglcontextlost', lost)
  document.addEventListener('visibilitychange', visibility)
  reducedMotion.addEventListener('change', wake)
  const observer = new ResizeObserver(resize); observer.observe(host)
  resize()

  function dispose() {
    if (disposed) return
    disposed = true; signal?.removeEventListener('abort', dispose); cancelAnimationFrame(frame); observer.disconnect()
    if (pointerId >= 0 && host.hasPointerCapture(pointerId)) host.releasePointerCapture(pointerId)
    host.removeEventListener('pointerdown', down); host.removeEventListener('pointermove', move)
    host.removeEventListener('pointerup', up); host.removeEventListener('pointercancel', up)
    document.removeEventListener('visibilitychange', visibility); reducedMotion.removeEventListener('change', wake)
    renderer.domElement.removeEventListener('webglcontextlost', lost)
    const materials = new Set<THREE.Material>()
    scene.traverse(object => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose()
        for (const mat of Array.isArray(object.material) ? object.material : [object.material]) materials.add(mat)
      }
    })
    materials.forEach(material => material.dispose()); textures.forEach(map => map.dispose())
    environment.dispose(); key.shadow.map?.dispose(); renderer.dispose(); renderer.forceContextLoss()
    renderer.domElement.remove()
  }
  signal?.addEventListener('abort', dispose, { once: true })
  if (signal?.aborted) { dispose(); throw new Error('Book viewer closed') }
  try {
    const image = await new THREE.TextureLoader().loadAsync(book.cover)
    if (disposed) { image.dispose(); throw new Error('Book viewer closed') }
    image.colorSpace = THREE.SRGBColorSpace; image.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8)
    // Product thumbnails often have white side margins. Match CSS object-fit:
    // cover so the printed artwork fills the physical board without that frame.
    const source = image.image as HTMLImageElement
    const ratio = width / height
    const cropWidth = Math.min(source.width, source.height * ratio)
    const cropHeight = Math.min(source.height, source.width / ratio)
    const artwork = surface(1024, 1536, ctx => ctx.drawImage(source, (source.width - cropWidth) / 2, (source.height - cropHeight) / 2, cropWidth, cropHeight, 0, 0, 1024, 1536))
    frontMaterial.map = texture(artwork); frontMaterial.needsUpdate = true
    image.dispose()
    // Match the cloth binding to a sampled edge of this actual cover.
    const sampled = surface(8, 8, ctx => ctx.drawImage(artwork, 0, 0, 8, 8)).getContext('2d')!.getImageData(0, 0, 1, 8).data
    let r = 0, g = 0, b = 0
    for (let i = 0; i < sampled.length; i += 4) { r += sampled[i]!; g += sampled[i + 1]!; b += sampled[i + 2]! }
    binding.color.setRGB(r / 8 / 255, g / 8 / 255, b / 8 / 255, THREE.SRGBColorSpace).multiplyScalar(.7)
    const clothColor = '#' + binding.color.getHexString(THREE.SRGBColorSpace)
    const spineMap = texture(surface(128, 1024, ctx => {
      ctx.fillStyle = clothColor; ctx.fillRect(0, 0, 128, 1024)
      ctx.fillStyle = '#d6c6a3'; ctx.fillRect(35, 76, 58, 2); ctx.fillRect(35, 946, 58, 2)
      ctx.translate(64, 512); ctx.rotate(Math.PI / 2); ctx.textAlign = 'center'
      ctx.font = '27px Georgia'
      ctx.fillText(book.title, 0, 8, 780)
    }))
    const spineLabel = mesh(new THREE.PlaneGeometry(depth * .78, height - .1), new THREE.MeshStandardMaterial({ map: spineMap, roughness: .86, bumpMap: grain, bumpScale: .002 }))
    spineLabel.rotation.y = -Math.PI / 2
    spineLabel.position.set(-width / 2 + .01 - depth * .51 * .4, 0, 0)
    backMaterial.map = texture(surface(512, 768, ctx => {
      ctx.fillStyle = clothColor; ctx.fillRect(0, 0, 512, 768)
      ctx.strokeStyle = '#e6d7b920'; ctx.strokeRect(25, 25, 462, 718)
      ctx.fillStyle = '#ded0b5'; ctx.textAlign = 'center'; ctx.font = 'italic 22px Georgia'
      ctx.fillText('From the personal library of', 256, 580)
      ctx.font = '24px Georgia'; ctx.fillText('AbdurRahaman Shah', 256, 620)
      ctx.font = '14px Georgia'; ctx.fillText('arhmn.sh', 256, 685)
    }))
    backMaterial.color.set('#ffffff'); backMaterial.needsUpdate = true
    wake()
  } catch (error) { dispose(); throw error }
  return {
    open(value) { targetOpen = value ? 1 : 0; if (value) { targetYaw = -.12; targetPitch = .025 } wake() },
    rotate(amount) { targetYaw += amount; wake() },
    reset() { targetYaw = targetOpen ? -.12 : -.35; targetPitch = .025; wake() },
    dispose,
  }
}
