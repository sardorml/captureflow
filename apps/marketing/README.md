# @captureflow/marketing

Local studio for CaptureFlow marketing assets. Images and GIFs are written with Claude Code,
video is edited in the [HyperFrames](https://hyperframes.heygen.com) Studio, and every render is
saved to one library. Never deployed. Needs FFmpeg (`brew install ffmpeg`).

```bash
pnpm --filter @captureflow/marketing dev   # http://localhost:3036
```

| Page    | What it does                                                               |
| ------- | -------------------------------------------------------------------------- |
| Images  | Compositions in `hyperframes/images/`, rendered to PNG                     |
| GIFs    | Compositions in `hyperframes/gifs/`, rendered to GIF                       |
| Video   | Embeds the HyperFrames Studio (:3037) and renders `hyperframes/index.html` |
| Library | Every render in `library/` with preview, download and delete               |

Each page has a prompt box: describe what you want, copy the prompt into Claude Code, and the
new composition appears on reload. From a terminal, `pnpm make gifs/<name>.html` (or
`images/<name>.html`, or `video`) renders straight into the library. HyperFrames telemetry is off
in every script.
