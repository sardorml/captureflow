"use client";

import { useEffect, useRef } from "react";
import type { BufferGeometry, Object3D } from "three";

const CLOUD_COUNT = 10;
const TOP_CLOUD_COUNT = 8;
const BLOB_RESOLUTION = 72;
const BLOB_FALLOFF = 140;
// Each variant is [x, y, z, radius] lobes around the centre of a unit cube.
// Tiny, small, medium, large and x-large: each size has its own shape, from
// VARIANTS in the same order.
const SIZES = [0.6, 0.95, 1.35, 1.8, 3];
const VARIANTS: [number, number, number, number][][] = [
  [
    [-0.12, 0, 0, 0.13],
    [0.06, 0.06, 0, 0.16],
    [0.2, -0.01, 0, 0.11],
  ],
  [
    [0, 0.06, 0, 0.17],
    [-0.16, -0.04, 0, 0.12],
    [0.16, -0.04, 0, 0.12],
    [0, -0.06, 0.07, 0.12],
  ],
  [
    [-0.27, -0.05, 0, 0.13],
    [-0.06, 0.09, 0, 0.22],
    [0.16, 0.01, 0, 0.15],
    [0.29, -0.06, 0, 0.11],
    [-0.12, -0.06, 0.09, 0.14],
    [0.1, -0.07, 0.08, 0.13],
  ],
  [
    [-0.04, 0.14, -0.04, 0.17],
    [0.14, 0.08, -0.04, 0.13],
    [-0.19, 0.03, -0.02, 0.11],
    [-0.12, 0.02, 0.07, 0.1],
    [0.04, 0.03, 0.08, 0.1],
    [0.18, 0.01, 0.06, 0.1],
    [-0.27, -0.05, 0.03, 0.1],
    [-0.13, -0.07, 0.08, 0.11],
    [0.02, -0.07, 0.09, 0.11],
    [0.16, -0.07, 0.08, 0.11],
    [0.28, -0.05, 0.03, 0.1],
  ],
  [
    [-0.36, -0.12, 0, 0.08],
    [-0.24, -0.12, 0, 0.1],
    [-0.1, -0.12, 0, 0.09],
    [0.04, -0.12, 0, 0.1],
    [0.18, -0.12, 0, 0.11],
    [0.31, -0.12, 0, 0.1],
    [-0.24, -0.04, 0, 0.1],
    [-0.18, 0, 0, 0.1],
    [-0.06, -0.05, 0.02, 0.09],
    [-0.01, -0.01, 0, 0.1],
    [0.11, -0.04, 0, 0.11],
    [0.23, -0.04, 0, 0.1],
    [0.17, 0.03, 0, 0.11],
    [0.05, -0.06, 0.07, 0.09],
    [0.22, -0.05, 0.06, 0.09],
  ],
];
// How far up the cloud its soft flat base sits, and how hard it is pressed.
const BASE_LINE = 0.16;
const BASE_PRESS = 0.15;
const FRAME_MS = 1000 / 30;

/*
 * Presses the lower part of a cloud into a soft flat base, the way cartoon
 * clouds sit on an invisible shelf. Heights below the base line shrink by a
 * factor that eases from 1 to BASE_PRESS, so the surface stays smooth, and
 * each normal is bent by the same local squash to keep the shading right.
 */
function flattenBase(
  positions: Float32Array,
  normals: Float32Array,
  count: number,
) {
  let low = Infinity;
  let high = -Infinity;
  for (let i = 1; i < count * 3; i += 3) {
    low = Math.min(low, positions[i]);
    high = Math.max(high, positions[i]);
  }
  const line = low + (high - low) * BASE_LINE;
  const ease = (high - low) * 0.06;
  for (let i = 1; i < count * 3; i += 3) {
    const depth = line - positions[i];
    if (depth <= 0) continue;
    const fade = Math.exp(-depth / ease);
    positions[i] =
      line - (BASE_PRESS * depth + (1 - BASE_PRESS) * ease * (1 - fade));
    const slope = BASE_PRESS + (1 - BASE_PRESS) * fade;
    const nx = normals[i - 1];
    const ny = normals[i] / slope;
    const nz = normals[i + 1];
    const length = Math.hypot(nx, ny, nz) || 1;
    normals[i - 1] = nx / length;
    normals[i] = ny / length;
    normals[i + 1] = nz / length;
  }
}

