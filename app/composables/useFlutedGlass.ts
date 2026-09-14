/**
 * Fluted glass over a photograph, drawn with WebGL. The picture is seen through a sheet of vertical
 * glass ribs: each rib works as a small cylindrical lens, slicing the image into strips, bending it,
 * fringing the colours, and streaking it vertically.
 *
 * A tap slides the pane in from the side that was tapped until it rests over the whole photo. While
 * it rests, moving the pointer shifts the refraction a little, like moving your head in front of a
 * reeded window. After a moment, or on the next tap, the ribs flatten one by one outward from the
 * tapped column until the glass is gone. Rendering runs only while glass is present.
 */
const VERTEX = `attribute vec2 a_pos; varying vec2 v_uv;
void main() { v_uv = a_pos * .5 + .5; gl_Position = vec4(a_pos, 0., 1.); }`

const FRAGMENT = `precision highp float;
uniform sampler2D u_tex; uniform vec2 u_size; uniform float u_time; uniform vec2 u_enter; uniform vec2 u_clear; uniform float u_view;
varying vec2 v_uv;
const float RIBS = 15.5;
float easeOut(float t) { t = clamp(t, 0., 1.); return 1. - pow(1. - t, 3.); }
void main() {
  vec3 plain = texture2D(u_tex, v_uv).rgb;
  float aspect = u_size.x / u_size.y;
  float x = v_uv.x * aspect;
  float age = u_time - u_enter.y;
  if (age <= 0.) { gl_FragColor = vec4(plain, 1.); return; }
  // The pane slides in from one side and comes to rest centred over the photo.
  float width = aspect + .6;
  float from = u_enter.x > .5 ? aspect + width * .5 + .05 : -width * .5 - .05;
  float centre = mix(from, aspect * .5, easeOut(age / .55));
  float k = smoothstep(width * .5, width * .5 - .16, abs(x - centre));
  // Ribs of slightly uneven width belong to the pane; the view angle nudges them a touch.
  float local = x - centre + u_view * .03;
  float fx = local * RIBS + .45 * sin(local * 9.3) + .2 * sin(local * 23.1);
  float cell = floor(fx);
  float f = fract(fx) - .5;
  // Clearing flattens the ribs one column at a time, spreading from the tapped column, each with a glint.
  float glint = 0.;
  if (u_clear.y > 0.) {
    float ribX = (cell + .5) / RIBS + centre;
    float due = u_clear.y + abs(ribX - u_clear.x * aspect) / aspect * .7;
    float since = u_time - due;
    k *= 1. - smoothstep(0., .22, since);
    glint = exp(-pow((since - .04) * 9., 2.)) * .16;
  }
  if (k < .002 && glint < .002) { gl_FragColor = vec4(plain, 1.); return; }
  float lens = f * (1.15 - 1.6 * f * f);
  vec2 uv = v_uv;
  uv.x += (lens * .11 + u_view * .028) * k;
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
  float highlight = exp(-pow((f + .17 - u_view * .12) * 7., 2.)) * .22 + exp(-pow((f - .34) * 16., 2.)) * .1;
  float seam = smoothstep(.36, .5, abs(f)) * .38;
  color = color * (1. - seam * k) + highlight * k + glint;
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
  // One pane at a time: when it entered and from which side, where and when clearing began, and the view angle.
  const pane = { side: 0, at: -1, origin: .5, clearX: .5, clearAt: -1 }
  const view = { value: 0, target: 0 }
  const start = typeof performance === 'undefined' ? 0 : performance.now()
  const uniforms: Record<string, WebGLUniformLocation | null> = {}
  const ENTER = .55, HOLD = 1.6, CLEAR = 1.05

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
    for (const name of ['u_tex', 'u_size', 'u_time', 'u_enter', 'u_clear', 'u_view']) uniforms[name] = gl.getUniformLocation(program, name)
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
      if (pane.at >= 0) loop()
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
    // Left alone, the pane starts to dissolve from the tapped column once it has rested a moment.
    if (pane.at >= 0 && pane.clearAt < 0 && now > pane.at + ENTER + HOLD) { pane.clearX = pane.origin; pane.clearAt = now }
    if (pane.clearAt >= 0 && now > pane.clearAt + CLEAR) { pane.at = -1; pane.clearAt = -1 }
    view.value += (view.target - view.value) * .12
    resize()
    gl.uniform1f(uniforms.u_time, now)
    gl.uniform2f(uniforms.u_enter, pane.side, pane.at)
    gl.uniform2f(uniforms.u_clear, pane.clearX, pane.clearAt)
    gl.uniform1f(uniforms.u_view, view.value)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }

  function loop() {
    cancelAnimationFrame(frame)
    const tick = () => {
      draw()
      if (pane.at >= 0) frame = requestAnimationFrame(tick)
      else active.value = false
    }
    frame = requestAnimationFrame(tick)
  }

  /** Tap at a 0..1 x position: slide the pane in from that side, or start clearing it from that column. */
  function tap(x: number) {
    if (!setup()) return false
    const now = (performance.now() - start) / 1000
    if (pane.at < 0) { pane.side = x < .5 ? 0 : 1; pane.at = now; pane.origin = x; pane.clearAt = -1 }
    else if (pane.clearAt < 0) { pane.clearX = x; pane.clearAt = now }
    active.value = true
    if (ready) loop()
    return true
  }

  /** Where the viewer is looking from, as a 0..1 x position across the photo; null looks straight on. */
  function look(x: number | null) { view.target = x === null ? 0 : (x - .5) * 2 }

  onBeforeUnmount(() => { cancelAnimationFrame(frame); gl?.getExtension('WEBGL_lose_context')?.loseContext(); gl = null })
  return { tap, look, active, setup }
}
