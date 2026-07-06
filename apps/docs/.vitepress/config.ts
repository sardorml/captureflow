import { defineConfig } from "vitepress";

const GITHUB = "https://github.com/sardorml/captureflow";

export default defineConfig({
  title: "CaptureFlow",
  description:
    "Open-source, self-hostable screen recording with instant shareable links.",
  cleanUrls: true,
  lastUpdated: true,
  appearance: "dark",
  // The docs app's own README is developer-facing, not a site page.
  srcExclude: ["**/README.md"],
  head: [
    ["link", { rel: "icon", href: "/favicon.ico" }],
    ["meta", { name: "theme-color", content: "#5b7cfa" }],
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:title", content: "CaptureFlow Docs" }],
    [
      "meta",
      {
        property: "og:description",
        content:
          "Open-source, self-hostable screen recording with instant shareable links.",
      },
    ],
  ],
  themeConfig: {
    logo: "/logo.png",
    siteTitle: "CaptureFlow",

    nav: [
      { text: "Guide", link: "/", activeMatch: "^/(guide/.*)?$" },
      {
        text: "Self-Hosting",
        link: "/self-hosting/overview",
        activeMatch: "/self-hosting/",
      },
      {
        text: "Developer",
        link: "/developer/architecture",
        activeMatch: "/developer/",
      },
      {
        text: "Reference",
        link: "/reference/faq",
        activeMatch: "/reference/",
      },
      {
        text: "v0.1",
        items: [
          { text: "Changelog", link: `${GITHUB}/releases` },
          { text: "License (AGPL-3.0)", link: `${GITHUB}/blob/main/LICENSE` },
        ],
      },
    ],

    sidebar: [
      {
        text: "Introduction",
        collapsed: false,
        items: [
          { text: "What is CaptureFlow?", link: "/" },
          { text: "How it works", link: "/guide/how-it-works" },
        ],
      },
      {
        text: "Getting Started",
        collapsed: false,
        items: [
          { text: "Install the app", link: "/guide/install" },
          { text: "Record your screen", link: "/guide/recording" },
          { text: "Recording a recording", link: "/guide/sharing" },
          { text: "Screenshots (screenshots)", link: "/guide/screenshots" },
        ],
      },
      {
        text: "Self-Hosting",
        collapsed: false,
        items: [
          { text: "Overview", link: "/self-hosting/overview" },
          { text: "Deploy to Cloudflare", link: "/self-hosting/cloudflare" },
          { text: "Configuration & env", link: "/self-hosting/configuration" },
          { text: "Point the desktop app", link: "/self-hosting/desktop" },
        ],
      },
      {
        text: "Developer",
        collapsed: false,
        items: [
          { text: "Architecture", link: "/developer/architecture" },
          { text: "Build from source", link: "/developer/build" },
          { text: "Contributing", link: "/developer/contributing" },
        ],
      },
      {
        text: "Reference",
        collapsed: false,
        items: [
          { text: "Storage & limits", link: "/reference/limits" },
          { text: "Troubleshooting", link: "/reference/troubleshooting" },
          { text: "FAQ", link: "/reference/faq" },
        ],
      },
    ],

    search: { provider: "local" },

    socialLinks: [{ icon: "github", link: GITHUB }],

    editLink: {
      pattern: `${GITHUB}/edit/main/apps/docs/:path`,
      text: "Edit this page on GitHub",
    },

    footer: {
      message: "Released under the AGPL-3.0-only license.",
      copyright: "Copyright © CaptureFlow contributors",
    },
  },
});
