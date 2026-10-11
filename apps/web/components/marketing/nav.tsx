"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { BrandMark } from "../brand-mark";
import NextLink from "next/link";
import { Button, Drawer, Header, buttonVariants } from "@heroui/react";
import {
  ArrowUpRight,
  ChevronDown,
  CircleHelp,
  Menu as MenuIcon,
  MessagesSquare,
  Server,
  Star,
} from "lucide-react";
import { DISCORD_URL } from "@/lib/marketing/constants";
import { DOCS_URL } from "@/lib/site";
import { cn } from "@/lib/utils";
import { useLocalizedHref, useMessages } from "./i18n-provider";
import { NavBetaChip } from "./corner-banner";
import { GitHubIcon } from "./platform-logos";

const GITHUB_URL = "https://github.com/sardorml/captureflow";

/*
 * HeroUI's free tier has no Navbar (it ships only in the paid Pro package), so
 * the bar is composed from Header + Button + Drawer. Links render as anchors
 * carrying `buttonVariants` rather than a Button nested inside an <a> — an
 * anchor wrapping a button is invalid markup and lands two tab stops on one
 * control.
 */

// Bare muted text in the bar; full-width ghost buttons once stacked in the drawer.
const TEXT_LINK =
  "text-[15px] text-fg-muted transition-colors hover:text-fg motion-reduce:transition-none";

// The one solid control in the bar. `inverse` is the token that sits opposite
// the canvas, so it reads white-on-dark and black-on-light without a branch.
const PILL_CTA = buttonVariants({
  variant: "primary",
  className: "h-10 rounded-full px-6 text-[15px]",
});

type NavLinkProps = {
  href: string;
  external?: boolean;
  block?: boolean;
  icon?: ReactNode;
  onNavigate?: () => void;
  children: ReactNode;
};

function NavLink({
  href,
  external,
  block,
  icon,
  onNavigate,
  children,
}: NavLinkProps) {
  const className = block
    ? buttonVariants({
        variant: "ghost",
        fullWidth: true,
        className: "justify-start",
      })
    : TEXT_LINK;

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {icon}
        {children}
      </a>
    );
  }
  return (
    <NextLink href={href} onClick={onNavigate} className={className}>
      {icon}
      {children}
    </NextLink>
  );
}

type MenuLink = { label: string; href: string; external?: boolean };

type TileLink = MenuLink & { icon: ReactNode; description: string };

/*
 * Only opacity and translate animate, so the slide stays on the compositor;
 * scaling would re-rasterize the text every frame. Opening eases out (quint)
 * so it lands softly; closing uses the standard curve so it leaves smoothly
 * instead of snapping. Visibility flips instantly on open and only after the
 * fade on close, keeping closed links out of the tab order. Written out in
 * full because Tailwind only generates classes it can read verbatim.
 */
const PANEL_OPEN =
  "visible translate-y-0 opacity-100 [transition:opacity_260ms_cubic-bezier(0.22,1,0.36,1),translate_260ms_cubic-bezier(0.22,1,0.36,1),visibility_0s]";
const PANEL_CLOSED =
  "invisible -translate-y-1.5 opacity-0 [transition:opacity_200ms_cubic-bezier(0.4,0,0.2,1),translate_200ms_cubic-bezier(0.4,0,0.2,1),visibility_0s_linear_200ms]";

/*
 * Opens on hover and on keyboard focus, which a React Aria menu can't do: it
 * only opens on press. The panel stays mounted and is hidden with `invisible`,
 * so closed links are out of the tab order but still in the HTML for crawlers.
 */
