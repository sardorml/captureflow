"use client";

import { useEffect } from "react";
import { SUPPORT_EMAIL } from "@/lib/site";
import { whenIdle } from "@/lib/when-idle";

const WIDGET_SRC = "https://embed.tawk.to/6ae0fd6c631212346f9cc138/1k5vdrs5h";
// Ad blockers often stop the widget; past this, "Contact support" falls back to mail.
const OPEN_TIMEOUT_MS = 6000;

type TawkApi = {
  onLoad?: () => void;
  onChatMinimized?: () => void;
  showWidget?: () => void;
  hideWidget?: () => void;
  maximize?: () => void;
};

declare global {
  interface Window {
    Tawk_API?: TawkApi;
    Tawk_LoadStart?: Date;
  }
}

let onMarketingPage = false;
let openWhenLoaded = false;
let isLoaded = false;
let isBlocked = false;
let fallbackTimer: ReturnType<typeof setTimeout> | undefined;

function openMail() {
  window.location.href = `mailto:${SUPPORT_EMAIL}`;
}

function showChat(api: TawkApi) {
  api.showWidget?.();
  api.maximize?.();
}

function loadWidget() {
  if (document.querySelector(`script[src="${WIDGET_SRC}"]`)) return;
  const api: TawkApi = (window.Tawk_API = window.Tawk_API ?? {});
  api.onLoad = () => {
    isLoaded = true;
    clearTimeout(fallbackTimer);
    if (openWhenLoaded) {
      openWhenLoaded = false;
      showChat(api);
    } else if (!onMarketingPage) {
      api.hideWidget?.();
    }
  };
  // Outside the marketing pages the launcher only exists while a chat is open.
  api.onChatMinimized = () => {
    if (!onMarketingPage) api.hideWidget?.();
  };
  window.Tawk_LoadStart = new Date();
  const script = document.createElement("script");
  script.async = true;
  script.src = WIDGET_SRC;
  script.charset = "UTF-8";
  script.onerror = () => {
    isBlocked = true;
    clearTimeout(fallbackTimer);
    if (openWhenLoaded) {
      openWhenLoaded = false;
      openMail();
    }
  };
  document.body.appendChild(script);
}

// For "Contact support" in the app, where the widget isn't loaded up front.
export function openSupportChat() {
  const api = window.Tawk_API;
  if (isLoaded && api) {
    showChat(api);
    return;
  }
  if (isBlocked) {
    openMail();
    return;
  }
  openWhenLoaded = true;
  clearTimeout(fallbackTimer);
  fallbackTimer = setTimeout(() => {
    if (!openWhenLoaded) return;
    openWhenLoaded = false;
    openMail();
  }, OPEN_TIMEOUT_MS);
  loadWidget();
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
