"use client";

import { useEffect, useRef } from "react";
import { neighbourLists, weld } from "@/lib/marketing/cloud-mesh";
import type {
  BufferGeometry,
  Mesh,
  MeshLambertMaterial,
  Object3D,
} from "three";

const BLOB_RESOLUTION = 72;
const WISP_COUNT = 16;
// The canvas sits under a CSS blur, so it draws at half the CSS resolution
// with no antialiasing; the blur hides the difference.
const RENDER_SCALE = 0.5;
const BLOB_FALLOFF = 140;
// Each variant is [x, y, z, radius] lobes around the centre of a unit cube.
// Tiny, small, medium, large and x-large: each size has its own shape, from
// VARIANTS in the same order.
const SIZES = [0.72, 1.15, 1.6, 2.15, 3.6];
const VARIANTS: [number, number, number, number][][] = [
  [
    [-0.16, -0.02, 0, 0.09],
    [-0.06, 0.05, 0, 0.12],
    [0.07, 0.08, 0, 0.13],
    [0.18, 0.02, 0, 0.1],
    [0.02, -0.03, 0.06, 0.1],
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
  const { start, list, length } = neighbourLists(
    index.array as Uint32Array,
    count,
  );
  const next = new Float32Array(points.length);
  for (let pass = 0; pass < RELAX_PASSES; pass++) {
    for (let v = 0; v < count; v++) {
      let x = 0;
      let y = 0;
      let z = 0;
      for (let i = start[v]; i < start[v] + length[v]; i++) {
        const n = list[i];
        x += points[n * 3];
        y += points[n * 3 + 1];
        z += points[n * 3 + 2];
      }
      const size = length[v] || 1;
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
      for (let i = start[v]; i < start[v] + length[v]; i++) {
        const n = list[i];
        x += normals[n * 3];
        y += normals[n * 3 + 1];
        z += normals[n * 3 + 2];
      }
      const size = Math.hypot(x, y, z) || 1;
      next[v * 3] = x / size;
      next[v * 3 + 1] = y / size;
      next[v * 3 + 2] = z / size;
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
 * warm on the side facing the sun glow, with smoky edges that billow in a
 * slight breeze and wisps that tear off or drift in. Each drifts at its own
 * slow speed, both ways, in gusts. The layout is scattered fresh on each
 * load, with big clouds kept below the subtitle, and a mask fades them out
 * behind the headline so they never compete with the copy. The scene renders at 30fps to keep the GPU work down. Only mounted
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
    ]).then(async ([THREE, { MarchingCubes }]) => {
      if (disposed) return;
      // Metaball strength for a lobe whose surface sits at `radius`.
      const placeholder = new THREE.MeshBasicMaterial();
      const blobs = new MarchingCubes(
        BLOB_RESOLUTION,
        placeholder,
        false,
        false,
        120000,
      );
      const strengthFor = (radius: number) =>
        radius * radius * (blobs.isolation + BLOB_FALLOFF);
      // One shape per task, yielding in between, so the build never holds
      // the main thread for long while the page is still loading.
      const shapes: BufferGeometry[] = [];
      for (const lobes of VARIANTS) {
        await new Promise((resolve) => setTimeout(resolve));
        if (disposed) break;
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
        const { position, normal, index } = weld(
          blobs.positionArray,
          blobs.normalArray,
          blobs.count,
        );
        const welded = new THREE.BufferGeometry();
        welded.setAttribute("position", new THREE.BufferAttribute(position, 3));
        welded.setAttribute("normal", new THREE.BufferAttribute(normal, 3));
        welded.setIndex(new THREE.BufferAttribute(index, 1));
        relax(welded);
        shapes.push(welded);
      }
      blobs.geometry.dispose();
      placeholder.dispose();
      if (disposed) {
        for (const shape of shapes) shape.dispose();
        return;
      }

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: false,
        powerPreference: "low-power",
      });
      renderer.setPixelRatio(RENDER_SCALE);
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

      scene.add(new THREE.HemisphereLight(0xffffff, 0xd4dcea, 2.5));
      // A warm key from the sun glow up and to the right gives the clouds a
      // peachy lit side and a soft cool shadow on the side away from it.
      const lights: [number, number, [number, number, number]][] = [
        [0xffc890, 1.1, [7, 9, 5]],
        [0xffffff, 0.4, [-5, 3, 8]],
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
      // the edges thin out into vapour where the surface turns away, more so
      // the smaller the cloud.
      material.onBeforeCompile = (shader) => {
        shader.uniforms.uTime = time;
        shader.vertexShader = shader.vertexShader
          .replace(
            "#include <common>",
            `#include <common>\nuniform float uTime;\nvarying vec3 vCloud;\nvarying float vSmoke;\n${NOISE_GLSL}`,
          )
          .replace(
            "#include <begin_vertex>",
            `#include <begin_vertex>
            float seed = modelMatrix[3].x * 0.37 + modelMatrix[3].y * 1.7;
            vec3 drift = vec3(uTime * 0.035, uTime * 0.008, seed);
            vSmoke = clamp(1.4 - length(modelMatrix[1].xyz) * 0.6, 0.0, 1.0);
            transformed += normal * ((noise3(position * 3.0 + drift) - 0.5) * 0.16 + (noise3(position * 7.0 + drift * 1.6) - 0.5) * 0.07) * (1.0 + vSmoke * 0.8);
            transformed.x += sin(uTime * 0.18 + seed) * 0.02 * (position.y + 0.3);
            vCloud = position + drift * 0.6;`,
          );
        shader.fragmentShader = shader.fragmentShader
          .replace(
            "#include <common>",
            `#include <common>\nvarying vec3 vCloud;\nvarying float vSmoke;\n${NOISE_GLSL}`,
          )
          .replace(
            "#include <opaque_fragment>",
            `#include <opaque_fragment>
            float facing = abs(dot(normal, normalize(vViewPosition)));
            float wisp = noise3(vCloud * 4.0) * 0.5 + noise3(vCloud * 9.0) * 0.3 + noise3(vCloud * 19.0) * 0.2;
            gl_FragColor.a *= smoothstep(0.1, 0.95 + vSmoke * 0.35, facing + (wisp - 0.5) * (0.9 + vSmoke * 0.5)) * mix(0.55 - vSmoke * 0.2, 1.0, wisp);`,
          );
      };

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
      // World height of the subtitle's bottom edge: big clouds stay below it.
      const subtitle = section?.querySelector("h1")?.parentElement
        ?.nextElementSibling as HTMLElement | null | undefined;
      const copyBottom =
        subtitle && host.clientHeight
          ? (0.5 -
              (subtitle.getBoundingClientRect().bottom -
                host.getBoundingClientRect().top) /
                host.clientHeight) *
            2 *
            halfHeight
          : null;
      const random = seeded(Math.floor(Math.random() * 1e6));
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
        // Each one stretched a little differently, so no two read alike.
        const stretch = 1 + random() * 0.5;
        group.scale.set(
          flip * size * stretch,
          size * (0.85 + random() * 0.25),
          size,
        );
        scene.add(group);
        clouds.push({
          group,
          speed: dir * (0.1 + random() * 0.04),
        });
      };
      // Scattered like a real sky: a dense bank of small and medium clouds
      // along the demo card, a few big ones above it, kept off the copy, and
      // a sprinkle of small ones up under the nav and beside the demo card,
      // and a few medium and large ones framing the copy.
      const floor = (demoTop ?? -2) - 1.1;
      const top = halfHeight - 2.6;
      const bands: {
        count: number;
        low: number;
        high: number;
        variants: number[];
        sides?: [number, number];
      }[] = [
        {
          count: 11,
          low: floor - 0.4,
          high: floor + 1.4,
          variants: [0, 0, 1, 1, 2, 3],
        },
        {
          count: 5,
          low: floor + 1.4,
          high: top - 1.8,
          variants: [1, 2, 3, 4, 4],
        },
        { count: 7, low: top - 1.8, high: top, variants: [0, 0, 1] },
        {
          count: 6,
          low: halfHeight - 2.4,
          high: halfHeight - 0.9,
          variants: [0, 0, 1, 1, 2],
        },
        {
          count: 6,
          low: Math.max(floor - 4, 1 - halfHeight),
          high: floor - 0.6,
          variants: [0, 1, 1, 2],
          sides: [0.8, 1.1],
        },
        {
          count: 4,
          low: floor + 1.2,
          high: halfHeight - 1.6,
          variants: [2, 2, 3, 3],
          sides: [0.42, 0.95],
        },
      ];
      let index = 0;
      for (const { count, low, high, variants, sides } of bands) {
        for (let i = 0; i < count; i++) {
          const variant = variants[Math.floor(random() * variants.length)];
          let x = sides
            ? (i % 2 ? -1 : 1) *
              viewHalfWidth *
              (sides[0] + random() * (sides[1] - sides[0]))
            : (random() * 2 - 1) * viewHalfWidth * 1.1;
          if (variant >= 3 && Math.abs(x) < viewHalfWidth * 0.35) {
            x = Math.sign(x || 1) * viewHalfWidth * (0.35 + random() * 0.6);
          }
          let y = low + random() * (high - low) - 0.8;
          if (variant >= 3 && copyBottom !== null) {
            y = Math.min(y, copyBottom - SIZES[variant] * 0.5 - random() * 0.6);
          }
          // Alternate directions, so clouds pass and overlap each other.
          addCloud(variant, x, y, index++ % 2 ? -1 : 1);
        }
      }

      /* Wisps: small puffs of vapour that tear off a cloud's edge and drift
         away thinning out, or drift in from nearby and melt into one. Each
         rides along with its host cloud and fades on its own material. */
      const hosts = clouds.filter((cloud) => Math.abs(cloud.group.scale.y) > 1);
      const wisps: {
        mesh: Mesh;
        fade: MeshLambertMaterial;
        host: Object3D;
        from: [number, number];
        to: [number, number];
        size: number;
        joining: boolean;
        age: number;
        life: number;
      }[] = [];
      const launch = (wisp: (typeof wisps)[number], age = 0) => {
        const host = hosts[Math.floor(random() * hosts.length)];
        if (!host) return;
        const reach = Math.abs(host.group.scale.x) * 0.6;
        const side = random() < 0.5 ? -1 : 1;
        const edge: [number, number] = [
          side * reach * (0.6 + random() * 0.3),
          Math.abs(host.group.scale.y) * (random() * 0.35 - 0.05),
        ];
        const away: [number, number] = [
          edge[0] + side * (1.2 + random() * 1.6),
          edge[1] + (random() - 0.3) * 0.8,
        ];
        wisp.joining = random() < 0.4;
        wisp.from = wisp.joining ? away : edge;
        wisp.to = wisp.joining ? edge : away;
        wisp.host = host.group;
        wisp.size = 0.25 + random() * 0.35;
        wisp.life = 22 + random() * 16;
        wisp.age = age;
        wisp.mesh.rotation.x = host.group.rotation.x;
        wisp.mesh.scale.x = (random() < 0.5 ? -1 : 1) * wisp.size;
      };
      const placeWisp = (wisp: (typeof wisps)[number]) => {
        const k = wisp.age / wisp.life;
        const eased = k * k * (3 - 2 * k);
        const { position } = wisp.host;
        wisp.mesh.position.set(
          position.x + wisp.from[0] + (wisp.to[0] - wisp.from[0]) * eased,
          position.y + wisp.from[1] + (wisp.to[1] - wisp.from[1]) * eased,
          position.z + 0.3,
        );
        // Leaving wisps swell as they thin; joining ones shrink as they merge.
        const swell = wisp.joining ? 1.2 - 0.5 * k : 0.7 + 0.6 * k;
        const size = wisp.size * swell;
        wisp.mesh.scale.set(
          Math.sign(wisp.mesh.scale.x) * size * 1.4,
          size,
          size,
        );
        wisp.fade.opacity = Math.min(1, k / 0.2, (1 - k) / 0.35) * 0.85;
      };
      for (let i = 0; i < WISP_COUNT && hosts.length; i++) {
        const fade = material.clone();
        fade.onBeforeCompile = material.onBeforeCompile;
        fade.depthWrite = false;
        const mesh = new THREE.Mesh(shapes[0], fade);
        scene.add(mesh);
        const wisp = {
          mesh,
          fade,
          host: mesh,
          from: [0, 0] as [number, number],
          to: [0, 0] as [number, number],
          size: 1,
          joining: false,
          age: 0,
          life: 1,
        };
        launch(wisp);
        wisp.age = random() * wisp.life;
        placeWisp(wisp);
        wisps.push(wisp);
      }

      // Compile the shaders off the main thread where the browser can, rather
      // than stalling the first frame on them.
      await renderer.compileAsync(scene, camera);
      if (disposed) {
        for (const shape of shapes) shape.dispose();
        material.dispose();
        for (const wisp of wisps) wisp.fade.dispose();
        renderer.dispose();
        renderer.domElement.remove();
        return;
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
        for (const wisp of wisps) {
          wisp.age += dt;
          if (wisp.age >= wisp.life) launch(wisp);
          placeWisp(wisp);
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
        for (const wisp of wisps) wisp.fade.dispose();
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
      className="absolute inset-0 opacity-90 blur-[3px] [mask-image:radial-gradient(560px_230px_at_50%_240px,rgb(0_0_0/0.35)_60%,black_100%)]"
    />
  );
}
