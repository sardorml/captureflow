/*
 * TEMPORARY, dev builds only — lets the panel's background be chosen in place
 * instead of guessed at in a diff. Once a colour is settled, write it into
 * popup.css and delete this file, DevThemePicker, and their two call sites.
 */

export type PanelHsl = { h: number; s: number; l: number };

// popup.css's shipped palette, as HSL: #1e1e24 / #2c2c35 / #31313b.
export const SHIPPED_PANEL: PanelHsl = { h: 240, s: 9, l: 13 };

/*
 * --surface (rows) and --overlay (menus) take the background's hue and
 * saturation and sit a fixed lightness above it. popup.css already notes the
 * steps between the three have to survive a change to the base, so they are
 * derived here rather than picked separately.
 */
const SURFACE_STEP = 6;
const OVERLAY_STEP = 8;

export function hslToHex({ h, s, l }: PanelHsl): string {
  const sat = s / 100;
  const lit = l / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = sat * Math.min(lit, 1 - lit);
  const channel = (n: number) =>
    Math.round(255 * (lit - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1))));
  return `#${[channel(0), channel(8), channel(4)]
    .map((v) => v.toString(16).padStart(2, "0"))
    .join("")}`;
}

export function panelVars(base: PanelHsl): Record<string, string> {
  return {
    "--background": hslToHex(base),
    "--surface": hslToHex({ ...base, l: base.l + SURFACE_STEP }),
    "--overlay": hslToHex({ ...base, l: base.l + OVERLAY_STEP }),
  };
}

/*
 * Set on body, which is where popup.css declares them — the overlay's card
 * reads the same variables, so both surfaces follow from the one write.
 */
export function applyPanelTheme(base: PanelHsl): void {
  for (const [name, value] of Object.entries(panelVars(base))) {
    document.body.style.setProperty(name, value);
  }
}

export function clearPanelTheme(): void {
  for (const name of Object.keys(panelVars(SHIPPED_PANEL))) {
    document.body.style.removeProperty(name);
  }
}

// local:, so a choice survives the popup closing on blur — which it does on
// every click outside it.
const panelThemeItem = storage.defineItem<PanelHsl | null>(
  "local:devPanelTheme",
  { fallback: null },
);

export const getPanelTheme = (): Promise<PanelHsl | null> =>
  panelThemeItem.getValue();

export const setPanelTheme = (base: PanelHsl | null): Promise<void> =>
  panelThemeItem.setValue(base);