const RELAX_PASSES = 6;
const NORMAL_PASSES = 24;
const STRETCH = 1.2;
const NOISE_GLSL = `
float hash3(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
float noise3(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash3(i), hash3(i + vec3(1, 0, 0)), f.x),
        mix(hash3(i + vec3(0, 1, 0)), hash3(i + vec3(1, 1, 0)), f.x), f.y),
    mix(mix(hash3(i + vec3(0, 0, 1)), hash3(i + vec3(1, 0, 1)), f.x),
        mix(hash3(i + vec3(0, 1, 1)), hash3(i + vec3(1, 1, 1)), f.x), f.y),
    f.z);
}`;

/*
 * Softens the creases where lobes meet. Each pass pulls every vertex part way
 * toward the average of its neighbours, so the joins round over instead of
 * meeting in a sharp valley; normals are then rebuilt from the smoothed
 * surface, so the shading flows across a join rather than drawing a line on it.
 */
function relax(geometry: BufferGeometry) {
  const index = geometry.getIndex();
  if (!index) return;
  const position = geometry.getAttribute("position");
  const points = position.array as Float32Array;
  const count = position.count;
  const neighbours: Set<number>[] = Array.from(
    { length: count },
    () => new Set(),
  );
  for (let i = 0; i < index.count; i += 3) {
    const a = index.getX(i);
    const b = index.getX(i + 1);
    const c = index.getX(i + 2);
    neighbours[a].add(b).add(c);
    neighbours[b].add(a).add(c);
    neighbours[c].add(a).add(b);
  }
  const next = new Float32Array(points.length);
  for (let pass = 0; pass < RELAX_PASSES; pass++) {
    for (let v = 0; v < count; v++) {
      let x = 0;
      let y = 0;
      let z = 0;
      for (const n of neighbours[v]) {
        x += points[n * 3];
        y += points[n * 3 + 1];
        z += points[n * 3 + 2];
      }
      const size = neighbours[v].size || 1;
      next[v * 3] = points[v * 3] * 0.5 + (x / size) * 0.5;
      next[v * 3 + 1] = points[v * 3 + 1] * 0.5 + (y / size) * 0.5;
      next[v * 3 + 2] = points[v * 3 + 2] * 0.5 + (z / size) * 0.5;
    }
    points.set(next);
  }
  position.needsUpdate = true;
  geometry.computeVertexNormals();
  // Blurring the normals, not the points, irons out the shading creases where
  // puffs meet without shrinking the silhouette.
  const normal = geometry.getAttribute("normal");
  const normals = normal.array as Float32Array;
  for (let pass = 0; pass < NORMAL_PASSES; pass++) {
    for (let v = 0; v < count; v++) {
      let x = normals[v * 3];
      let y = normals[v * 3 + 1];
      let z = normals[v * 3 + 2];
      for (const n of neighbours[v]) {
        x += normals[n * 3];
        y += normals[n * 3 + 1];
        z += normals[n * 3 + 2];
      }
      const length = Math.hypot(x, y, z) || 1;
      next[v * 3] = x / length;
      next[v * 3 + 1] = y / length;
      next[v * 3 + 2] = z / length;
    }
    normals.set(next);
  }
  normal.needsUpdate = true;
}

