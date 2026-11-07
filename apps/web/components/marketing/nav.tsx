"use client";

import { useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { Rubik } from "next/font/google";
import { AnimatePresence, motion } from "motion/react";
import NextLink from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import {
  ArrowUpRight,
  ChevronDown,
  Menu as MenuIcon,
  Star,
} from "lucide-react";
import { DISCORD_URL } from "@/lib/marketing/constants";
import { DOCS_URL } from "@/lib/site";
import { cn } from "@/lib/utils";
import { useLocalizedHref, useMessages } from "./i18n-provider";
import { TopBar } from "./announcement-bars";
import { NavBetaChip } from "./corner-banner";
import { FRAME_WIDTH } from "./frame";
import {
  ChromeLogoColor,
  GitHubIcon,
  McpLogo,
  SwarmCursorsLogo,
} from "./platform-logos";
import { DEFAULT_THEME, ThemeToggle } from "@captureflow/ui";
import { useRepoStats } from "./use-repo-stats";
import { useSignedIn } from "./use-signed-in";

const GITHUB_URL = "https://github.com/sardorml/captureflow";

// The wordmark's face: a plain grotesk with rounded corners.
const wordmark = Rubik({ subsets: ["latin"], weight: "500", display: "swap" });

/*
 * Links render as anchors carrying `buttonVariants` rather than a Button nested
 * inside an <a> — an anchor wrapping a button is invalid markup and lands two
 * tab stops on one control.
 */

// Bare muted text in the bar; full-width ghost buttons once stacked in the drawer.
const TEXT_LINK =
  "text-sm font-normal whitespace-nowrap text-fg transition-colors hover:text-fg/70 motion-reduce:transition-none";

// The one solid control in the bar.
const PILL_CTA =
  "inline-flex h-[30px] items-center rounded-full bg-fg px-3.5 text-[13px] font-medium whitespace-nowrap text-canvas transition-colors hover:bg-fg/85 motion-reduce:transition-none";

type NavLinkProps = {
  href: string;
  external?: boolean;
  block?: boolean;
  icon?: ReactNode;
  onNavigate?: () => void;
  children: ReactNode;
};

// One grey pill slides between the bar's links on hover rather than each link
// lighting up on its own.
function HoverSlot({
  id,
  hovered,
  onHover,
  children,
}: {
  id: string;
  hovered: string | null;
  onHover: (id: string) => void;
  children: ReactNode;
}) {
  return (
    <span
      className="relative isolate flex h-8 items-center px-2.5 [&_:is(a,button):hover]:text-fg"
      onMouseEnter={() => onHover(id)}
    >
      <AnimatePresence>
        {hovered === id && (
          <motion.span
            aria-hidden
            layoutId="nav-hover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", visualDuration: 0.25, bounce: 0.15 }}
            className="pointer-events-none absolute inset-0 -z-10 rounded-[10px] bg-black/[0.055] dark:bg-white/[0.08]"
          />
        )}
      </AnimatePresence>
      {children}
    </span>
  );
}

