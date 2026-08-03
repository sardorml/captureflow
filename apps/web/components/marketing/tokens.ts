/*
 * Design tokens for the marketing tree, keyed by the names its inline styles
 * already use. Colors resolve to CSS variables so light/dark still tracks
 * `data-theme` — `--cf-*` for our own ramps, unprefixed for the semantic
 * colors HeroUI owns. The spacing/radius/shadow entries are fixed values
 * matching the scale the sections were built against.
 */
export const TOKENS = {
  colorText: "var(--cf-fg)",
  colorTextSecondary: "var(--cf-fg-muted)",
  colorTextTertiary: "var(--cf-fg-subtle)",
  colorTextQuaternary: "var(--cf-fg-subtle)",
  colorWhite: "#ffffff",

  /* Marketing is dark-only and its surfaces are independent of the dashboard
     chrome tokens, which are keyed to sidebar-vs-content contrast. */
  colorBgContainer: "#141414",
  colorBgLayout: "#0f0f0f",
  colorFillTertiary: "var(--cf-tint)",

  colorBorder: "var(--cf-line-strong)",
  colorBorderSecondary: "var(--cf-line)",
  colorSplit: "var(--cf-line)",

  colorPrimary: "var(--cf-accent-bg)",
  colorPrimaryBg: "var(--accent-soft)",
  colorPrimaryBgHover: "var(--accent-soft)",

  colorError: "var(--danger)",
  colorSuccess: "#22c55e",
  colorWarning: "#f59e0b",

  borderRadius: 6,
  borderRadiusLG: 8,

  paddingXXS: 4,
  paddingXS: 8,
  marginMD: 20,
  marginLG: 24,

  fontSizeLG: 16,
  fontFamilyCode: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",

  boxShadowSecondary:
    "0 6px 16px 0 rgb(0 0 0 / 0.08), 0 3px 6px -4px rgb(0 0 0 / 0.12), 0 9px 28px 8px rgb(0 0 0 / 0.05)",
} as const;