function HoverMenu({ label, links }: { label: string; links: TileLink[] }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const refocusing = useRef(false);

  const show = () => setOpen(true);

  return (
    <div
      className="relative"
      onMouseEnter={show}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => {
        if (refocusing.current) refocusing.current = false;
        else show();
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key !== "Escape" || !open) return;
        setOpen(false);
        refocusing.current = true;
        triggerRef.current?.focus();
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          TEXT_LINK,
          "inline-flex cursor-pointer items-center gap-1 outline-none",
          open && "text-fg",
        )}
      >
        {label}
        <ChevronDown
          size={15}
          className={cn(
            "transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
            open && "rotate-180",
          )}
        />
      </button>
      {/* While open, the top padding bridges the pointer from the trigger to
          the panel. While closed, none of this box takes the pointer, so only
          the trigger itself can open the menu. */}
      <div
        className={cn(
          "absolute top-full left-1/2 -translate-x-1/2 pt-7",
          !open && "pointer-events-none",
        )}
      >
        <ul
          className={cn(
            "bg-canvas-2/80 flex w-[22rem] flex-col gap-1 rounded-2xl p-2 shadow-[0_12px_32px_rgb(0_0_0/0.3)] backdrop-blur-xl will-change-[opacity,translate] motion-reduce:[transition:none]",
            open ? PANEL_OPEN : PANEL_CLOSED,
          )}
        >
          {links.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                onClick={() => setOpen(false)}
                className="group/tile hover:bg-tint focus-visible:bg-tint flex items-start gap-3 rounded-xl p-3 outline-none transition-colors duration-150 motion-reduce:transition-none"
              >
                <span className="bg-tint-strong text-fg group-hover/tile:bg-accent-bg grid size-10 shrink-0 place-items-center rounded-xl transition-colors duration-150 group-hover/tile:text-white motion-reduce:transition-none">
                  {link.icon}
                </span>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-fg flex items-center gap-1 text-[15px] font-medium">
                    {link.label}
                    {link.external && (
                      <ArrowUpRight size={14} className="text-fg-subtle" />
                    )}
                  </span>
                  <span className="text-fg-muted text-[13px] leading-snug">
                    {link.description}
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function Nav({ stars = null }: { stars?: string | null }) {
  const m = useMessages();
  const lh = useLocalizedHref();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  /*
   * Past the fold the bar detaches into a floating pill. Starts false so the
   * server render matches a freshly-loaded (unscrolled) page, then syncs on
   * mount to survive a restored scroll position.
   */
  const [detached, setDetached] = useState(false);
  useEffect(() => {
    const onScroll = () => setDetached(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const starLabel = stars ? `Star on GitHub (${stars})` : "Star on GitHub";

  /*
   * In the bar the main links sit inline and the rest go under Resources; the
   * drawer stacks them all as block links.
   */
  const barLinks: MenuLink[] = [
    { label: "Features", href: lh("/features") },
    { label: "Pricing", href: lh("/pricing") },
    { label: "Docs", href: DOCS_URL, external: true },
  ];
  const moreLinks: TileLink[] = [
    {
      label: "FAQ",
      href: lh("/faq"),
      icon: <CircleHelp size={18} />,
      description: "Common questions, answered",
    },
    {
      label: "Self-hosting",
      href: `${DOCS_URL}/self-hosting/overview`,
      external: true,
      icon: <Server size={18} />,
      description: "Run it on your own Cloudflare",
    },
    {
      label: "Community",
      href: DISCORD_URL,
      external: true,
      icon: <MessagesSquare size={18} />,
      description: "Get help and chat on Discord",
    },
  ];
  const menuLinks = [...barLinks, ...moreLinks];

  return (
    <Header
      className={[
        "sticky top-0 z-[100] flex w-full max-w-full items-center transition-[height,padding] duration-300 ease-out motion-reduce:transition-none",
        detached ? "h-20 pt-4" : "h-16",
      ].join(" ")}
    >
      {/* Sits on the page's 1024px rail at rest, then contracts to 768px as it
          detaches so the floating pill reads as its own object. */}
      <div
        className={[
          "relative isolate mx-auto flex w-full items-center justify-between px-4 py-2 transition-[max-width,border-color,border-radius] duration-300 ease-out motion-reduce:transition-none",
          detached
            ? "max-w-4xl rounded-full border border-line"
            : "max-w-6xl border border-transparent",
        ].join(" ")}
      >
        {/* The glass is its own layer rather than this element's background: an
            element with a backdrop blur can only blur what is inside it, so
            the Resources panel, which hangs below the bar, would lose its own
            blur. */}
        <span
          aria-hidden
          className={cn(
            "bg-canvas-2/80 pointer-events-none absolute inset-0 -z-10 rounded-full shadow-lg backdrop-blur-xl transition-opacity duration-300 ease-out motion-reduce:transition-none",
            detached ? "opacity-100" : "opacity-0",
          )}
        />
        {/* Logo: 32×32 mark + 18px bold wordmark. */}
        <div className="flex items-center gap-2.5">
          <NextLink
            href={lh("/")}
            aria-label="CaptureFlow"
            className="group inline-flex items-center gap-2 text-fg"
          >
            <BrandMark size={32} />
            <span className="text-lg font-bold tracking-[-0.01em] text-fg">
              CaptureFlow
            </span>
          </NextLink>
          <NavBetaChip />
        </div>

        {/* One right-hand cluster. Discord lives under Resources and in the footer
            rather than competing with the single CTA here; GitHub earns its
            place in the bar as the source link. Desktop/mobile split is
            CSS-gated (not JS breakpoints) so the server render matches the
            viewport — no mobile→desktop flip after hydration. */}
        <div className="hidden items-center gap-5 md:flex">
          <nav aria-label="Main" className="flex items-center gap-5">
            {barLinks.map((link) => (
              <NavLink
                key={link.label}
                href={link.href}
                external={link.external}
              >
                {link.label}
              </NavLink>
            ))}
            <HoverMenu label="Resources" links={moreLinks} />
          </nav>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            aria-label={starLabel}
            title={starLabel}
            className={`${TEXT_LINK} inline-flex items-center gap-1.5`}
          >
            <GitHubIcon />
            {/* tabular-nums so the bar doesn't shift width as the count grows
                into another digit between revalidations. */}
            {stars && (
              <span className="text-[13px] font-medium tabular-nums">
                {stars}
              </span>
            )}
          </a>
          <NextLink href={lh("/login")} className={TEXT_LINK}>
            {m.nav.login}
          </NextLink>
          <NextLink href={lh("/download")} className={PILL_CTA}>
            {m.nav.download}
          </NextLink>
        </div>

        <div className="flex items-center md:hidden">
          <Button
            variant="ghost"
            size="sm"
            isIconOnly
            aria-label="Open menu"
            onPress={() => setMenuOpen(true)}
          >
            <MenuIcon size={20} />
          </Button>
        </div>
      </div>

      <Drawer isOpen={menuOpen} onOpenChange={setMenuOpen}>
        {/* HeroUI's overlays sit at z-50 and this bar sits above them at 100,
            so the logo and the trigger painted straight over the open panel.
            Raising the backdrop lifts the panel with it — it is the stacking
            context the panel is painted in. */}
        <Drawer.Backdrop style={{ zIndex: 120 }}>
          {/* The width belongs on the dialog, not on Content: Content is the
              inset-0 flex wrapper that positions the panel, so sizing it there
              pinned a 280px box to the left edge and the panel slid in against
              it — right-to-left, on the wrong side of the viewport. */}
          <Drawer.Content placement="right">
            <Drawer.Dialog className="w-70">
              <Drawer.Body className="flex flex-col items-stretch gap-2 p-4">
                <nav
                  aria-label="Main"
                  className="flex flex-col items-stretch gap-2"
                >
                  {menuLinks.map((link) => (
                    <NavLink
                      key={link.label}
                      href={link.href}
                      external={link.external}
                      block
                      onNavigate={closeMenu}
                    >
                      {link.label}
                    </NavLink>
                  ))}
                </nav>
                <NavLink
                  href={GITHUB_URL}
                  external
                  block
                  icon={<Star size={16} />}
                >
                  {starLabel}
                </NavLink>
                <NextLink
                  href={lh("/login")}
                  onClick={closeMenu}
                  className={buttonVariants({
                    variant: "tertiary",
                    fullWidth: true,
                  })}
                >
                  {m.nav.login}
                </NextLink>
                <NextLink
                  href={lh("/download")}
                  onClick={closeMenu}
                  className={buttonVariants({
                    variant: "primary",
                    fullWidth: true,
                  })}
                >
                  {m.nav.download}
                </NextLink>
              </Drawer.Body>
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>
    </Header>
  );
}
