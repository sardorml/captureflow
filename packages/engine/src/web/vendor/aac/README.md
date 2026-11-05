# AAC-LC encoder (WebAssembly)

FFmpeg's native AAC encoder compiled to WebAssembly, taken from
`@mediabunny/aac-encoder` 1.65.2 (`packages/aac-encoder/build/aac.js` at
commit cce92cb0f131f522295dc0797962fb1f5d3c1f44 of
https://github.com/Vanilagy/mediabunny). Only the Emscripten module is used;
the Mediabunny plugin around it is not.

- `aac.js` — the module, with the `.wasm` inlined (`SINGLE_FILE`), MPL-2.0 for
  the bridge and glue, see `LICENSE`.
- `bridge.c` — the C side the module exports; the source for the build.
- FFmpeg is LGPL v2.1 or later (`COPYING.LGPLv2.1`, `FFMPEG-LICENSE.md`); the
  build enables only the `aac` encoder and no GPL or nonfree components.

The upstream README describes rebuilding with Emscripten.
