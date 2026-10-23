import { sendMessage } from "@/lib/messaging";
import {
  getThemePreference,
  watchThemePreference,
  type ThemePreference,
} from "@/lib/storage";
import { isOverlaySurface } from "@/lib/surface";

const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");

export const resolveTheme = (preference: ThemePreference): "light" | "dark" =>
  preference === "system" ? (darkQuery.matches ? "dark" : "light") : preference;

/*
 * Paints the stored preference onto <html>, where HeroUI and popup.css key
 * their palettes, and keeps it painted: a change made in another surface or
 * to the OS setting lands without a reopen.
 */
export function keepThemePainted(): void {
  let preference: ThemePreference = "system";
  const paint = (): void => {
    const theme = resolveTheme(preference);
    document.documentElement.setAttribute("data-theme", theme);
    if (isOverlaySurface) {
      void sendMessage("setOverlayTheme", theme).catch(() => {});
    }
  };
  void getThemePreference().then((stored) => {
    preference = stored;
    paint();
  });
  watchThemePreference((stored) => {
    preference = stored;
    paint();
  });
  darkQuery.addEventListener("change", paint);
}
