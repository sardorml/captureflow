import { describe, expect, it } from "vitest";
import { createJpegSplitter } from "./jpeg";

const jpeg = (body: number[]) => Buffer.from([0xff, 0xd8, ...body, 0xff, 0xd9]);

describe("createJpegSplitter", () => {
  it("cuts a stream into whole frames, however the chunks fall", () => {
    const frames: Buffer[] = [];
    const push = createJpegSplitter((f) => frames.push(f));
    const stream = Buffer.concat([
      jpeg([1, 2, 0xff, 0x00, 3]),
      jpeg([4]),
      jpeg([5, 6]),
    ]);
    for (let i = 0; i < stream.length; i += 3) push(stream.subarray(i, i + 3));
    expect(frames).toEqual([
      jpeg([1, 2, 0xff, 0x00, 3]),
      jpeg([4]),
      jpeg([5, 6]),
    ]);
  });

  it("holds an unfinished frame until its end arrives", () => {
    const frames: Buffer[] = [];
    const push = createJpegSplitter((f) => frames.push(f));
    push(Buffer.from([0xff, 0xd8, 7]));
    expect(frames).toHaveLength(0);
    push(Buffer.from([0xff, 0xd9]));
    expect(frames).toEqual([jpeg([7])]);
  });
});
