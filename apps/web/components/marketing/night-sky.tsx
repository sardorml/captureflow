"use client";

import { useEffect, useRef } from "react";

const STAR_COUNT = 170;
// Star colours by temperature, from hot blue-white to cool orange, with how
// common each one is.
const STAR_COLOURS: [number, [number, number, number]][] = [
  [0.3, [0.78, 0.86, 1]],
  [0.4, [1, 1, 1]],
  [0.2, [1, 0.95, 0.82]],
  [0.1, [1, 0.82, 0.64]],
];

const STAR_VERTEX = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  attribute float aSize;
  attribute float aBright;
  attribute float aPhase;
  attribute vec3 aColor;
  varying float vSize;
  varying float vBright;
  varying float vTwinkle;
  varying vec3 vColor;

  void main() {
    gl_Position = vec4(position.xy, 0.0, 1.0);
    float speed = 0.6 + aPhase * 1.6;
    vTwinkle = 0.82 + 0.12 * sin(uTime * speed + aPhase * 6.2831)
      + 0.06 * sin(uTime * speed * 3.7 + aPhase * 17.0);
    vSize = aSize;
    vBright = aBright;
    vColor = aColor;
    gl_PointSize = aSize * uPixelRatio;
  }
`;

// A sharp core, a soft halo that grows with brightness, and faint
// diffraction spikes on the brightest few.
const STAR_FRAGMENT = /* glsl */ `
  varying float vSize;
  varying float vBright;
  varying float vTwinkle;
  varying vec3 vColor;

  void main() {
    vec2 p = gl_PointCoord - 0.5;
    vec2 px = p * vSize;
    float r = length(px);
    float core = exp(-r * r / (0.9 + 1.8 * vBright));
    float halo = exp(-r / (1.2 + 5.0 * vBright)) * (0.08 + 0.55 * vBright);
    float spike = max(vBright - 0.6, 0.0) * 2.5;
    float spikes = spike * 0.45 * (
      exp(-abs(px.x) * 1.4) * exp(-abs(px.y) / (2.0 + 6.0 * vBright)) +
      exp(-abs(px.y) * 1.4) * exp(-abs(px.x) / (2.0 + 6.0 * vBright)));
    float edge = 1.0 - smoothstep(0.4, 0.5, length(p));
    float alpha = (core + halo + spikes) * edge * vTwinkle * (0.5 + 0.5 * vBright);
    if (alpha < 0.004) discard;
    vec3 colour = mix(vec3(1.0), vColor, 0.35 + 0.65 * smoothstep(0.0, 2.0, r));
    gl_FragColor = vec4(colour * alpha, alpha);
  }
`;

function seeded(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

/*
 * A night sky drawn with three.js: mostly faint pinpoints with a few bright
 * stars, tinted blue-white to orange, each glowing by its brightness and
 * twinkling at its own pace. Only mounted in dark mode. Rendering pauses
 * while the hero is off screen or the tab is hidden, and draws a single still
 * frame under reduced motion.
 */
export function NightSky() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false;
    let cleanup = () => {};

    void import("three").then((THREE) => {
      if (disposed) return;
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const pixelRatio = Math.min(window.devicePixelRatio, 1.75);

      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: false,
        powerPreference: "low-power",
      });
      renderer.setPixelRatio(pixelRatio);
      renderer.setClearColor(0x000000, 0);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      renderer.domElement.style.display = "block";
      // Hidden until its first frame is drawn, so a fresh canvas never flashes.
      renderer.domElement.style.opacity = "0";
      renderer.domElement.style.transition = "opacity 0.6s ease";
      host.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.Camera();
      const random = seeded(42);

      const positions = new Float32Array(STAR_COUNT * 3);
      const sizes = new Float32Array(STAR_COUNT);
      const brights = new Float32Array(STAR_COUNT);
      const phases = new Float32Array(STAR_COUNT);
      const colours = new Float32Array(STAR_COUNT * 3);
      for (let i = 0; i < STAR_COUNT; i++) {
        positions.set([random() * 2 - 1, random() * 1.8 - 0.8, 0], i * 3);
        // Like a real sky: mostly faint pinpoints and only a few bright stars.
        const bright = Math.pow(random(), 2.4);
        brights[i] = bright;
        sizes[i] = 6 + bright * 30;
        phases[i] = random();
        let pick = random();
        const colour =
          STAR_COLOURS.find(([share]) => (pick -= share) < 0)?.[1] ??
          STAR_COLOURS[1][1];
        colours.set(colour, i * 3);
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3),
      );
      geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
      geometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
      geometry.setAttribute("aBright", new THREE.BufferAttribute(brights, 1));
      geometry.setAttribute("aColor", new THREE.BufferAttribute(colours, 3));
      const material = new THREE.ShaderMaterial({
        vertexShader: STAR_VERTEX,
        fragmentShader: STAR_FRAGMENT,
        uniforms: {
          uTime: { value: 0 },
          uPixelRatio: { value: pixelRatio },
        },
        transparent: true,
        depthTest: false,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const stars = new THREE.Points(geometry, material);
      stars.frustumCulled = false;
      scene.add(stars);

      const resize = () => {
        const { clientWidth, clientHeight } = host;
        if (!clientWidth || !clientHeight) return;
        renderer.setSize(clientWidth, clientHeight, false);
        renderer.render(scene, camera);
      };
      /* A torn-down or lost WebGL context paints the canvas white, which on a
         reload shows for a frame before the next page; hide it first. */
      const hide = () => {
        renderer.domElement.style.transition = "none";
        renderer.domElement.style.opacity = "0";
      };
      window.addEventListener("pagehide", hide);
      window.addEventListener("beforeunload", hide);
      renderer.domElement.addEventListener("webglcontextlost", hide);

      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(host);
      resize();
      requestAnimationFrame(() => {
        renderer.domElement.style.opacity = "1";
      });

      let frame = 0;
      let visible = true;
      const start = performance.now();
      const tick = () => {
        frame = requestAnimationFrame(tick);
        if (!visible || document.hidden) return;
        material.uniforms.uTime.value = (performance.now() - start) / 1000;
        renderer.render(scene, camera);
      };
      const intersection = new IntersectionObserver(([entry]) => {
        visible = entry?.isIntersecting ?? true;
      });
      intersection.observe(host);
      if (!reduceMotion) tick();

      cleanup = () => {
        cancelAnimationFrame(frame);
        window.removeEventListener("pagehide", hide);
        window.removeEventListener("beforeunload", hide);
        renderer.domElement.removeEventListener("webglcontextlost", hide);
        resizeObserver.disconnect();
        intersection.disconnect();
        geometry.dispose();
        material.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    });

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return (
    <div
      ref={hostRef}
      className="absolute inset-0 blur-[1px] [mask-image:radial-gradient(900px_320px_at_50%_300px,transparent_50%,black_100%)]"
    />
  );
}
