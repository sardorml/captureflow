// Dedicated worker for PNG re-encoding. Takes RGBA bytes from the
// editor's exported Konva stage and runs `UPNG.encode(..., cnum: 256)`
// — palette-quantised PNG-8 — which gets us Loom-class output size
// (~500 KB for a 3500×2300 screenshot+bg) at visually identical
// quality to a truecolor PNG. The encode is 2-5 seconds of pure-JS
// deflate; off-thread keeps the save button + the editor UI fully
// responsive while it runs.

import UPNG from 'upng-js';

type EncodeRequest = {
  buffer: ArrayBuffer; // raw RGBA bytes (width * height * 4)
  width: number;
  height: number;
  // `cnum` follows UPNG semantics: 0 = lossless truecolor (~2-3 MB),
  // 256 = indexed-palette PNG-8 (visually identical for screenshots,
  // ~5-10x smaller). The caller picks based on quality / size trade-
  // off; we default to 256 in the editor.
  cnum: number;
};

type EncodeOk = { ok: true; png: ArrayBuffer };
type EncodeErr = { ok: false; error: string };

self.onmessage = (e: MessageEvent<EncodeRequest>) => {
  const { buffer, width, height, cnum } = e.data;
  try {
    const png = UPNG.encode([buffer], width, height, cnum);
    const msg: EncodeOk = { ok: true, png };
    // Transfer the underlying ArrayBuffer to avoid a copy on the
    // boundary back to the main thread.
    (self as unknown as Worker).postMessage(msg, [png]);
  } catch (err) {
    const msg: EncodeErr = {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
    (self as unknown as Worker).postMessage(msg);
  }
};