function seeded(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

/*
 * Soft 3D clouds drawn with three.js: each cloud is one smooth body, its round
 * lobes melted together as metaballs, built once per variant: bright white,
 * with soft grey-blue shading underneath and smoky edges that billow in a
 * slight breeze. Smaller clouds drift faster, both ways, in gusts. Small ones
 * float along the top, larger ones beside the copy and along the demo card,
 * and a mask fades them out behind the headline so they never compete with
 * the copy. The scene renders at 30fps to keep the GPU work down. Only mounted
 * in light mode. Rendering pauses while the hero is off screen or the tab is
 * hidden, and draws a single still frame under reduced motion.
 */
export function CloudSky() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false;
    let cleanup = () => {};

    void Promise.all([
      import("three"),
      import("three/examples/jsm/objects/MarchingCubes.js"),
      import("three/examples/jsm/utils/BufferGeometryUtils.js"),
    ]).then(([THREE, { MarchingCubes }, { mergeVertices }]) => {
      if (disposed) return;
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "low-power",
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      renderer.domElement.style.display = "block";
      // Hidden until its first frame is drawn, so a fresh canvas never flashes.
      renderer.domElement.style.opacity = "0";
      renderer.domElement.style.transition = "opacity 0.6s ease";
      host.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
      camera.position.set(0, 0, 22);

      scene.add(new THREE.HemisphereLight(0xffffff, 0xdfe5ef, 2.6));
      const lights: [number, number, [number, number, number]][] = [
        [0xffffff, 0.9, [-4, 8, 8]],
        [0xffffff, 0.5, [6, 2, 6]],
      ];
      for (const [colour, intensity, [x, y, z]] of lights) {
        const light = new THREE.DirectionalLight(colour, intensity);
        light.position.set(x, y, z);
        scene.add(light);
      }

      const material = new THREE.MeshLambertMaterial({
        color: 0xffffff,
        transparent: true,
      });
      const time = { value: 0 };
      // Wind: the surface billows with drifting noise and the top sways, and
      // the edges thin out into vapour where the surface turns away.
      material.onBeforeCompile = (shader) => {
        shader.uniforms.uTime = time;
        shader.vertexShader = shader.vertexShader
          .replace(
            "#include <common>",
            `#include <common>\nuniform float uTime;\nvarying vec3 vCloud;\n${NOISE_GLSL}`,
          )
          .replace(
            "#include <begin_vertex>",
            `#include <begin_vertex>
            float seed = modelMatrix[3].x * 0.37 + modelMatrix[3].y * 1.7;
            vec3 drift = vec3(uTime * 0.14, uTime * 0.03, seed);
            transformed += normal * ((noise3(position * 3.0 + drift) - 0.5) * 0.16 + (noise3(position * 7.0 + drift * 1.6) - 0.5) * 0.07);
            transformed.x += sin(uTime * 0.4 + seed) * 0.03 * (position.y + 0.3);
            vCloud = position + drift * 0.6;`,
          );
        shader.fragmentShader = shader.fragmentShader
          .replace(
            "#include <common>",
            `#include <common>\nvarying vec3 vCloud;\n${NOISE_GLSL}`,
          )
          .replace(
            "#include <opaque_fragment>",
            `#include <opaque_fragment>
            float facing = abs(dot(normal, normalize(vViewPosition)));
            float wisp = noise3(vCloud * 4.0) * 0.5 + noise3(vCloud * 9.0) * 0.3 + noise3(vCloud * 19.0) * 0.2;
            gl_FragColor.a *= smoothstep(0.1, 0.95, facing + (wisp - 0.5) * 0.9) * mix(0.55, 1.0, wisp);`,
          );
      };

      // Metaball strength for a lobe whose surface sits at `radius`.
      const blobs = new MarchingCubes(
        BLOB_RESOLUTION,
        material,
        false,
        false,
        120000,
      );
      const strengthFor = (radius: number) =>
        radius * radius * (blobs.isolation + BLOB_FALLOFF);
      const shapes: BufferGeometry[] = VARIANTS.map((lobes) => {
        blobs.reset();
        for (const [x, y, z, radius] of lobes) {
          blobs.addBall(
            0.5 + x,
            0.5 + y,
            0.5 + z,
            strengthFor(radius),
            BLOB_FALLOFF,
          );
        }
        blobs.update();
        flattenBase(blobs.positionArray, blobs.normalArray, blobs.count);
        const shape = new THREE.BufferGeometry();
        shape.setAttribute(
          "position",
          new THREE.BufferAttribute(
            blobs.positionArray.slice(0, blobs.count * 3),
            3,
          ),
        );
        shape.setAttribute(
          "normal",
          new THREE.BufferAttribute(
            blobs.normalArray.slice(0, blobs.count * 3),
            3,
          ),
        );
        const welded = mergeVertices(shape, 1e-4);
        shape.dispose();
        relax(welded);
        return welded;
      });
      blobs.geometry.dispose();

      const viewHalfWidth =
        Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) *
        camera.position.z *
        (host.clientWidth / Math.max(host.clientHeight, 1));
      // World height of the demo card's top edge, so a few clouds can drift
      // along it and tuck behind the card.
      const section = host.closest("section");
      const demo = section?.lastElementChild as HTMLElement | null;
      const halfHeight =
        Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
      const demoTop =
        demo && host.clientHeight
          ? (0.5 - demo.offsetTop / host.clientHeight) * 2 * halfHeight
          : null;
      const random = seeded(19);
      const clouds: {
        group: Object3D;
        speed: number;
      }[] = [];
      const addCloud = (variant: number, x: number, y: number, dir: number) => {
        const group = new THREE.Mesh(shapes[variant], material);
        const flip = random() < 0.5 ? -1 : 1;
        const depth = random();
        group.position.set(x, y, -6 + depth * 6);
        // Tipped toward the camera so its flat base is seen edge-on, not
        // from below, where it would curve into a bent underside.
        group.rotation.x = Math.atan2(
          group.position.y - camera.position.y,
          camera.position.z - group.position.z,
        );
        const size = SIZES[variant] * (0.85 + depth * 0.3);
        group.scale.set(flip * size * STRETCH, size, size);
        scene.add(group);
        clouds.push({
          group,
          speed: (dir * 0.33) / Math.sqrt(SIZES[variant]),
        });
      };
      for (let i = 0; i < CLOUD_COUNT; i++) {
        // Spread across the visible width, either side of the copy.
        const lane = (i + 0.25 + random() * 0.5) / CLOUD_COUNT;
        const x = (lane * 2 - 1) * viewHalfWidth;
        if (i % 3 !== 2 && Math.abs(x) < viewHalfWidth * 0.3) continue;
        const nearDemo = i % 3 === 2 && demoTop !== null;
        const y = nearDemo
          ? demoTop + (random() - 0.3) * 0.8
          : 1 + random() * 2.4;
        // Alternate directions, so clouds pass and overlap each other.
        addCloud(i % SIZES.length, x, y, i % 2 ? -1 : 1);
      }
      // A thin scatter of tiny and small clouds along the top of the sky.
      for (let i = 0; i < TOP_CLOUD_COUNT; i++) {
        const lane = (i + 0.2 + random() * 0.6) / TOP_CLOUD_COUNT;
        const x = (lane * 2 - 1) * viewHalfWidth;
        const y = halfHeight - 1.3 - random() * 1.4;
        addCloud(i % 2, x, y, i % 2 ? 1 : -1);
      }

      let halfWidth = 18;
      const resize = () => {
        const { clientWidth, clientHeight } = host;
        if (!clientWidth || !clientHeight) return;
        renderer.setSize(clientWidth, clientHeight, false);
        camera.aspect = clientWidth / clientHeight;
        camera.updateProjectionMatrix();
        const halfHeight =
          Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) *
          camera.position.z;
        halfWidth = halfHeight * camera.aspect + 8;
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
      let last = performance.now();
      const tick = () => {
        frame = requestAnimationFrame(tick);
        const now = performance.now();
        if (now - last < FRAME_MS - 1) return;
        const dt = Math.min((now - last) / 1000, 0.1);
        last = now;
        if (!visible || document.hidden) return;
        time.value += dt;
        const t = time.value;
        const gust = 1 + 0.3 * Math.sin(t * 0.25) + 0.15 * Math.sin(t * 0.7);
        for (const cloud of clouds) {
          const { group } = cloud;
          group.position.x += cloud.speed * gust * dt;
          if (group.position.x > halfWidth) group.position.x = -halfWidth;
          if (group.position.x < -halfWidth) group.position.x = halfWidth;
        }
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
        for (const shape of shapes) shape.dispose();
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
      className="absolute inset-0 opacity-90 [mask-image:radial-gradient(560px_230px_at_50%_240px,rgb(0_0_0/0.35)_60%,black_100%)]"
    />
  );
}
