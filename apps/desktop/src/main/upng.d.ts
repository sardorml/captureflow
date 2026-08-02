// upng-js has no published types. Declare the slim surface the
// screenshot-compress module uses on the Electron main side: decode a
// PNG buffer, project to RGBA, re-encode with `cnum: 256` to get
// compact indexed-palette PNG output.

declare module "upng-js" {
  type EncodeBuffer = ArrayBuffer | Uint8Array;
  type DecodedPng = {
    width: number;
    height: number;
    depth: number;
    ctype: number;
    frames: unknown[];
    tabs: unknown;
    data: Uint8Array;
  };
  type UPNGStatic = {
    decode(input: EncodeBuffer): DecodedPng;
    toRGBA8(img: DecodedPng): ArrayBuffer[];
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
