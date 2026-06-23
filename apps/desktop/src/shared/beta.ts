// Defined at build time by electron.vite.config.ts from package.json#version (`-beta` suffix → true).
declare const __IS_BETA__: boolean

export const IS_BETA: boolean = __IS_BETA__
