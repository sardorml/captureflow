import { useEffect, useState } from "react";
import { Button, ColorArea, ColorSlider, Typography } from "@heroui/react";
import {
  applyPanelTheme,
  clearPanelTheme,
  getPanelTheme,
  hslToHex,
  panelVars,
  setPanelTheme,
  SHIPPED_PANEL,
  type PanelHsl,
} from "@/lib/dev/panel-theme";

/*
 * TEMPORARY, dev builds only. Delete this file, lib/dev/panel-theme.ts, and the
 * mount in App.tsx once a colour is picked and written into popup.css.
 *
 * Everything here is in-page on purpose: a native <input type="color"> opens an
 * OS dialog, and the action popup closes the moment it loses focus, so the
 * picker would take the panel down with it every time it opened.
 */

const PRESETS: { label: string; base: PanelHsl }[] = [
  { label: "Shipped", base: SHIPPED_PANEL },
  { label: "Neutral", base: { h: 0, s: 0, l: 13 } },
  { label: "Slate", base: { h: 215, s: 16, l: 14 } },
  { label: "Warm", base: { h: 30, s: 8, l: 13 } },
  { label: "Ink", base: { h: 240, s: 14, l: 9 } },
  { label: "Forest", base: { h: 160, s: 12, l: 12 } },
];

const asCss = ({ h, s, l }: PanelHsl): string => `hsl(${h}, ${s}%, ${l}%)`;

export function DevThemePicker() {
  const [base, setBase] = useState<PanelHsl>(SHIPPED_PANEL);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    void getPanelTheme().then((stored) => {
      if (stored) setBase(stored);
    });
  }, []);

  const choose = (next: PanelHsl) => {
    setBase(next);
    setCopied(false);
    applyPanelTheme(next);
    void setPanelTheme(next);
  };

  const vars = panelVars(base);
  const css = Object.entries(vars)
    .map(([name, value]) => `  ${name}: ${value};`)
    .join("\n");

  return (
    <section className="border-default-200/40 mt-1 flex flex-col gap-2 rounded-xl border border-dashed p-2.5">
      <Typography type="body-xs" color="muted">
        Panel colour — dev only
      </Typography>

      <ColorArea
        colorSpace="hsl"
        xChannel="saturation"
        yChannel="lightness"
        value={asCss(base)}
        onChange={(color) => {
          const hsl = color.toFormat("hsl");
          choose({
            h: Math.round(hsl.getChannelValue("hue")),
            s: Math.round(hsl.getChannelValue("saturation")),
            l: Math.round(hsl.getChannelValue("lightness")),
          });
        }}
        className="h-24 w-full rounded-lg"
      >
        <ColorArea.Thumb />
      </ColorArea>

      <ColorSlider
        channel="hue"
        colorSpace="hsl"
        value={asCss(base)}
        onChange={(color) => {
          const hsl = color.toFormat("hsl");
          choose({ ...base, h: Math.round(hsl.getChannelValue("hue")) });
        }}
        className="w-full"
      >
        <ColorSlider.Track>
          <ColorSlider.Thumb />
        </ColorSlider.Track>
      </ColorSlider>

      <div className="flex flex-wrap gap-1">
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            title={preset.label}
            aria-label={preset.label}
            onClick={() => choose(preset.base)}
            style={{ background: hslToHex(preset.base) }}
            className="border-default-300/50 h-6 w-6 rounded-md border"
          />
        ))}
      </div>

      {/* The three values together, because --surface and --overlay are derived
          from the base and are what actually has to land in popup.css. */}
      <pre className="text-fg-muted overflow-x-auto text-[10px] leading-4">
        {css}
      </pre>

      <div className="flex gap-1">
        <Button
          size="sm"
          variant="secondary"
          onPress={() => {
            void navigator.clipboard.writeText(css).then(() => setCopied(true));
          }}
        >
          {copied ? "Copied" : "Copy"}
        </Button>
        {/* Removes the inline vars rather than re-applying the shipped ones:
            round-tripping through HSL lands a channel or two off, and reset
            should hand the panel back to popup.css exactly. */}
        <Button
          size="sm"
          variant="ghost"
          onPress={() => {
            setBase(SHIPPED_PANEL);
            setCopied(false);
            clearPanelTheme();
            void setPanelTheme(null);
          }}
        >
          Reset
        </Button>
      </div>
    </section>
  );
}