function NavLink({
  href,
  external,
  block,
  icon,
  onNavigate,
  children,
}: NavLinkProps) {
  const className = block
    ? cn(buttonVariants({ variant: "ghost" }), "w-full justify-start")
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

type TileLink = MenuLink & { description: string; icon?: ReactNode };

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
          "-mx-3 -my-4 inline-flex cursor-pointer items-center gap-1 px-3 py-4 outline-none",
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
          "absolute top-full left-1/2 -translate-x-1/2 pt-3.5",
          !open && "pointer-events-none",
        )}
      >
        <ul
          className={cn(
            "bg-(--island) shadow-lg border-line flex w-[22rem] flex-col rounded-xl border p-2 will-change-[opacity,translate] motion-reduce:[transition:none]",
            open ? PANEL_OPEN : PANEL_CLOSED,
          )}
        >
          {links.map((link) => (
            <li key={link.label}>
              <NextLink
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                onClick={() => setOpen(false)}
                className="hover:bg-tint focus-visible:bg-tint flex items-start gap-3 rounded-lg px-3.5 py-3 outline-none transition-colors duration-150 motion-reduce:transition-none"
              >
                {link.icon && (
                  <span className="flex size-6 shrink-0 items-center justify-center pt-0.5">
                    {link.icon}
                  </span>
                )}
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-fg flex items-center gap-1 text-[15px] font-normal">
                    {link.label}
                    {link.external && (
                      <ArrowUpRight size={14} className="text-fg-subtle" />
                    )}
                  </span>
                  <span className="text-fg-muted text-[13px] leading-snug font-normal">
                    {link.description}
                  </span>
                </span>
              </NextLink>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function Nav() {
  const { stars } = useRepoStats();
  const m = useMessages();
  const lh = useLocalizedHref();
  const signedIn = useSignedIn();
  const account = signedIn
    ? { href: "/recordings", label: m.nav.library }
    : { href: lh("/login"), label: m.nav.login };
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  const [hovered, setHovered] = useState<string | null>(null);

  const starLabel = stars
    ? m.nav.starCount.replace("{stars}", String(stars))
    : m.nav.star;
  const themeLabels = {
    toLight: m.nav.themeToLight,
    toDark: m.nav.themeToDark,
  };

  /*
   * In the bar the main links sit inline between the Products and Resources
   * menus; the drawer stacks them all as block links.
   */
  const barLinks: MenuLink[] = [
    { label: m.nav.features, href: lh("/features") },
    { label: m.nav.pricing, href: lh("/pricing") },
    { label: m.nav.docs, href: DOCS_URL, external: true },
  ];
  const productLinks: TileLink[] = [
    {
      label: m.nav.extension,
      href: lh("/chrome-extension"),
      description: m.nav.extensionDescription,
      icon: <ChromeLogoColor className="size-5" />,
    },
    {
      label: m.nav.agentRecorder,
      href: lh("/agent-recorder"),
      description: m.nav.agentRecorderDescription,
      icon: <McpLogo className="size-5 text-fg" />,
    },
    {
      label: m.nav.swarmDemo,
      href: lh("/swarm-demo"),
      description: m.nav.swarmDemoDescription,
      icon: <SwarmCursorsLogo className="size-6" />,
    },
  ];
  const moreLinks: TileLink[] = [
    {
      label: m.nav.faq,
      href: lh("/faq"),
      description: m.nav.faqDescription,
    },
    {
      label: m.nav.blog,
      href: lh("/blog"),
      description: m.nav.blogDescription,
    },
    {
      label: m.nav.selfHosting,
      href: `${DOCS_URL}/self-hosting/overview`,
      external: true,
      description: m.nav.selfHostingDescription,
    },
    {
      label: m.nav.community,
      href: DISCORD_URL,
      external: true,
      description: m.nav.communityDescription,
    },
  ];
  const menuLinks = [...productLinks, ...barLinks, ...moreLinks];

  return (
    <>
      <TopBar />
      <header
        className={cn(
          "sticky top-0 flex h-14 w-full max-w-full items-start text-start text-xs font-medium text-muted-foreground",
          // The sheet's overlay sits at z-50; drop under it so the open menu dims the bar.
          menuOpen ? "z-40" : "z-[100]",
        )}
      >
        <div className="flex h-14 w-full items-center border-b border-line-strong bg-panel/80 backdrop-blur-md [--island:#ffffff] dark:[--island:#181818]">
          <div
            className={cn(
              "mx-auto flex w-[calc(100%-48px)] items-center justify-between",
              FRAME_WIDTH,
            )}
          >
            <div className="flex items-center gap-2.5">
              <NextLink
                href={lh("/")}
                aria-label="CaptureFlow"
                className="group inline-flex items-center gap-2 text-fg"
              >
                <Image
                  src="/logo-96.png"
                  alt=""
                  width={28}
                  height={28}
                  unoptimized
                  priority
                  draggable={false}
                />
                <span
                  className={cn(
                    wordmark.className,
                    "text-[17px] leading-none tracking-[-0.02em] text-fg",
                  )}
                >
                  CaptureFlow
                </span>
              </NextLink>
              <NavBetaChip />
              {/* The links follow the logo so the bar fills across, with the
              actions on the right. Desktop/mobile split is CSS-gated (not JS
              breakpoints) so the server render matches the viewport — no
              mobile→desktop flip after hydration. */}
              <nav
                aria-label={m.nav.main}
                className="ml-3.5 hidden items-center md:flex"
                onMouseLeave={() => setHovered(null)}
              >
                <HoverSlot id="Products" hovered={hovered} onHover={setHovered}>
                  <HoverMenu label={m.nav.products} links={productLinks} />
                </HoverSlot>
                {barLinks.map((link) => (
                  <HoverSlot
                    key={link.label}
                    id={link.label}
                    hovered={hovered}
                    onHover={setHovered}
                  >
                    <NavLink href={link.href} external={link.external}>
                      {link.label}
                    </NavLink>
                  </HoverSlot>
                ))}
                <HoverSlot
                  id="Resources"
                  hovered={hovered}
                  onHover={setHovered}
                >
                  <HoverMenu label={m.nav.resources} links={moreLinks} />
                </HoverSlot>
              </nav>
            </div>

            {/* Discord lives under Resources and in the footer rather than
            competing with the single CTA here; GitHub earns its place in the
            bar as the source link. */}
            <div className="hidden items-center gap-5 md:flex">
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
                <span>
                  GitHub
                  {stars && <span className="tabular-nums"> ({stars})</span>}
                </span>
              </a>
              <NextLink href={account.href} prefetch className={TEXT_LINK}>
                {account.label}
              </NextLink>
              <ThemeToggle
                initialTheme={DEFAULT_THEME}
                className="h-9 w-9 rounded text-fg"
                labels={themeLabels}
              />
              <NextLink href={lh("/download")} className={PILL_CTA}>
                {m.nav.download}
              </NextLink>
            </div>

            <div className="flex items-center gap-1 md:hidden">
              <ThemeToggle
                initialTheme={DEFAULT_THEME}
                className="h-9 w-9 rounded text-fg"
                labels={themeLabels}
              />
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={m.nav.openMenu}
                onClick={() => setMenuOpen(true)}
              >
                <MenuIcon size={20} />
              </Button>
            </div>
          </div>
        </div>

        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetContent
            side="right"
            showCloseButton={false}
            aria-describedby={undefined}
            className="w-70 gap-2 p-4"
          >
            <SheetTitle className="sr-only">{m.nav.menu}</SheetTitle>
            <nav
              aria-label={m.nav.main}
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
            <NavLink href={GITHUB_URL} external block icon={<Star size={16} />}>
              {starLabel}
            </NavLink>
            <NextLink
              href={account.href}
              prefetch
              onClick={closeMenu}
              className={cn(buttonVariants({ variant: "ghost" }), "w-full")}
            >
              {account.label}
            </NextLink>
            <NextLink
              href={lh("/download")}
              onClick={closeMenu}
              className={cn(buttonVariants(), "w-full")}
            >
              {m.nav.download}
            </NextLink>
          </SheetContent>
        </Sheet>
      </header>
    </>
  );
}
