"use client";

import { useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { Rubik } from "next/font/google";
import NextLink from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Menu as MenuIcon, Star } from "lucide-react";
import { DISCORD_URL } from "@/lib/marketing/constants";
import { DOCS_URL, RELEASES_URL, SOURCE_REPO_URL } from "@/lib/site";
import { cn } from "@/lib/utils";
import { useLocalizedHref, useMessages } from "./i18n-provider";
import { TopBar } from "./announcement-bars";
import { NavBetaChip } from "./corner-banner";
import { FRAME_WIDTH } from "./frame";
import { GitHubIcon } from "./platform-logos";
import { NavFlyoutPanel, useFlyoutState, type Flyout } from "./nav-flyout";
import { DEFAULT_THEME, ThemeToggle } from "@captureflow/ui";
import { useRepoStats } from "./use-repo-stats";
import { useSignedIn } from "./use-signed-in";

// The wordmark's face: a plain grotesk with rounded corners.
const wordmark = Rubik({ subsets: ["latin"], weight: "500", display: "swap" });

/*
 * Links render as anchors carrying `buttonVariants` rather than a Button nested
 * inside an <a> — an anchor wrapping a button is invalid markup and lands two
 * tab stops on one control.
 */

// Bare muted text in the bar; full-width ghost buttons once stacked in the drawer.
const TEXT_LINK =
  "text-sm font-normal tracking-[-0.01em] whitespace-nowrap text-fg/80 transition-colors hover:text-fg motion-reduce:transition-none";

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

