"use client";

import { useEffect, useRef, type RefObject } from "react";
import { cn } from "@/lib/utils";

export type GlyphFieldProps = {
  word: string;
  clearRef?: RefObject<HTMLElement | null>;
  className?: string;
};

const RAMP = [" ", ".", ":", "+"];
const SYMBOLS = ["%", "#", "@", "&", "$", "*", "=", "/", "<", ">", "?"];
const MAX_DPR = 2;
const CELL_HEIGHT = 11;
const GRID_LONG_SIDE = 128;
const IDLE_FRAME_MS = 50;
const WAKE_MS = 6000;
const MAX_STEP_SECONDS = 1 / 30;
const MAX_SEGMENTS = 8;
const PRESSURE_PASSES = 8;
const FLOW_FILTERS = ["EXT_color_buffer_float", "EXT_color_buffer_half_float"];

const VERTEX = `#version 300 es
void main() {
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

const FLOW_HEADER = `#version 300 es
precision highp float;
uniform sampler2D state;
uniform vec2 grid;
uniform float dt;
out vec4 result;
vec4 at(vec2 offset) {
  return texture(state, (gl_FragCoord.xy + offset) / grid);
}
`;

const SPLAT = `${FLOW_HEADER}
uniform vec4 segments[${MAX_SEGMENTS}];
uniform vec3 shapes[${MAX_SEGMENTS}];
uniform int count;
void main() {
  vec4 s = at(vec2(0.0));
  for (int i = 0; i < count; i++) {
    vec2 start = segments[i].xy;
    vec2 along = segments[i].zw;
    vec2 away = gl_FragCoord.xy - start;
    float h = clamp(dot(away, along) / dot(along, along), 0.0, 1.0);
    vec2 e = away - along * h;
    float weight = exp(-dot(e, e) / (shapes[i].x * shapes[i].x));
    s.z = 1.0 - (1.0 - s.z) * exp(-weight * shapes[i].y);
    s.xy = clamp(s.xy + normalize(along) * weight * shapes[i].z, -80.0, 80.0);
  }
  result = s;
}`;

// Semi-Lagrangian: each cell looks back along its velocity.
const ADVECT = `${FLOW_HEADER}
void main() {
  vec4 s = at(-at(vec2(0.0)).xy * dt);
  result = vec4(s.xy * exp(-1.9 * dt), s.z * exp(-3.2 * dt), 0.0);
}`;

const CURL = `${FLOW_HEADER}
void main() {
  float curl = 0.5 * (at(vec2(1.0, 0.0)).y - at(vec2(-1.0, 0.0)).y
    - at(vec2(0.0, 1.0)).x + at(vec2(0.0, -1.0)).x);
  result = vec4(at(vec2(0.0)).xyz, curl);
}`;

// Vorticity confinement, which keeps the wake's swirls from smoothing out.
const CONFINE = `${FLOW_HEADER}
void main() {
  vec4 s = at(vec2(0.0));
  vec2 toward = vec2(
    abs(at(vec2(1.0, 0.0)).a) - abs(at(vec2(-1.0, 0.0)).a),
    abs(at(vec2(0.0, 1.0)).a) - abs(at(vec2(0.0, -1.0)).a)
  );
  toward /= length(toward) + 0.0001;
  result = vec4(s.xy + vec2(toward.y, -toward.x) * s.a * dt * 10.0, s.z, 0.0);
}`;

const PRESSURE = `${FLOW_HEADER}
uniform sampler2D pressure;
float p(vec2 offset) {
  return texture(pressure, (gl_FragCoord.xy + offset) / grid).x;
}
void main() {
  float divergence = 0.5 * (at(vec2(1.0, 0.0)).x - at(vec2(-1.0, 0.0)).x
    + at(vec2(0.0, 1.0)).y - at(vec2(0.0, -1.0)).y);
  float sum = p(vec2(1.0, 0.0)) + p(vec2(-1.0, 0.0))
    + p(vec2(0.0, 1.0)) + p(vec2(0.0, -1.0));
  result = vec4(0.25 * (sum - divergence), 0.0, 0.0, 0.0);
}`;

const PROJECT = `${FLOW_HEADER}
uniform sampler2D pressure;
float p(vec2 offset) {
  return texture(pressure, (gl_FragCoord.xy + offset) / grid).x;
}
void main() {
  vec4 s = at(vec2(0.0));
  vec2 gradient = 0.5 * vec2(
    p(vec2(1.0, 0.0)) - p(vec2(-1.0, 0.0)),
    p(vec2(0.0, 1.0)) - p(vec2(0.0, -1.0))
  );
  vec2 x = gl_FragCoord.xy;
  bool edge = x.x < 1.0 || x.y < 1.0 || x.x > grid.x - 1.0 || x.y > grid.y - 1.0;
  result = vec4(edge ? vec2(0.0) : s.xy - gradient, s.z, 0.0);
}`;

// Decides one glyph per cell, into a small target: r is brightness, a the glyph.
const CELLS = `#version 300 es
precision highp float;
uniform sampler2D state;
uniform vec2 resolution;
uniform vec2 cellSize;
uniform float time;
uniform float flicker;
uniform float wordLength;
uniform float wordStart;
uniform float symbolStart;
uniform float symbolCount;
uniform vec4 clearBox;
out vec4 result;

