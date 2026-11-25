// Port of the brand's `scale-club-mesh.py` (preto-laranja); the blobs slowly breathe.
// Portrait screens rotate the composition so the orange rises from the bottom; the cursor gently pushes it away.
const vertexSource = `
attribute vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }
`;

const fragmentSource = `
precision highp float;
uniform vec2 resolution;
uniform float time;
uniform vec2 pointer;
uniform float pointerStrength;

const vec3 c0 = vec3(8.0, 8.0, 8.0) / 255.0;
const vec3 c1 = vec3(40.0, 18.0, 6.0) / 255.0;
const vec3 c2 = vec3(150.0, 55.0, 6.0) / 255.0;
const vec3 c3 = vec3(240.0, 100.0, 8.0) / 255.0;
const vec3 c4 = vec3(255.0, 140.0, 60.0) / 255.0;

float blob(vec2 p, vec2 center, float radius, float weight, float phase) {
  float breath = sin(time * 0.6 + phase);
  float r = radius * (1.0 + 0.16 * breath);
  vec2 drift = 0.09 * vec2(sin(time * 0.33 + phase * 1.3), cos(time * 0.27 + phase));
  vec2 d = p - center - drift;
  return weight * (1.0 + 0.08 * breath) * exp(-dot(d, d) / (r * r));
}

vec2 toMesh(vec2 uv) {
  vec2 st = resolution.y > resolution.x ? vec2(1.0 - uv.y, uv.x) : uv;
  return vec2(st.x * 1.414, 1.0 - st.y);
}

vec3 band(float t, float p0, float p1, vec3 a, vec3 b) {
  float u = clamp((t - p0) / (p1 - p0), 0.0, 1.0);
  return mix(a, b, u * u * (3.0 - 2.0 * u));
}

void main() {
  vec2 mesh = toMesh(gl_FragCoord.xy / resolution);
  vec2 away = mesh - toMesh(pointer);
  mesh -= away * pointerStrength * 0.55 * exp(-dot(away, away) / 0.07);
  float x = mesh.x;
  float y = mesh.y;
  float seed = 2.1 + 0.6 * sin(time * 0.2) + 0.25 * sin(time * 0.37);
  vec3 warp[3];
  warp[0] = vec3(0.14, 1.7, 0.0);
  warp[1] = vec3(0.07, 3.6, 1.0);
  warp[2] = vec3(0.03, 6.5, 2.0);
  for (int i = 0; i < 3; i++) {
    float a = warp[i].x;
    float fr = warp[i].y;
    float k = warp[i].z;
    float x2 = x + a * sin(fr * y + 1.7 * k + seed) + a * 0.6 * sin(fr * 0.7 * x + 2.1);
    float y2 = y + a * cos(fr * x + 0.9 * k + seed) + a * 0.5 * sin(fr * 1.3 * y + 0.3);
    x = x2;
    y = y2;
  }
  vec2 p = vec2(x, y);
  float t = blob(p, vec2(1.20, 1.05), 0.45, 1.0, 0.0)
    + blob(p, vec2(0.85, 0.75), 0.28, 0.8, 1.7)
    + blob(p, vec2(1.45, 0.35), 0.30, 0.75, 3.1)
    + blob(p, vec2(0.55, 1.10), 0.25, 0.55, 4.6);
  t = clamp(t, 0.0, 1.15) / 1.15;

  vec3 color = c0;
  color = t > 0.0 ? band(t, 0.0, 0.30, c0, c1) : color;
  color = t > 0.30 ? band(t, 0.30, 0.55, c1, c2) : color;
  color = t > 0.55 ? band(t, 0.55, 0.80, c2, c3) : color;
  color = t > 0.80 ? band(t, 0.80, 1.0, c3, c4) : color;

  float grain = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5;
  gl_FragColor = vec4(color + grain * 0.017, 1.0);
}
`;

const RESOLUTION_SCALE = 0.5;

function compile(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
}

export function initHeroMesh(): void {
  const canvas = document.querySelector<HTMLCanvasElement>('[data-hero-mesh]');
  const gl = canvas?.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
  if (!canvas || !gl) return;

  const vertex = compile(gl, gl.VERTEX_SHADER, vertexSource);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();
  if (!vertex || !fragment || !program) return;
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
  gl.useProgram(program);

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const resolution = gl.getUniformLocation(program, 'resolution');
  const time = gl.getUniformLocation(program, 'time');
  const pointerLocation = gl.getUniformLocation(program, 'pointer');
  const pointerStrengthLocation = gl.getUniformLocation(program, 'pointerStrength');

  const pointer = { x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5, strength: 0, targetStrength: 0 };
  const area = canvas.parentElement;
  if (area && window.matchMedia('(pointer: fine)').matches) {
    area.addEventListener('pointermove', (event) => {
      const bounds = canvas.getBoundingClientRect();
      pointer.targetX = (event.clientX - bounds.left) / bounds.width;
      pointer.targetY = 1 - (event.clientY - bounds.top) / bounds.height;
      pointer.targetStrength = 1;
    });
    area.addEventListener('pointerleave', () => {
      pointer.targetStrength = 0;
    });
  }

  const resize = (): void => {
    canvas.width = Math.max(1, Math.round(canvas.clientWidth * RESOLUTION_SCALE));
    canvas.height = Math.max(1, Math.round(canvas.clientHeight * RESOLUTION_SCALE));
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(resolution, canvas.width, canvas.height);
  };
  new ResizeObserver(resize).observe(canvas);
  resize();

  let onScreen = true;
  let frame = 0;
  const shouldAnimate = (): boolean => onScreen && !document.hidden;
  const resume = (): void => {
    if (shouldAnimate() && !frame) frame = requestAnimationFrame(draw);
  };
  const start = performance.now();
  const draw = (now: number): void => {
    pointer.x += (pointer.targetX - pointer.x) * 0.06;
    pointer.y += (pointer.targetY - pointer.y) * 0.06;
    pointer.strength += (pointer.targetStrength - pointer.strength) * 0.04;
    gl.uniform1f(time, (now - start) / 1000);
    gl.uniform2f(pointerLocation, pointer.x, pointer.y);
    gl.uniform1f(pointerStrengthLocation, pointer.strength);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (canvas.dataset.state !== 'ready') canvas.dataset.state = 'ready';
    frame = shouldAnimate() ? requestAnimationFrame(draw) : 0;
  };

  new IntersectionObserver(([entry]) => {
    onScreen = Boolean(entry?.isIntersecting);
    resume();
  }).observe(canvas);
  document.addEventListener('visibilitychange', resume);

  frame = requestAnimationFrame(draw);
}
