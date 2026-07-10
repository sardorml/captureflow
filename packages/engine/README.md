# @captureflow/engine

MIT-licensed capture engine shared by the CaptureFlow desktop app and browser
extension. It owns everything between "the OS hands us media" and "a
consistent, uploadable recording": the macOS capture sidecars, the native
record protocol, and the browser-side mux/recording pipelines. Upload
transports, auth, quota, and UI stay in the (AGPL-licensed) apps.

## Output contract

Every application that records through the engine produces the same artifacts:

| Artifact | Format                                                                                                                                   |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Screen   | Fragmented MP4, H.264 (avc1), aspect-fit ≤ 1920×1080, 8 Mbps target, 60 fps target; AAC-LC audio when the platform provides system audio |
| Webcam   | WebM (VP9/VP8 + Opus)                                                                                                                    |
| Poster   | JPEG (first keyframe)                                                                                                                    |

The constants live in `src/contract.ts` (`ENGINE_OUTPUT`); the fragmented-MP4
muxer in `src/web/fmp4-mux.ts` is the single mux implementation every frame
source feeds.

Two frame sources feed that muxer:

- **Native records** (macOS): the `screen-recorder` sidecar encodes with
  VideoToolbox and streams pre-encoded H.264/AAC records over a pipe — no
  re-encode, no transcode. This is the desktop app's path.
- **MediaStream** (any Chromium runtime): `getDisplayMedia` →
  `MediaStreamTrackProcessor` → `VideoEncoder` configured from the contract.
  This is the browser extension's path, and the path a future Windows desktop
  app would use (Chromium has WASAPI loopback audio on Windows) — Windows
  needs no native sidecar.

## Package layout

```
src/
├── index.ts        "." barrel: shared types + output contract
├── types.ts
├── contract.ts     ENGINE_OUTPUT constants
├── main/           "./main" — Node-only (no Electron imports)
│   ├── screen-recorder.ts    sidecar spawn/lifecycle factory
│   ├── recording-wire.ts     record-protocol parser
│   ├── window-detector.ts    window-detector sidecar factory
│   └── snapshot.ts           one-shot PNG capture
└── web/            "./web" — browser runtime (desktop renderer + extension)
    ├── fmp4-mux.ts           records/encoded chunks → fragmented MP4
    ├── record-pipeline.ts    native-record stream → fmp4-mux
    ├── stream-recorder.ts    MediaStream → VideoEncoder → fmp4-mux
    ├── poster.ts             first-keyframe JPEG
    └── webcam.ts             camera/mic acquisition + WebM webcam recorder
native/
└── mac/            macOS sidecars (Swift sources + committed universal bins)
    ├── screen-recorder/
    └── window-detector/
```

## Native record protocol (macOS sidecar contract)

The `screen-recorder` binary takes its config as JSON in `argv[1]`, emits JSON
status/health lines on stdout, and accepts `pause` / `resume` / `stop` lines
on stdin. When streaming is configured it writes length-prefixed binary
records to the file descriptor given in the config (the desktop app passes
fd 3). All multi-byte integers are little-endian:

| Tag    | Record                                        | Layout after the tag byte                                                                                      |
| ------ | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `0x01` | Video format (once, after first encode)       | u32 width, u32 height, u32 fps, u32 descLen, descLen bytes of avcC                                             |
| `0x02` | Video chunk (one per frame)                   | u8 flags (bit0 = keyframe), i64 ptsUs, u32 durationUs, u32 dataLen, dataLen bytes of length-prefixed NAL units |
| `0x03` | Audio format (once, before first audio chunk) | u32 sampleRate, u32 channelCount, u32 descLen, descLen bytes of AudioSpecificConfig                            |
| `0x04` | Audio chunk (one per AAC packet)              | i64 ptsUs, u32 durationUs, u32 dataLen, dataLen bytes of raw AAC (no ADTS)                                     |
| `0xFF` | End of stream                                 | (1 byte total)                                                                                                 |

Video PTS is relative to the first emitted chunk; audio PTS to the first
audio packet — independent clocks the muxer reconciles at write time. The
tap is not gated on pause: chunks keep flowing with wall-clock PTS while
paused, and the mux stage splices them out.

Windows does not implement this protocol; there is deliberately no Windows
sidecar (see the MediaStream path above).

## Rebuilding the native binaries

The universal (arm64 + x86_64, macOS 13.2+) binaries are committed under
`native/mac/<name>/bin/`. There is no build step in CI — after editing any
`.swift` source, rebuild and commit the binary:

```sh
scripts/build-native.sh --universal
```

The script prints `lipo -info` and the `minos` line for each binary; check
that both slices are present and `minos` reads `13.2` (Xcode defaults have
regressed this before). Omit `--universal` for a quicker arm64-only dev
build, but ship universal.
