// upng-js ships no .d.ts. Declare the slim surface we touch — the
// editor's encode worker calls `UPNG.encode([rgbaBuffer], w, h, cnum)`
// to produce indexed-palette PNG bytes (`cnum: 256`) that match
// Loom-class output size for screenshots.

declare module "upng-js" {
  type EncodeBuffer = ArrayBuffer | Uint8Array;
  type UPNGStatic = {
    encode(
      buffers: EncodeBuffer[],
      width: number,
      height: number,
      cnum: number,
    ): ArrayBuffer;
  };
  const UPNG: UPNGStatic;
  export default UPNG;
}