const BAR_SLOT = "flex h-8 items-center px-2.5";
const BAR_LINK_HOVER =
  "decoration-1 underline-offset-[3px] hover:text-fg hover:underline";

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
  const flyoutState = useFlyoutState();
  const triggers = useRef<Record<string, HTMLButtonElement | null>>({});
  const { footer } = m;

  const starLabel = stars
    ? m.nav.starCount.replace("{stars}", String(stars))
    : m.nav.star;
  const themeLabels = {
    toLight: m.nav.themeToLight,
    toDark: m.nav.themeToDark,
  };

  const barLinks: MenuLink[] = [
    { label: m.nav.features, href: lh("/features") },
    { label: m.nav.pricing, href: lh("/pricing") },
    { label: m.nav.docs, href: DOCS_URL, external: true },
  ];
  const products: Flyout = {
    id: "products",
    label: m.nav.products,
    groups: [
      {
        title: m.nav.exploreProducts,
        featured: [
          { label: m.nav.extension, href: lh("/chrome-extension") },
          { label: m.nav.agentRecorder, href: lh("/agent-recorder") },
          { label: m.nav.swarmDemo, href: lh("/swarm-demo") },
          { label: footer.product.download, href: lh("/download") },
        ],
        links: [
          { label: footer.product.features, href: lh("/features") },
          { label: footer.product.suggest, href: lh("/suggest-feature") },
        ],
      },
      {
        title: m.nav.plans,
        links: [
          { label: footer.product.pricing, href: lh("/pricing") },
          { label: m.nav.enterprise, href: lh("/enterprise") },
          {
            label: footer.resources.selfHosting,
            href: `${DOCS_URL}/self-hosting/overview`,
            external: true,
          },
          { label: footer.resources.security, href: lh("/security") },
        ],
      },
    ],
  };
  const resources: Flyout = {
    id: "resources",
    label: m.nav.resources,
    groups: [
      {
        title: m.nav.exploreResources,
        featured: [
          { label: footer.resources.docs, href: DOCS_URL, external: true },
          { label: footer.resources.blog, href: lh("/blog") },
          { label: footer.resources.faq, href: lh("/faq") },
        ],
        links: [
          {
            label: footer.resources.releases,
            href: RELEASES_URL,
            external: true,
          },
        ],
      },
      {
        title: footer.community.title,
        links: [
          { label: "GitHub", href: SOURCE_REPO_URL, external: true },
          { label: "Discord", href: DISCORD_URL, external: true },
        ],
      },
      {
        title: footer.legal.title,
        links: [
          { label: footer.legal.privacy, href: lh("/privacy") },
          { label: footer.legal.terms, href: lh("/terms") },
          { label: footer.legal.refund, href: lh("/refund") },
        ],
      },
    ],
  };
  const flyouts = [products, resources];
  const menuLinks: MenuLink[] = [
    { label: m.nav.extension, href: lh("/chrome-extension") },
    { label: m.nav.agentRecorder, href: lh("/agent-recorder") },
    { label: m.nav.swarmDemo, href: lh("/swarm-demo") },
    ...barLinks,
    { label: m.nav.faq, href: lh("/faq") },
    { label: m.nav.blog, href: lh("/blog") },
    {
      label: m.nav.selfHosting,
      href: `${DOCS_URL}/self-hosting/overview`,
      external: true,
    },
    { label: m.nav.community, href: DISCORD_URL, external: true },
  ];

  const trigger = (flyout: Flyout) => (
    <span key={flyout.id} className={BAR_SLOT}>
      <button
        ref={(el) => {
          triggers.current[flyout.id] = el;
        }}
        type="button"
        aria-expanded={flyoutState.isOpen(flyout.id)}
        aria-controls={`nav-flyout-${flyout.id}`}
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse") flyoutState.intend(flyout.id);
        }}
        onClick={() =>
          flyoutState.isOpen(flyout.id)
            ? flyoutState.close()
            : flyoutState.open(flyout.id)
        }
        className={cn(
          TEXT_LINK,
          "-mx-3 -my-4 inline-flex cursor-pointer items-center px-3 py-4 outline-none",
          BAR_LINK_HOVER,
          flyoutState.isOpen(flyout.id) && "text-fg underline",
        )}
      >
        {flyout.label}
      </button>
    </span>
  );

  return (
    <>
      <TopBar />
      <header
        onPointerLeave={flyoutState.close}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            flyoutState.close();
          }
        }}
        onKeyDown={(event) => {
          const open = flyoutState.active;
          if (event.key !== "Escape" || !open) return;
          flyoutState.close();
          triggers.current[open]?.focus();
        }}
        className={cn(
          "sticky top-0 flex h-14 w-full max-w-full items-start text-start text-xs font-medium text-muted-foreground",
          // The sheet's overlay sits at z-50; drop under it so the open menu dims the bar.
          menuOpen ? "z-40" : "z-[100]",
        )}
      >
        <NavFlyoutPanel flyouts={flyouts} state={flyoutState} />
        <div
          className={cn(
            "flex h-14 w-full items-center border-b bg-panel/80 backdrop-blur-md transition-[border-color] duration-[240ms] [--island:#ffffff] dark:[--island:#181818]",
            flyoutState.active && flyoutState.mode !== "leave"
              ? "border-transparent"
              : "border-line-strong",
          )}
        >
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
              >
                {trigger(products)}
                {barLinks.map((link) => (
                  <span
                    key={link.label}
                    className={cn(
                      BAR_SLOT,
                      "[&_a]:decoration-1 [&_a]:underline-offset-[3px] [&_a:hover]:underline",
                    )}
                    onPointerEnter={(event) => {
                      if (event.pointerType === "mouse") {
                        flyoutState.intend(null);
                      }
                    }}
                  >
                    <NavLink href={link.href} external={link.external}>
                      {link.label}
                    </NavLink>
                  </span>
                ))}
                {trigger(resources)}
              </nav>
            </div>

            {/* Discord lives under Resources and in the footer rather than
            competing with the single CTA here; GitHub earns its place in the
            bar as the source link. */}
            <div className="hidden items-center gap-5 md:flex">
              <a
                href={SOURCE_REPO_URL}
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
            <NavLink
              href={SOURCE_REPO_URL}
              external
              block
              icon={<Star size={16} />}
            >
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
