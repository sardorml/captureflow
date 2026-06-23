import UPNG from "upng-js";

type EncodeRequest = {
  buffer: ArrayBuffer; // raw RGBA bytes (width * height * 4)
  width: number;
  height: number;
  // UPNG semantics: 0 = lossless truecolor, 256 = indexed PNG-8.
  cnum: number;
};

type EncodeOk = { ok: true; png: ArrayBuffer };
type EncodeErr = { ok: false; error: string };

self.onmessage = (e: MessageEvent<EncodeRequest>) => {
  const { buffer, width, height, cnum } = e.data;
  try {
    const png = UPNG.encode([buffer], width, height, cnum);
    const msg: EncodeOk = { ok: true, png };
    (self as unknown as Worker).postMessage(msg, [png]);
  } catch (err) {
    const msg: EncodeErr = {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
    (self as unknown as Worker).postMessage(msg);
  }
};
