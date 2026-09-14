/**
 * Fluted glass over a photograph, drawn with WebGL. The picture is seen through a sheet of vertical
 * glass ribs: each rib works as a small cylindrical lens, slicing the image into strips, bending it,
 * fringing the colours, and streaking it vertically. On a fine pointer the pane is a band that
 * follows the cursor across the photo; a tap sends the whole pane sweeping across from the side that
 * was tapped. The ribs belong to the pane, so they travel with it. Rendering runs only while glass
 * is visible.
 */
const VERTEX = `attribute vec2 a_pos; varying vec2 v_uv;
void main() { v_uv = a_pos * .5 + .5; gl_Position = vec4(a_pos, 0., 1.); }`

const FRAGMENT = `precision highp float;
uniform sampler2D u_tex; uniform vec2 u_size; uniform float u_time; uniform vec3 u_hover; uniform int u_count; uniform vec2 u_sweeps[4];
varying vec2 v_uv;
float ease(float t) { t = clamp(t, 0., 1.); return t < .5 ? 2. * t * t : 1. - pow(-2. * t + 2., 2.) / 2.; }
void main() {
  float aspect = u_size.x / u_size.y;
  float x = v_uv.x * aspect;
  // Which pane covers this pixel, and where that pane is: the band under the pointer or a sweeping sheet.
  float k = 0.; float pane = 0.;
  float halfWidth = u_hover.z * .5;
  float band = u_hover.y * smoothstep(halfWidth, halfWidth - .16, abs(x - u_hover.x * aspect));
  if (band > k) { k = band; pane = u_hover.x * aspect; }
  for (int i = 0; i < 4; i++) {
    if (i >= u_count) break;
    vec2 s = u_sweeps[i];
    float age = u_time - s.y;
    if (age <= 0.) continue;
    float width = aspect * .62;
    float travel = ease(age / .9);
    float centre = mix(-width * .5 - .05, aspect + width * .5 + .05, s.x > .5 ? 1. - travel : travel);
    float cover = smoothstep(width * .5, width * .5 - .14, abs(x - centre));
    if (cover > k) { k = cover; pane = centre; }
  }
  if (k < .002) { gl_FragColor = vec4(texture2D(u_tex, v_uv).rgb, 1.); return; }
  // Ribs of slightly uneven width, fixed to the pane so they move with it.
  float local = x - pane;
  float fx = local * 15.5 + .45 * sin(local * 9.3) + .2 * sin(local * 23.1);
  float cell = floor(fx);
  float f = fract(fx) - .5;
  float lens = f * (1.15 - 1.6 * f * f);
  vec2 uv = v_uv;
  uv.x += lens * .11 * k;
  uv.y += (sin(v_uv.y * 26. + cell * 1.9) * .006 + sin(cell * 3.7) * .004) * k;
  // Colour fringing and a vertical streak, both proportional to how much glass is present.
  float fringe = lens * .022 * k;
  float dy = .0065 * k;
  vec3 color = vec3(0.);
  for (int t = -1; t <= 1; t++) {
    vec2 o = uv + vec2(0., float(t) * dy);
    color += vec3(texture2D(u_tex, clamp(o + vec2(fringe, 0.), .001, .999)).r,
                  texture2D(u_tex, clamp(o, .001, .999)).g,
                  texture2D(u_tex, clamp(o - vec2(fringe, 0.), .001, .999)).b);
  }
  color /= 3.;
  // Each rib catches a soft highlight on one flank and darkens at its seams.
  float highlight = exp(-pow((f + .17) * 7., 2.)) * .22 + exp(-pow((f - .34) * 16., 2.)) * .1;
  float seam = smoothstep(.36, .5, abs(f)) * .38;
  color = color * (1. - seam * k) + highlight * k;
  // A faint milky lift, as glass is never perfectly clear.
  color = mix(color, color * .92 + .08, .35 * k);
  gl_FragColor = vec4(color, 1.);
}`

