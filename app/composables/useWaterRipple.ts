import type { Ref } from 'vue'

/**
 * A water surface over a photograph, drawn with WebGL. Each drop starts a ring of damped waves
 * that travels outwards; the picture is refracted through the height field and the crests catch a
 * little light, so the image itself appears to bend. Rendering runs only while waves are visible.
 */
const VERTEX = `attribute vec2 a_pos; varying vec2 v_uv;
void main() { v_uv = a_pos * .5 + .5; gl_Position = vec4(a_pos, 0., 1.); }`

const FRAGMENT = `precision highp float;
uniform sampler2D u_tex; uniform vec2 u_size; uniform float u_time; uniform int u_count; uniform vec3 u_drops[8];
varying vec2 v_uv;
void main() {
  float aspect = u_size.x / u_size.y;
  vec2 p = vec2(v_uv.x * aspect, v_uv.y);
  float height = 0.; vec2 grad = vec2(0.);
  for (int i = 0; i < 8; i++) {
    if (i >= u_count) break;
    vec3 d = u_drops[i];
    float age = u_time - d.z;
    if (age <= 0.) continue;
    vec2 diff = p - vec2(d.x * aspect, d.y);
    float dist = length(diff);
    float front = .38 * age;                         // how far the leading crest has travelled
    float behind = front - dist;                     // distance behind the leading crest
    if (behind < -.04) continue;
    float life = exp(-age * 1.1);                   // the drop's energy fades with time
    float tail = exp(-max(behind, 0.) * 4.5);        // waves trail off behind the front
    float edge = smoothstep(-.04, .03, behind);      // the front rises smoothly
    float spread = 1. / (1. + dist * 3.);            // energy thins as the ring widens
    float amp = .02 * life * tail * edge * spread;
    float phase = behind * 40.;
    height += sin(phase) * amp;
    vec2 dir = dist > 1e-4 ? diff / dist : vec2(0.);
    grad += dir * cos(phase) * 40. * amp;
  }
  vec2 shift = grad * .7;
  shift.x /= aspect;
  vec3 color = texture2D(u_tex, clamp(v_uv - shift, .001, .999)).rgb;
  vec3 normal = normalize(vec3(-grad * 7., 1.));
  vec3 light = normalize(vec3(-.35, .75, .6));
  float spec = pow(max(dot(normal, light), 0.), 70.) * min(length(grad) * 20., 1.);
  color += spec * .7;
  color *= 1. + height * 6.;
  gl_FragColor = vec4(color, 1.);
}`

export function useWaterRipple(canvas: Ref<HTMLCanvasElement | null>, source: string) {
  const active = ref(false)
  let gl: WebGLRenderingContext | null = null
  let program: WebGLProgram | null = null
  let ready = false
  let frame = 0
  let drops: Array<{ x: number, y: number, at: number }> = []
  const start = typeof performance === 'undefined' ? 0 : performance.now()
  const uniforms: Record<string, WebGLUniformLocation | null> = {}

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
    } catch { gl = null; return false }
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
    drops = drops.filter(drop => now - drop.at < 3.2)
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

  /** Start a ripple at a point given in 0..1 coordinates from the top-left of the photo. */
  function drop(x: number, y: number) {
    if (!setup()) return false
    if (drops.length >= 8) drops.shift()
    drops.push({ x, y: 1 - y, at: (performance.now() - start) / 1000 })
    active.value = true
    if (ready) loop()
    return true
  }

  onBeforeUnmount(() => { cancelAnimationFrame(frame); gl?.getExtension('WEBGL_lose_context')?.loseContext(); gl = null })
  return { drop, active, setup }
}
