"use client";

import { useEffect, useRef } from "react";
import type { Group } from "three";

const CLOUD_COUNT = 16;
const TOON_STEPS = [214, 255];
const RENDER_SCALE = 0.35;
const FRAME_MS = 1000 / 30;

function seeded(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

/*
 * Cartoon clouds drawn with three.js: each cloud is a row of squashed puffs
 * with one or two big bumps on top, flat white with a two-step toon shade,
 * drifting across at a speed set by depth. They sit along the top and the
 * sides, and a mask fades them out behind the headline so they never compete
 * with the copy. The scene renders at a fraction of the screen's resolution
 * and 30fps: the browser's upscale softens it like a blur would, for a
 * fraction of the GPU work. Only mounted in light mode. Rendering pauses while
 * the hero is off screen or the tab is hidden, and draws a single still frame
 * under reduced motion.
 */
export function CloudSky() {
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

      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "low-power",
      });
      renderer.setPixelRatio(RENDER_SCALE);
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      renderer.domElement.style.display = "block";
      host.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
      camera.position.set(0, 0, 22);

      scene.add(new THREE.HemisphereLight(0xffffff, 0xb9c6da, 2.2));
      const sun = new THREE.DirectionalLight(0xfff4e2, 2.2);
      sun.position.set(6, 9, 8);
      scene.add(sun);

      const ramp = new THREE.DataTexture(
        new Uint8Array(TOON_STEPS),
        TOON_STEPS.length,
        1,
        THREE.RedFormat,
      );
      ramp.minFilter = THREE.NearestFilter;
      ramp.magFilter = THREE.NearestFilter;
      ramp.needsUpdate = true;

      const material = new THREE.MeshToonMaterial({
        color: 0xffffff,
        gradientMap: ramp,
      });
      const puff = new THREE.SphereGeometry(1, 16, 12);

      const addPuff = (
        group: Group,
        x: number,
        y: number,
        z: number,
        sx: number,
        sy: number,
        sz: number,
      ) => {
        const body = new THREE.Mesh(puff, material);
        body.position.set(x, y, z);
        body.scale.set(sx, sy, sz);
        group.add(body);
      };

      const random = seeded(19);
      const clouds: {
        group: Group;
        speed: number;
        baseY: number;
        bob: number;
      }[] = [];
      for (let i = 0; i < CLOUD_COUNT; i++) {
        const group = new THREE.Group();
        const width = 3.4 + random() * 1.6;
        const bumps = 4 + Math.floor(random() * 3);
        for (let j = 0; j < bumps; j++) {
          const t = j / (bumps - 1);
          const r = 0.55 + Math.sin(t * Math.PI) * 0.6 + random() * 0.2;
          addPuff(
            group,
            (t - 0.5) * width,
            0.15,
            0.2,
            r * 0.9,
            r * 0.75,
            r * 0.6,
          );
        }
        const tops = 1 + Math.floor(random() * 2);
        for (let j = 0; j < tops; j++) {
          const r = 0.9 + random() * 0.35;
          const x = (tops === 1 ? 0 : (j - 0.5) * 1.2) + (random() - 0.5) * 0.5;
          addPuff(group, x, 0.75 + r * 0.25, 0, r, r, r * 0.7);
        }
        const depth = random();
        const x = (random() - 0.5) * 34;
        const side = Math.abs(x) > 8;
        group.position.set(
          x,
          side ? -4 + random() * 9 : 3.6 + random() * 2.4,
          -6 + depth * 6,
        );
        group.scale.setScalar(0.16 + depth * 0.2);
        scene.add(group);
        clouds.push({
          group,
          speed: 0.05 + depth * 0.08,
          baseY: group.position.y,
          bob: random() * Math.PI * 2,
        });
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
        halfWidth = halfHeight * camera.aspect + 6;
        renderer.render(scene, camera);
      };
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(host);
      resize();

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
        for (const cloud of clouds) {
          const { group } = cloud;
          group.position.x += cloud.speed * dt;
          if (group.position.x > halfWidth) group.position.x = -halfWidth;
          group.position.y =
            cloud.baseY + Math.sin(now / 2400 + cloud.bob) * 0.12;
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
        resizeObserver.disconnect();
        intersection.disconnect();
        puff.dispose();
        material.dispose();
        ramp.dispose();
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
