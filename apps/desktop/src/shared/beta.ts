// Beta-flow gate. Set at build time from package.json#version (`-beta`
// suffix → true) by `electron.vite.config.ts`. Drop the suffix in
// package.json to flip every beta-only path off in one go.
declare const __IS_BETA__: boolean

export const IS_BETA: boolean = __IS_BETA__
