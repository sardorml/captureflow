import React from "react";
import { createRoot } from "react-dom/client";
import { isOverlaySurface } from "@/lib/surface";
import { sendMessage } from "@/lib/messaging";
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
}

const container = document.getElementById("root");
if (container) {
  createRoot(container).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
