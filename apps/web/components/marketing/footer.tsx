"use client";

import { motion } from "motion/react";
import { Col, Row, Space, Typography, theme as antdTheme } from "antd";
import { DOWNLOAD_URL, X_URL } from "@/lib/marketing/constants";
import { DOCS_URL, RELEASES_URL } from "@/lib/site";
import { useLocalizedHref } from "./i18n-provider";

type FooterLink = { label: string; href: string };
type FooterColumn = { title: string; links: FooterLink[] };

// Per-letter vertical offsets (em, negative = up) tracing a static arch.
const WORDMARK_LETTERS = [
  { ch: "C", offset: 0.16 },
  { ch: "a", offset: 0.1 },
  { ch: "p", offset: 0.03 },
  { ch: "t", offset: -0.04 },
  { ch: "u", offset: -0.09 },
  { ch: "r", offset: -0.12 },
  { ch: "e", offset: -0.12 },
  { ch: "F", offset: -0.09 },
  { ch: "l", offset: -0.04 },
  { ch: "o", offset: 0.03 },
  { ch: "w", offset: 0.16 },
];

// Soft neutral-gray glow rising from the bottom (was brand-blue), subtle in both
// themes — slate reads as gray on white and lightens the dark footer.
const FOOTER_GLOW =
  "linear-gradient(to top, rgba(148,163,184,0.1) 0%, rgba(148,163,184,0.06) 18%, transparent 46%)," +
  "radial-gradient(95% 145% at 50% 122%, rgba(148,163,184,0.08) 0%, transparent 74%)";

export function Footer() {
  const lh = useLocalizedHref();
  const { token } = antdTheme.useToken();

  const columns: FooterColumn[] = [
    {
      title: "Product",
      links: [
        { label: "Download", href: lh("/download") },
        { label: "Sign in", href: lh("/login") },
        { label: "Releases", href: RELEASES_URL },
      ],
    },
    {
      title: "Docs",
      links: [
        { label: "Recording", href: `${DOCS_URL}/recording` },
        { label: "Sharing", href: `${DOCS_URL}/sharing` },
        { label: "FAQ", href: lh("/#faq") },
      ],
    },
    {
      title: "Self-hosting",
      links: [
        { label: "Overview", href: `${DOCS_URL}/self-hosting` },
        { label: "Cloudflare", href: `${DOCS_URL}/self-hosting/cloudflare` },
        { label: "Architecture", href: `${DOCS_URL}/architecture` },
        { label: "Contributing", href: `${DOCS_URL}/contributing` },
      ],
    },
    {
      title: "Community",
      links: [
        { label: "GitHub", href: X_URL },
        { label: "Issues", href: `${X_URL}/issues` },
        { label: "Latest release", href: DOWNLOAD_URL },
      ],
    },
  ];

  return (
    <footer
      style={{
        position: "relative",
        overflow: "hidden",
        marginTop: "auto",
        borderTop: `1px solid ${token.colorBorderSecondary}`,
        background: token.colorBgContainer,
        /* Extra bottom space so the fixed floating CTA (≈128px tall reach from
           the page bottom) never overlaps the footer links/copyright. */
        paddingBlock: "56px 160px",
      }}
    >
      {/* Deliberately NOT viewport.once: `once` latches at the hidden initial
          state on scroll-away/remount; re-evaluating on every entry keeps it reliable. */}
      <motion.div
        aria-hidden
        initial={{ y: 90, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ amount: 0.4 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none absolute inset-0 z-0 hidden sm:block"
      >
        <div className="absolute inset-0" style={{ background: FOOTER_GLOW }} />
        {/* dir="ltr" pins this decorative wordmark so per-letter spans never reverse under RTL. */}
        <div
          dir="ltr"
          className="absolute inset-x-0 bottom-0 flex justify-center overflow-hidden"
        >
          <span
            className="translate-y-[14%] select-none whitespace-nowrap text-[17vw] font-bold leading-none tracking-tight"
            style={{ color: token.colorFillQuaternary }}
          >
            {WORDMARK_LETTERS.map((letter, i) => (
              <span
                key={i}
                className="inline-block"
                style={{ transform: `translateY(${letter.offset}em)` }}
              >
                {letter.ch}
              </span>
            ))}
          </span>
        </div>
      </motion.div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          paddingInline: "clamp(20px, 4vw, 56px)",
        }}
      >
        <Row gutter={[32, 32]}>
          {columns.map((col) => (
            <Col key={col.title} xs={12} sm={12} md={6}>
              <Typography.Text
                type="secondary"
                style={{
                  display: "block",
                  marginBottom: 12,
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {col.title}
              </Typography.Text>
              <Space orientation="vertical" size={8}>
                {col.links.map((link) => (
                  <Typography.Link
                    key={link.label}
                    href={link.href}
                    type="secondary"
                  >
                    {link.label}
                  </Typography.Link>
                ))}
              </Space>
            </Col>
          ))}
        </Row>

        <Typography.Text
          type="secondary"
          suppressHydrationWarning
          style={{ display: "block", marginTop: 48, fontSize: 13 }}
        >
          © {new Date().getFullYear()} CaptureFlow
        </Typography.Text>
      </div>
    </footer>
  );
}
