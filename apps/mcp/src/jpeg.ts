const SOI = Buffer.from([0xff, 0xd8]);
const EOI = Buffer.from([0xff, 0xd9]);

// Cuts ffmpeg's MJPEG stream back into whole JPEGs; inside a JPEG's data 0xFF is always escaped, so EOI only ends one.
export function createJpegSplitter(onFrame: (jpeg: Buffer) => void) {
  let pending: Buffer = Buffer.alloc(0);
  return (chunk: Buffer) => {
    pending = pending.length ? Buffer.concat([pending, chunk]) : chunk;
    for (;;) {
      const start = pending.indexOf(SOI);
      if (start === -1) {
        // A trailing 0xFF may be the first half of the next frame's start marker.
        pending =
          pending.at(-1) === 0xff ? pending.subarray(-1) : Buffer.alloc(0);
        return;
      }
      const end = pending.indexOf(EOI, start + 2);
      if (end === -1) {
        pending = pending.subarray(start);
        return;
      }
      onFrame(Buffer.from(pending.subarray(start, end + 2)));
      pending = pending.subarray(end + 2);
    }
  };
}