export function useFlutedGlass(canvas: Ref<HTMLCanvasElement | null>, source: string) {
  const active = ref(false)
  let gl: WebGLRenderingContext | null = null
  let program: WebGLProgram | null = null
  let ready = false
  let frame = 0
  let sweeps: Array<{ side: number, at: number }> = []
  const hover = { x: .5, strength: 0, target: 0 }
  const start = typeof performance === 'undefined' ? 0 : performance.now()
  const uniforms: Record<string, WebGLUniformLocation | null> = {}
  const SWEEP = .95
  const BAND = .55

  function setup() {
    const element = canvas.value
    if (!element || gl) return Boolean(gl)
    const context = element.getContext('webgl', { alpha: false, antialias: false, premultipliedAlpha: false })
    if (!context) return false
    gl = context
    const compile = (type: number, code: string) => {
      const shader = gl!.createShader(type)!
      gl!.shaderSource(shader, code)
      gl!.compileShader(shader)
      if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) throw new Error(gl!.getShaderInfoLog(shader) || 'shader')
      return shader
    }
    try {
      program = gl.createProgram()!
      gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX))
      gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT))
      gl.linkProgram(program)
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('link')
    } catch (error) { if (import.meta.dev) console.warn('[glass] shader failed', error); gl = null; return false }
    gl.useProgram(program)
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    const position = gl.getAttribLocation(program, 'a_pos')
    gl.enableVertexAttribArray(position)
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)
    for (const name of ['u_tex', 'u_size', 'u_time', 'u_hover', 'u_count', 'u_sweeps']) uniforms[name] = gl.getUniformLocation(program, name)
    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
    for (const [key, value] of [[gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE], [gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR]]) gl.texParameteri(gl.TEXTURE_2D, key, value)
    const image = new Image()
    image.decoding = 'async'
    image.onload = () => {
      if (!gl) return
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image)
      ready = true
      if (sweeps.length || hover.target) loop()
    }
    image.src = source
    return true
  }

  function resize() {
    const element = canvas.value
    if (!element || !gl) return
    const scale = Math.min(window.devicePixelRatio || 1, 2)
    const width = Math.round(element.clientWidth * scale), height = Math.round(element.clientHeight * scale)
    if (element.width !== width || element.height !== height) { element.width = width; element.height = height }
    gl.viewport(0, 0, width, height)
    gl.uniform2f(uniforms.u_size, width, height)
  }

  function draw() {
    if (!gl || !ready) return
    const now = (performance.now() - start) / 1000
    sweeps = sweeps.filter(sweep => now - sweep.at < SWEEP)
    hover.strength += (hover.target - hover.strength) * .16
    if (Math.abs(hover.strength - hover.target) < .004) hover.strength = hover.target
    resize()
    gl.uniform1f(uniforms.u_time, now)
    gl.uniform3f(uniforms.u_hover, hover.x, hover.strength, BAND)
    gl.uniform1i(uniforms.u_count, sweeps.length)
    const data = new Float32Array(8)
    sweeps.forEach((sweep, index) => data.set([sweep.side, sweep.at], index * 2))
    gl.uniform2fv(uniforms.u_sweeps, data)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }

  function loop() {
    cancelAnimationFrame(frame)
    const tick = () => {
      draw()
      if (sweeps.length || hover.strength > 0 || hover.target > 0) frame = requestAnimationFrame(tick)
      else active.value = false
    }
    frame = requestAnimationFrame(tick)
  }

  /** Sweep the pane across the photo, entering from the side nearest the given 0..1 x position. */
  function sweep(x: number) {
    if (!setup()) return false
    if (sweeps.length >= 4) sweeps.shift()
    sweeps.push({ side: x < .5 ? 0 : 1, at: (performance.now() - start) / 1000 })
    active.value = true
    if (ready) loop()
    return true
  }

  /** Hold the pane under the pointer at a 0..1 x position, or lift it away with null. */
  function follow(x: number | null) {
    if (x === null) { hover.target = 0; return }
    if (!setup()) return
    hover.x = x
    hover.target = 1
    active.value = true
    if (ready) loop()
  }

  onBeforeUnmount(() => { cancelAnimationFrame(frame); gl?.getExtension('WEBGL_lose_context')?.loseContext(); gl = null })
  return { sweep, follow, active, setup }
}
