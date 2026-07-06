"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button, Drawer, Flex, theme as antdTheme } from "antd";
import { Menu as MenuIcon, Star } from "lucide-react";
import { DiscordOutlined } from "@ant-design/icons";
import { ThemeToggle, DEFAULT_THEME, type Theme } from "@captureflow/ui";
import { DISCORD_URL, NAV_LINKS } from "@/lib/marketing/constants";
import { DOCS_URL } from "@/lib/site";
import { useLocalizedHref, useMessages } from "./i18n-provider";

const GITHUB_URL = "https://github.com/sardorml/captureflow";
const HEADER_HEIGHT = 64;

export function Nav({
  stars = null,
  theme = DEFAULT_THEME,
}: {
  stars?: string | null;
  theme?: Theme;
}) {
  const m = useMessages();
  const lh = useLocalizedHref();
  const { token } = antdTheme.useToken();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLabel = (link: { href: string; label: string }): string => {
    switch (link.href) {
      case "#modes":
        return m.nav.features;
      case "#pricing":
        return m.nav.pricing;
      case "#faq":
        return m.nav.faq;
      case "#roadmap":
        return m.nav.roadmap;
      case "/changelog":
        return m.nav.changelog;
      default:
        return link.label;
    }
  };

  // Logo: 32×32 mark + 18px bold wordmark, 8px gap — matching the antd header.
  const brand = (
    <Link
      href={lh("/")}
      style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
    >
      <Image
        src="/logo.png"
        alt="CaptureFlow"
        width={32}
        height={32}
        style={{ borderRadius: 7 }}
        draggable={false}
        priority
        unoptimized
      />
      <span
        style={{
          fontSize: 18,
          fontWeight: "bold",
          letterSpacing: "-0.01em",
          color: token.colorText,
        }}
      >
        CaptureFlow
      </span>
    </Link>
  );

  const links = (
    <>
      {NAV_LINKS.map((link) => (
        <Link
          key={link.href}
          href={lh(link.href)}
          onClick={() => setMenuOpen(false)}
        >
          <Button type="text">{navLabel(link)}</Button>
        </Link>
      ))}
      <a href={DOCS_URL} target="_blank" rel="noopener noreferrer">
        <Button type="text">Docs</Button>
      </a>
    </>
  );

  const actions = (
    <>
      <a
        href={DISCORD_URL}
        target="_blank"
        rel="noopener noreferrer"
        style={{ display: "inline-flex" }}
      >
        <Button
          type="text"
          aria-label="Discord"
          icon={<DiscordOutlined style={{ fontSize: 18 }} />}
        />
      </a>
      <a
        href={GITHUB_URL}
        target="_blank"
        rel="noopener noreferrer"
        style={{ display: "inline-flex" }}
      >
        <Button type="text" icon={<Star size={16} />}>
          {stars ? `Star on GitHub (${stars})` : "Star on GitHub"}
        </Button>
      </a>
      <Link href={lh("/login")} style={{ display: "inline-flex" }}>
        <Button>{m.nav.login}</Button>
      </Link>
      <Link href={lh("/download")} style={{ display: "inline-flex" }}>
        <Button type="primary">{m.nav.download}</Button>
      </Link>
      <ThemeToggle initialTheme={theme} className="h-8 w-8" />
    </>
  );

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        width: "100%",
        maxWidth: "100%",
        height: HEADER_HEIGHT,
        display: "flex",
        alignItems: "center",
        background: token.colorBgContainer,
        backdropFilter: "blur(8px)",
      }}
    >
      <Flex
        align="center"
        justify="space-between"
        style={{ width: "100%", paddingInline: "clamp(16px, 4vw, 40px)" }}
      >
        {/* antd logo column has padding-inline-start: 40px on desktop. */}
        <Flex align="center" gap={24}>
          {brand}
          {/* Desktop/mobile split is CSS-gated (not JS breakpoints) so the
              server render matches the viewport — no mobile→desktop flip after
              hydration. antd menu column-gap is 2px. */}
          <div className="hidden items-center gap-0.5 md:flex">{links}</div>
        </Flex>

        <div className="hidden items-center gap-1 md:flex">{actions}</div>
        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle initialTheme={theme} className="h-8 w-8" />
          <Button
            type="text"
            aria-label="Open menu"
            icon={<MenuIcon size={20} />}
            onClick={() => setMenuOpen(true)}
          />
        </div>
      </Flex>

      <Drawer
        placement="right"
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        size={280}
        styles={{ body: { padding: 16 } }}
      >
        <Flex vertical gap={8} align="stretch">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={lh(link.href)}
              onClick={() => setMenuOpen(false)}
            >
              <Button
                type="text"
                block
                style={{ justifyContent: "flex-start" }}
              >
                {navLabel(link)}
              </Button>
            </Link>
          ))}
          <a href={DOCS_URL} target="_blank" rel="noopener noreferrer">
            <Button type="text" block style={{ justifyContent: "flex-start" }}>
              Docs
            </Button>
          </a>
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
            <Button
              type="text"
              block
              icon={<Star size={16} />}
              style={{ justifyContent: "flex-start" }}
            >
              {stars ? `Star on GitHub (${stars})` : "Star on GitHub"}
            </Button>
          </a>
          <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer">
            <Button
              type="text"
              block
              icon={<DiscordOutlined style={{ fontSize: 16 }} />}
              style={{ justifyContent: "flex-start" }}
            >
              Discord
            </Button>
          </a>
          <Link href={lh("/login")} onClick={() => setMenuOpen(false)}>
            <Button block>{m.nav.login}</Button>
          </Link>
          <Link href={lh("/download")} onClick={() => setMenuOpen(false)}>
            <Button type="primary" block>
              {m.nav.download}
            </Button>
          </Link>
        </Flex>
      </Drawer>
    </header>
  );
}