const float BAYER[16] = float[16](
  0.0, 8.0, 2.0, 10.0,
  12.0, 4.0, 14.0, 6.0,
  3.0, 11.0, 1.0, 9.0,
  15.0, 7.0, 13.0, 5.0
);

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0)), f.x),
    f.y
  );
}
float fbm(vec2 p) {
  float sum = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 4; i++) {
    sum += amplitude * noise(p);
    p = mat2(1.6, 1.2, -1.2, 1.6) * p + 3.1;
    amplitude *= 0.5;
  }
  return sum;
}

void main() {
  vec2 cell = floor(gl_FragCoord.xy);
  vec2 uv = (cell + 0.5) * cellSize / resolution;
  float aspect = resolution.x / resolution.y;
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0);

  float t = time * 0.05;
  vec2 warp = vec2(fbm(p * 1.1 + vec2(0.0, t)), fbm(p * 1.1 + vec2(5.2, 1.3 - t)));
  float tone = smoothstep(0.32, 0.68, fbm(p * 1.4 + warp * 1.5 + vec2(t * 0.7, -t * 0.4)));

  float wake = clamp(texture(state, uv).z * 2.6, 0.0, 1.0);
  wake = wake * wake * (3.0 - 2.0 * wake);
  tone += (1.0 - tone) * wake * 0.92;

  float keep = smoothstep(0.0, 0.1, uv.y) * smoothstep(0.0, 0.1, 1.0 - uv.y);
  if (clearBox.z > 0.0) {
    vec2 half_ = clearBox.zw * 0.5 * vec2(aspect, 1.0);
    vec2 c = (uv - clearBox.xy - clearBox.zw * 0.5) * vec2(aspect, 1.0);
    keep *= smoothstep(0.0, 0.14, (length(c / half_) - 1.0) * min(half_.x, half_.y));
  }
  tone *= keep;
  wake *= keep;

  ivec2 b = ivec2(mod(cell, 4.0));
  float level = tone * 7.0;
  float glyph;
  float brightness;
  if (level >= 3.5) {
    float offset = floor(hash(vec2(cell.y, 7.13)) * wordLength);
    glyph = wordStart + mod(cell.x + offset, wordLength);
    brightness = 0.58 + 0.32 * tone;
    if (hash(cell + vec2(3.1, 8.7)) < wake * 0.9 - 0.2) {
      float tick = floor(flicker * 10.0);
      glyph = symbolStart + floor(hash(cell + tick * vec2(0.71, 0.37)) * symbolCount);
    }
  } else {
    float tier = clamp(floor(level + (BAYER[b.x + b.y * 4] + 0.5) / 16.0), 0.0, 3.0);
    glyph = tier;
    brightness = 0.32 + tier * 0.07;
  }
  result = vec4(mix(brightness, 1.0, wake), 0.0, 0.0, glyph / 255.0);
}`;

const GLYPHS = `#version 300 es
precision highp float;
uniform sampler2D atlas;
uniform sampler2D cells;
uniform ivec2 cellPixels;
uniform vec3 ink;
out vec4 result;
void main() {
  ivec2 frag = ivec2(gl_FragCoord.xy);
  ivec2 id = frag / cellPixels;
  vec4 c = texelFetch(cells, id, 0);
  int glyph = int(c.a * 255.0 + 0.5);
  if (glyph == 0) {
    result = vec4(0.0);
    return;
  }
  ivec2 inside = frag - id * cellPixels;
  ivec2 texel = ivec2(glyph * cellPixels.x + inside.x, cellPixels.y - 1 - inside.y);
  float a = texelFetch(atlas, texel, 0).a * c.r;
  result = vec4(ink * a, a);
}`;

// A computed color may be lab() or oklch(), which only a canvas can turn into
// channel values.
function colorChannels(cssColor: string): [number, number, number] {
  const probe = document.createElement("canvas");
  probe.width = probe.height = 1;
  const ctx = probe.getContext("2d", { willReadFrequently: true });
  if (!ctx) return [0, 0, 0];
  ctx.fillStyle = cssColor;
  ctx.fillRect(0, 0, 1, 1);
  const [r = 0, g = 0, b = 0] = ctx.getImageData(0, 0, 1, 1).data;
  return [r / 255, g / 255, b / 255];
}

function drawAtlas(glyphs: string[], width: number, height: number) {
  const atlas = document.createElement("canvas");
  atlas.width = width * glyphs.length;
  atlas.height = height;
  const ctx = atlas.getContext("2d");
  if (!ctx) return atlas;
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `500 ${height * 0.74}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
  glyphs.forEach((glyph, i) => {
    ctx.fillText(glyph, (i + 0.5) * width, height * 0.54, width * 0.96);
  });
  return atlas;
}

