"use client";

import { theme } from "antd";

// Ant Design's homepage hero glow ("LuminousBg"): three large, heavily-blurred
// colour blobs drifting over the theme's container background. Because the base
// is `colorBgContainer`, the effect is theme-aware automatically — neon-on-black
// in dark mode, soft pastel-on-white in light mode.

const STYLE = `
@keyframes cf-hero-drift-a {
  0%, 100% { transform: translate(-50%, -50%) translate(0, 0); }
  50% { transform: translate(-50%, -50%) translate(120px, 90px); }
}
@keyframes cf-hero-drift-b {
  0%, 100% { transform: translate(-50%, -50%) translate(0, 0); }
  50% { transform: translate(-50%, -50%) translate(-110px, -70px); }
}
@keyframes cf-hero-drift-c {
  0%, 100% { transform: translate(-50%, -50%) translate(0, 0); }
  50% { transform: translate(-50%, -50%) translate(-150px, 60px); }
}
@media (prefers-reduced-motion: reduce) {
  .cf-hero-blob { animation: none !important; }
}
`;

function blob(
  color: string,
  opacity: number,
  left: string,
  top: string,
  animation: string,
): React.CSSProperties {
  return {
    position: "absolute",
    left,
    top,
    width: 300,
    height: 300,
    borderRadius: "50%",
    background: color,
    opacity,
    filter: "blur(100px)",
    transform: "translate(-50%, -50%)",
    transition: "all 5s ease-in-out",
    animation,
    willChange: "transform",
  };
}

export function HeroLuminousBg() {
  const { token } = theme.useToken();
  const bg = token.colorBgContainer;

  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background: bg,
        zIndex: 0,
        perspective: 800,
      }}
    >
      <style>{STYLE}</style>
      <div
        className="cf-hero-blob"
        style={blob(
          "#ee35f1",
          0.2,
          "0vw",
          "45vh",
          "cf-hero-drift-a 18s ease-in-out infinite",
        )}
      />
      <div
        className="cf-hero-blob"
        style={blob(
          "#5939dc",
          0.1,
          "30vw",
          "100%",
          "cf-hero-drift-b 22s ease-in-out infinite",
        )}
      />
      <div
        className="cf-hero-blob"
        style={blob(
          "#00d6ff",
          0.2,
          "100%",
          "12%",
          "cf-hero-drift-c 20s ease-in-out infinite",
        )}
      />
      {/* Fade the glow into the page background before the demo mockup. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(to bottom, transparent 45%, ${bg} 100%)`,
        }}
      />
    </div>
  );
}
