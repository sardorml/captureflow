import { describe, expect, it } from "vitest";
import { BufferAttribute, BufferGeometry } from "three";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { neighbourLists, weld } from "./cloud-mesh";

function soup(seed: number, count: number) {
  let state = seed;
  const random = () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
  const pool = Array.from({ length: Math.ceil(count / 4) }, () =>
    Array.from({ length: 6 }, () => random() * 2 - 1),
  );
  const positions = new Float32Array(count * 3);
  const normals = new Float32Array(count * 3);
  for (let v = 0; v < count; v++) {
    const pick = pool[Math.floor(random() * pool.length)];
    // Some copies land just inside the tolerance, some just outside it.
    const nudge = random() < 0.2 ? (random() - 0.5) * 3e-4 : 0;
    positions.set([pick[0] + nudge, pick[1], pick[2]], v * 3);
    normals.set([pick[3], pick[4], pick[5]], v * 3);
  }
  return { positions, normals };
}

describe("weld", () => {
  it("merges exactly the vertices three's mergeVertices does", () => {
    const count = 3000;
    const { positions, normals } = soup(7, count);
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(positions, 3));
    geometry.setAttribute("normal", new BufferAttribute(normals, 3));
    const expected = mergeVertices(geometry, 1e-4);

    const welded = weld(positions, normals, count);

    expect(Array.from(welded.index)).toEqual(
      Array.from(expected.getIndex()!.array),
    );
    expect(welded.position).toEqual(expected.getAttribute("position").array);
    expect(welded.normal).toEqual(expected.getAttribute("normal").array);
  });

  it("keeps vertices whose normals differ apart", () => {
    const positions = new Float32Array([0, 0, 0, 0, 0, 0]);
    const normals = new Float32Array([0, 1, 0, 1, 0, 0]);
    expect(weld(positions, normals, 2).position.length).toBe(6);
  });
});

describe("neighbourLists", () => {
  it("lists each vertex's distinct neighbours in first-seen order", () => {
    const { start, list, length } = neighbourLists([0, 1, 2, 0, 2, 3], 4);
    const of = (v: number) =>
      Array.from(list.subarray(start[v], start[v] + length[v]));
    expect(of(0)).toEqual([1, 2, 3]);
    expect(of(1)).toEqual([0, 2]);
    expect(of(2)).toEqual([0, 1, 3]);
    expect(of(3)).toEqual([0, 2]);
  });
});