type Target = { texture: WebGLTexture; buffer: WebGLFramebuffer };
type Segment = {
  ax: number;
  ay: number;
  bx: number;
  by: number;
  width: number;
  ink: number;
  push: number;
};

/*
 * Characters drifting in slow noise, and a small fluid simulation the pointer
 * stirs: its wake lifts the cells it crosses into bright letters that flicker
 * through symbols and fade. Everything is clear inside an ellipse around
 * `clearRef`. The color comes from the canvas's CSS `color`, so set it with a
 * text-* class. It pauses off-screen and in hidden tabs, holds one frame under
 * reduced motion, needs WebGL2 and renders nothing without it.
 */
export function GlyphField({ word, clearRef, className }: GlyphFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;
    const gl = canvas.getContext("webgl2", {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "low-power",
    });
    if (!gl) return;
    const flows = FLOW_FILTERS.some((name) => gl.getExtension(name));

    const vertex = gl.createShader(gl.VERTEX_SHADER);
    if (!vertex) return;
    gl.shaderSource(vertex, VERTEX);
    gl.compileShader(vertex);

    const programs: WebGLProgram[] = [];
    const build = (source: string) => {
      const shader = gl.createShader(gl.FRAGMENT_SHADER);
      const program = gl.createProgram();
      if (!shader || !program) throw new Error("No shader program");
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      gl.attachShader(program, vertex);
      gl.attachShader(program, shader);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(program) ?? "Unlinked program");
      }
      gl.deleteShader(shader);
      programs.push(program);
      const locations = new Map<string, WebGLUniformLocation | null>();
      const at = (name: string) => {
        if (!locations.has(name)) {
          locations.set(name, gl.getUniformLocation(program, name));
        }
        return locations.get(name) ?? null;
      };
      return { program, at };
    };

    let cellsProgram;
    let glyphsProgram;
    let splat;
    let advect;
    let curl;
    let confine;
    let pressureProgram;
    let project;
    try {
      cellsProgram = build(CELLS);
      glyphsProgram = build(GLYPHS);
      splat = build(SPLAT);
      advect = build(ADVECT);
      curl = build(CURL);
      confine = build(CONFINE);
      pressureProgram = build(PRESSURE);
      project = build(PROJECT);
    } catch (error) {
      console.warn("The glyph field couldn't start", error);
      return;
    }

    const letters = Array.from(word);
    const glyphs = [...RAMP, ...letters, ...SYMBOLS];
    const wordStart = RAMP.length;
    const symbolStart = wordStart + letters.length;
    const ink = colorChannels(getComputedStyle(canvas).color);

    const makeTarget = (
      width: number,
      height: number,
      internal: number,
      filter: number,
    ): Target => {
      const texture = gl.createTexture();
      const buffer = gl.createFramebuffer();
      if (!texture || !buffer) throw new Error("No render target");
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texStorage2D(gl.TEXTURE_2D, 1, internal, width, height);
      gl.bindFramebuffer(gl.FRAMEBUFFER, buffer);
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        texture,
        0,
      );
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      return { texture, buffer };
    };
    const freeTarget = (target: Target | null) => {
      if (!target) return;
      gl.deleteTexture(target.texture);
      gl.deleteFramebuffer(target.buffer);
    };
    const bind = (unit: number, target: Target | WebGLTexture | null) => {
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(
        gl.TEXTURE_2D,
        target && "texture" in target ? target.texture : target,
      );
    };

    let width = 0;
    let height = 0;
    let cellWidth = 1;
    let cellHeight = 1;
    let gridWidth = 0;
    let gridHeight = 0;
    let atlas: WebGLTexture | null = null;
    let cells: Target | null = null;
    let state: [Target, Target] | null = null;
    let pressure: [Target, Target] | null = null;
    const clearBox = [0, 0, 0, 0];

    const measure = () => {
      const text = clearRef?.current;
      if (!text) return;
      const outer = host.getBoundingClientRect();
      const inner = text.getBoundingClientRect();
      if (outer.width === 0 || outer.height === 0) return;
      clearBox[0] = (inner.left - outer.left) / outer.width;
      clearBox[1] = 1 - (inner.bottom - outer.top) / outer.height;
      clearBox[2] = inner.width / outer.width;
      clearBox[3] = inner.height / outer.height;
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      width = canvas.width = Math.round(rect.width * dpr);
      height = canvas.height = Math.round(rect.height * dpr);
      cellHeight = Math.max(2, Math.round(CELL_HEIGHT * dpr));
      cellWidth = Math.max(2, Math.round(cellHeight * 0.62));

      if (atlas) gl.deleteTexture(atlas);
      atlas = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, atlas);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        drawAtlas(glyphs, cellWidth, cellHeight),
      );

      freeTarget(cells);
      cells = makeTarget(
        Math.ceil(width / cellWidth),
        Math.ceil(height / cellHeight),
        gl.RGBA8,
        gl.NEAREST,
      );

      const ratio = width / height;
      const nextWidth = Math.round(
        ratio >= 1 ? GRID_LONG_SIDE : GRID_LONG_SIDE * ratio,
      );
      const nextHeight = Math.round(
        ratio >= 1 ? GRID_LONG_SIDE / ratio : GRID_LONG_SIDE,
      );
      if (flows && (nextWidth !== gridWidth || nextHeight !== gridHeight)) {
        gridWidth = nextWidth;
        gridHeight = nextHeight;
        const flowTarget = () =>
          makeTarget(gridWidth, gridHeight, gl.RGBA16F, gl.LINEAR);
        state?.forEach(freeTarget);
        pressure?.forEach(freeTarget);
        state = [flowTarget(), flowTarget()];
        pressure = [flowTarget(), flowTarget()];
      }
      measure();
      wake();
    };

    const flowPass = (
      built: {
        program: WebGLProgram;
        at: (name: string) => WebGLUniformLocation | null;
      },
      output: Target,
      dt: number,
      extra?: () => void,
    ) => {
      if (!state) return;
      gl.bindFramebuffer(gl.FRAMEBUFFER, output.buffer);
      gl.useProgram(built.program);
      bind(0, state[0]);
      gl.uniform1i(built.at("state"), 0);
      gl.uniform2f(built.at("grid"), gridWidth, gridHeight);
      gl.uniform1f(built.at("dt"), dt);
      extra?.();
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const stepState = (
      built: {
        program: WebGLProgram;
        at: (name: string) => WebGLUniformLocation | null;
      },
      dt: number,
      extra?: () => void,
    ) => {
      if (!state) return;
      flowPass(built, state[1], dt, extra);
      state = [state[1], state[0]];
    };

    const segments: Segment[] = [];
    const simulate = (dt: number) => {
      if (!state || !pressure) return;
      gl.viewport(0, 0, gridWidth, gridHeight);
      while (segments.length > 0) {
        const batch = segments.splice(0, MAX_SEGMENTS);
        const from = new Float32Array(MAX_SEGMENTS * 4);
        const shape = new Float32Array(MAX_SEGMENTS * 3);
        batch.forEach((s, i) => {
          from.set([s.ax, s.ay, s.bx, s.by], i * 4);
          shape.set([s.width, s.ink, s.push], i * 3);
        });
        stepState(splat, 0, () => {
          gl.uniform4fv(splat.at("segments"), from);
          gl.uniform3fv(splat.at("shapes"), shape);
          gl.uniform1i(splat.at("count"), batch.length);
        });
      }
      stepState(advect, dt);
      stepState(curl, dt);
      stepState(confine, dt);
      let solver: [Target, Target] = pressure;
      for (let i = 0; i < PRESSURE_PASSES; i++) {
        const read: Target = solver[0];
        const write: Target = solver[1];
        flowPass(pressureProgram, write, dt, () => {
          bind(1, read);
          gl.uniform1i(pressureProgram.at("pressure"), 1);
        });
        solver = [write, read];
      }
      pressure = solver;
      const solved = solver[0];
      stepState(project, dt, () => {
        bind(1, solved);
        gl.uniform1i(project.at("pressure"), 1);
      });
    };

    let time = Math.random() * 100;
    let flicker = 0;
    const render = () => {
      if (!cells || !atlas) return;
      const columns = Math.ceil(width / cellWidth);
      const rows = Math.ceil(height / cellHeight);
      gl.bindFramebuffer(gl.FRAMEBUFFER, cells.buffer);
      gl.viewport(0, 0, columns, rows);
      gl.useProgram(cellsProgram.program);
      bind(0, state?.[0] ?? null);
      gl.uniform1i(cellsProgram.at("state"), 0);
      gl.uniform2f(cellsProgram.at("resolution"), width, height);
      gl.uniform2f(cellsProgram.at("cellSize"), cellWidth, cellHeight);
      gl.uniform1f(cellsProgram.at("time"), time);
      gl.uniform1f(cellsProgram.at("flicker"), flicker);
      gl.uniform1f(cellsProgram.at("wordLength"), letters.length);
      gl.uniform1f(cellsProgram.at("wordStart"), wordStart);
      gl.uniform1f(cellsProgram.at("symbolStart"), symbolStart);
      gl.uniform1f(cellsProgram.at("symbolCount"), SYMBOLS.length);
      gl.uniform4fv(cellsProgram.at("clearBox"), clearBox);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, width, height);
      gl.useProgram(glyphsProgram.program);
      bind(0, atlas);
      bind(1, cells);
      gl.uniform1i(glyphsProgram.at("atlas"), 0);
      gl.uniform1i(glyphsProgram.at("cells"), 1);
      gl.uniform2i(glyphsProgram.at("cellPixels"), cellWidth, cellHeight);
      gl.uniform3f(glyphsProgram.at("ink"), ink[0], ink[1], ink[2]);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    let last = 0;
    let lastDraw = 0;
    let visible = true;
    let wakeUntil = 0;
    let wakeRunning = false;

    const clearWake = () => {
      gl.clearColor(0, 0, 0, 0);
      for (const target of [...(state ?? []), ...(pressure ?? [])]) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.buffer);
        gl.clear(gl.COLOR_BUFFER_BIT);
      }
      wakeRunning = false;
    };

    const frame = (now: number) => {
      raf = 0;
      const dt = last ? Math.min((now - last) / 1000, MAX_STEP_SECONDS) : 0;
      last = now;
      const waking = now < wakeUntil && !reduceMotion.matches;
      time += dt;
      if (waking || now - lastDraw >= IDLE_FRAME_MS) {
        if (waking) {
          flicker += dt;
          simulate(dt);
          wakeRunning = true;
        } else if (wakeRunning) {
          clearWake();
        }
        render();
        lastDraw = now;
      }
      if (visible && !document.hidden && !reduceMotion.matches) {
        raf = requestAnimationFrame(frame);
      }
    };
    function wake() {
      if (raf) return;
      last = 0;
      lastDraw = 0;
      raf = requestAnimationFrame(frame);
    }

    let previous: { x: number; y: number; at: number } | null = null;
    const onPoint = (e: PointerEvent) => {
      if (!flows || reduceMotion.matches || gridWidth === 0) return;
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1 - (e.clientY - rect.top) / rect.height;
      const now = performance.now();
      const before = previous;
      previous = { x, y, at: now };
      if (!before) return;
      const bx = (x - before.x) * (gridWidth - 1);
      const by = (y - before.y) * (gridHeight - 1);
      const distance = Math.hypot(bx, by);
      if (distance < 0.001) return;
      const shortSide = Math.min(gridWidth, gridHeight);
      const seconds = Math.max((now - before.at) / 1000, 1 / 240);
      const speed = Math.min(12, distance / shortSide / seconds);
      const fast = 1 - Math.exp(-speed / 2.2);
      const brush = 0.045 * shortSide * (0.65 + 0.95 * fast);
      segments.push({
        ax: before.x * (gridWidth - 1),
        ay: before.y * (gridHeight - 1),
        bx,
        by,
        width: brush,
        ink: Math.min(3, distance / brush) * (0.5 + 0.4 * fast),
        push: Math.min(distance, brush * 2) * (2 + 18 * fast),
      });
      wakeUntil = now + WAKE_MS;
      wake();
    };
    const onLeave = () => {
      previous = null;
    };
    const onVisibility = () => {
      if (!document.hidden) wake();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    const clearTarget = clearRef?.current;
    if (clearTarget) resizeObserver.observe(clearTarget);
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
      if (visible) wake();
    });
    intersection.observe(canvas);
    host.addEventListener("pointermove", onPoint, { passive: true });
    host.addEventListener("pointerdown", onPoint, { passive: true });
    host.addEventListener("pointerleave", onLeave);
    host.addEventListener("pointercancel", onLeave);
    document.addEventListener("visibilitychange", onVisibility);
    reduceMotion.addEventListener("change", wake);
    resize();

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      intersection.disconnect();
      host.removeEventListener("pointermove", onPoint);
      host.removeEventListener("pointerdown", onPoint);
      host.removeEventListener("pointerleave", onLeave);
      host.removeEventListener("pointercancel", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      reduceMotion.removeEventListener("change", wake);
      freeTarget(cells);
      state?.forEach(freeTarget);
      pressure?.forEach(freeTarget);
      if (atlas) gl.deleteTexture(atlas);
      programs.forEach((program) => gl.deleteProgram(program));
      gl.deleteShader(vertex);
    };
  }, [word, clearRef]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn("pointer-events-none size-full", className)}
    />
  );
}
