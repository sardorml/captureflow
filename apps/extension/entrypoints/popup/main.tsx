import React from "react";
import { createRoot } from "react-dom/client";
import { closeSurface, isOverlaySurface } from "@/lib/surface";
import { sendMessage } from "@/lib/messaging";
import { applyPanelTheme, getPanelTheme } from "@/lib/dev/panel-theme";
import { App } from "./App";
import "./popup.css";

// The SW sizes the overlay iframe to the panel's content height.
if (isOverlaySurface) {
  document.body.classList.add("cf-overlay");
  const reportHeight = () => {
    const height = document.body.scrollHeight;
    if (height > 0) {
      void sendMessage("setOverlayHeight", { height }).catch(() => {});
    }
  };
  new ResizeObserver(reportHeight).observe(document.body);

  /*
   * The frame reaches past the card so menus can open beside it, which puts
   * the gutter out of the page-side backdrop's reach — those clicks land on
   * this document instead, and mean the same thing: close. Not while a menu
   * is open; that press is the menu's own dismiss.
   */
  document.addEventListener("mousedown", (event) => {
    if (event.target !== document.body) return;
    if (document.querySelector('[aria-expanded="true"]')) return;
    closeSurface();
  });
}

const container = document.getElementById("root");
if (container) {
  // Temporary: awaited so a stored dev colour is on the body before the first
  // paint — applying it after would flash the shipped colour on every open.
  const ready =
    import.meta.env.MODE === "production"
      ? Promise.resolve()
      : getPanelTheme().then((stored) => {
          if (stored) applyPanelTheme(stored);
        });

  void ready.then(() => {
    createRoot(container).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );
  });
}
