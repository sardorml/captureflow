"use client";

import { useEffect } from "react";
import { whenIdle } from "@/lib/when-idle";

const WIDGET_SRC = "https://embed.tawk.to/6ae0fd6c631212346f9cc138/1k5vdrs5h";

type TawkApi = {
  onLoad?: () => void;
  showWidget?: () => void;
  hideWidget?: () => void;
};

declare global {
  interface Window {
    Tawk_API?: TawkApi;
    Tawk_LoadStart?: Date;
  }
}

let onMarketingPage = false;

function loadWidget() {
  if (document.querySelector(`script[src="${WIDGET_SRC}"]`)) return;
  const api: TawkApi = (window.Tawk_API = window.Tawk_API ?? {});
  api.onLoad = () => {
    if (!onMarketingPage) api.hideWidget?.();
  };
  window.Tawk_LoadStart = new Date();
  const script = document.createElement("script");
  script.async = true;
  script.src = WIDGET_SRC;
  script.charset = "UTF-8";
  document.body.appendChild(script);
}

// The widget mounts on <body> and outlives client navigations, so it is hidden
// whenever the visitor leaves the marketing pages for the app.
export function SupportChat() {
  useEffect(() => {
    onMarketingPage = true;
    const cancel = whenIdle(loadWidget);
    window.Tawk_API?.showWidget?.();
    return () => {
      onMarketingPage = false;
      cancel();
      window.Tawk_API?.hideWidget?.();
    };
  }, []);
  return null;
}
