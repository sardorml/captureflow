const WELD_TOLERANCE = 1e-4;

/*
 * Welds the marching-cubes triangle soup into an indexed mesh, merging
 * vertices whose position and normal round to the same 1e-4 grid, the same
 * rule as three's mergeVertices but on a numeric hash table instead of
 * string keys, which made it the slowest step of the build.
 */
export function weld(
  positions: Float32Array,
  normals: Float32Array,
  count: number,
) {
  const scale = Math.pow(10, Math.log10(1 / WELD_TOLERANCE));
  const offset = WELD_TOLERANCE * 0.5 * scale;
  const keys = new Int32Array(count * 6);
  for (let i = 0; i < count * 3; i++) {
    const k = (i - (i % 3)) * 2 + (i % 3);
    keys[k] = Math.trunc(positions[i] * scale + offset);
    keys[k + 3] = Math.trunc(normals[i] * scale + offset);
  }
  let size = 1;
  while (size < count * 2) size <<= 1;
  const table = new Int32Array(size).fill(-1);
  const index = new Uint32Array(count);
  const kept: number[] = [];
  for (let v = 0; v < count; v++) {
    const k = v * 6;
    let hash = 0;
    for (let j = 0; j < 6; j++)
      hash = Math.imul(hash ^ keys[k + j], 0x9e3779b1);
    let slot = (hash ^ (hash >>> 15)) & (size - 1);
    for (;;) {
      const found = table[slot];
      if (found === -1) {
        table[slot] = kept.length;
        index[v] = kept.length;
        kept.push(v);
        break;
      }
      const f = kept[found] * 6;
      let same = true;
      for (let j = 0; j < 6 && same; j++) same = keys[f + j] === keys[k + j];
      if (same) {
        index[v] = found;
        break;
      }
      slot = (slot + 1) & (size - 1);
    }
  }
  const position = new Float32Array(kept.length * 3);
  const normal = new Float32Array(kept.length * 3);
  kept.forEach((v, i) => {
    position.set(positions.subarray(v * 3, v * 3 + 3), i * 3);
    normal.set(normals.subarray(v * 3, v * 3 + 3), i * 3);
  });
  return { position, normal, index };
}

/*
 * Each vertex's distinct neighbours, in first-seen order, packed flat:
 * vertex v's run is list[start[v] .. start[v] + length[v]].
 */
export function neighbourLists(index: ArrayLike<number>, count: number) {
  const start = new Int32Array(count + 1);
  for (let i = 0; i < index.length; i++) start[index[i] + 1] += 2;
  for (let v = 0; v < count; v++) start[v + 1] += start[v];
  const list = new Int32Array(start[count]);
  const length = new Int32Array(count);
  const add = (v: number, n: number) => {
    const from = start[v];
    for (let i = from; i < from + length[v]; i++) if (list[i] === n) return;
    list[from + length[v]++] = n;
  };
  for (let i = 0; i < index.length; i += 3) {
    const a = index[i];
    const b = index[i + 1];
    const c = index[i + 2];
    add(a, b);
    add(a, c);
    add(b, a);
    add(b, c);
    add(c, a);
    add(c, b);
  }
  return { start, list, length };
}
