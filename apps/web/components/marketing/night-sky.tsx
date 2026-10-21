"use client";

import { useEffect, useRef } from "react";

const STAR_COUNT = 140;

const STAR_VERTEX = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  attribute float aSize;
  attribute float aPhase;
  varying float vAlpha;

  void main() {
    gl_Position = vec4(position.xy, 0.0, 1.0);
    float speed = 0.6 + aPhase * 1.6;
    vAlpha = 0.4 + 0.2 * sin(uTime * speed + aPhase * 6.2831);
    gl_PointSize = aSize * uPixelRatio;
  }
`;

const STAR_FRAGMENT = /* glsl */ `
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float alpha = (1.0 - smoothstep(0.3, 0.5, d)) * vAlpha;
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(vec3(alpha), alpha);
  }
`;

function seeded(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

/*
 * Sparse cartoon stars drawn with three.js: small round white dots that
 * twinkle at their own pace above the night clouds. Only mounted in dark mode.
 * Rendering pauses while the hero is off screen or the tab is hidden, and
 * draws a single still frame under reduced motion.
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
      const phases = new Float32Array(STAR_COUNT);
      for (let i = 0; i < STAR_COUNT; i++) {
        positions.set([random() * 2 - 1, random() * 1.8 - 0.8, 0], i * 3);
        sizes[i] = 2.5 + Math.pow(random(), 4) * 3;
        phases[i] = random();
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3),
      );
      geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
      geometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
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
      className="absolute inset-0 [mask-image:radial-gradient(900px_320px_at_50%_300px,transparent_50%,black_100%)]"
    />
  );
}
