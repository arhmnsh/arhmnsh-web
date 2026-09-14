import type { Ref } from 'vue'

/**
 * Fluted glass over a photograph, drawn with WebGL. The picture is seen through a sheet of vertical
 * glass ribs: each rib works as a small cylindrical lens, slicing the image into strips, bending it,
 * fringing the colours, and streaking it vertically. A tap snaps the glass in and clears it
 * outward from the point of contact within about a second. Rendering runs only while the glass is visible.
 */
const VERTEX = `attribute vec2 a_pos; varying vec2 v_uv;
void main() { v_uv = a_pos * .5 + .5; gl_Position = vec4(a_pos, 0., 1.); }`

const FRAGMENT = `precision highp float;
uniform sampler2D u_tex; uniform vec2 u_size; uniform float u_time; uniform int u_count; uniform vec3 u_drops[8];
varying vec2 v_uv;
void main() {
  float aspect = u_size.x / u_size.y;
  vec2 p = vec2(v_uv.x * aspect, v_uv.y);
  // How much glass covers this pixel: it appears everywhere at once, then a clearing spreads from the tap.
  float k = 0.;
  for (int i = 0; i < 8; i++) {
    if (i >= u_count) break;
    vec3 d = u_drops[i];
    float age = u_time - d.z;
    if (age <= 0.) continue;
    float dist = distance(p, vec2(d.x * aspect, d.y));
    float rise = smoothstep(0., .07, age);
    float front = max(age - .1, 0.) * 1.7;
    float clearing = smoothstep(front - .3, front + .05, dist);
    k = max(k, rise * clearing * exp(-age * .8));
  }
  if (k < .002) { gl_FragColor = vec4(texture2D(u_tex, v_uv).rgb, 1.); return; }
  // Ribs of slightly uneven width; the pattern drifts a touch while the glass is present.
  float ribs = 26.;
  float fx = (v_uv.x + u_time * .012) * ribs + .45 * sin(v_uv.x * 9.3) + .2 * sin(v_uv.x * 23.1);
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
  for (int s = -1; s <= 1; s++) {
    vec2 o = uv + vec2(0., float(s) * dy);
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
  let drops: Array<{ x: number, y: number, at: number }> = []
  const start = typeof performance === 'undefined' ? 0 : performance.now()
  const uniforms: Record<string, WebGLUniformLocation | null> = {}
  const LIFETIME = 1.6

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
    for (const name of ['u_tex', 'u_size', 'u_time', 'u_count', 'u_drops']) uniforms[name] = gl.getUniformLocation(program, name)
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
      if (drops.length) loop()
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
    drops = drops.filter(drop => now - drop.at < LIFETIME)
    resize()
    gl.uniform1f(uniforms.u_time, now)
    gl.uniform1i(uniforms.u_count, drops.length)
    const data = new Float32Array(24)
    drops.forEach((drop, index) => data.set([drop.x, drop.y, drop.at], index * 3))
    gl.uniform3fv(uniforms.u_drops, data)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }

  function loop() {
    cancelAnimationFrame(frame)
    const tick = () => {
      draw()
      if (drops.length) frame = requestAnimationFrame(tick)
      else active.value = false
    }
    frame = requestAnimationFrame(tick)
  }

  /** Bring the glass in, clearing from a point given in 0..1 coordinates from the top-left of the photo. */
  function tap(x: number, y: number) {
    if (!setup()) return false
    if (drops.length >= 8) drops.shift()
    drops.push({ x, y: 1 - y, at: (performance.now() - start) / 1000 })
    active.value = true
    if (ready) loop()
    return true
  }

  onBeforeUnmount(() => { cancelAnimationFrame(frame); gl?.getExtension('WEBGL_lose_context')?.loseContext(); gl = null })
  return { tap, active, setup }
}
