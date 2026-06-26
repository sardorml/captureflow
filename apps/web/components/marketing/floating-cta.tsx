"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button, Flex, theme, Typography } from "antd";
import { track } from "@/lib/marketing/track";
import { useLocalizedHref, useMessages } from "./i18n-provider";

const { Text } = Typography;

export function FloatingCta() {
  const [visible, setVisible] = useState(false);
  const lh = useLocalizedHref();
  const m = useMessages();
  const { token } = theme.useToken();

  useEffect(() => {
    const sentinel = document.getElementById("hero-end");
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) =>
        setVisible(entry.isIntersecting || entry.boundingClientRect.top < 0),
      { threshold: 0, rootMargin: "0px 0px -15% 0px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      aria-hidden={!visible}
      inert={!visible}
      className="max-sm:hidden"
      style={{
        position: "fixed",
        bottom: 72,
        left: "50%",
        zIndex: 50,
        transition: "transform 300ms ease-out, opacity 300ms ease-out",
        transform: visible
          ? "translateX(-50%) translateY(0)"
          : "translateX(-50%) translateY(180%)",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <Flex
        align="center"
        gap={token.marginMD}
        style={{
          backgroundColor: token.colorBgContainer,
          boxShadow: token.boxShadowSecondary,
          // Concentric with the logo: its 11px radius + the 4px inset padding.
          borderRadius: 15,
          border: `1px solid ${token.colorBorderSecondary}`,
          paddingTop: token.paddingXXS,
          paddingBottom: token.paddingXXS,
          paddingLeft: token.paddingXXS,
          paddingRight: token.paddingXS,
        }}
      >
        <Image
          src="/logo.png"
          alt=""
          width={56}
          height={56}
          style={{ width: 48, height: 48, borderRadius: 11 }}
          draggable={false}
          unoptimized
        />
        <Text
          strong
          className="max-sm:hidden"
          style={{ fontSize: token.fontSizeLG, color: token.colorText }}
        >
          {m.floatingCta.tagline}
        </Text>
        <Button
          type="primary"
          size="large"
          style={{ borderRadius: 11 }}
          href={lh("/download")}
          tabIndex={visible ? 0 : -1}
          onClick={() =>
            track("marketing_cta_clicked", { location: "floating" })
          }
        >
          {m.floatingCta.button}
        </Button>
      </Flex>
    </div>
  );
}
