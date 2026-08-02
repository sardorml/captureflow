"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import NextLink from "next/link";
import { Button, Drawer, Header, buttonVariants } from "@heroui/react";
import { Menu as MenuIcon, Star } from "lucide-react";
import { DISCORD_URL } from "@/lib/marketing/constants";
import { DOCS_URL } from "@/lib/site";
import { useLocalizedHref, useMessages } from "./i18n-provider";

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

  const sectionLinks = (block?: boolean) => (
    <NavLink href={DOCS_URL} external block={block}>
      Documentation
    </NavLink>
  );

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
          "mx-auto flex w-full items-center justify-between px-4 py-2 transition-[max-width,background-color,border-color,border-radius,box-shadow] duration-300 ease-out motion-reduce:transition-none",
          detached
            ? "max-w-3xl rounded-full border border-line bg-canvas-2/80 shadow-lg backdrop-blur-xl"
            : "max-w-5xl border border-transparent",
        ].join(" ")}
      >
        {/* Logo: 32×32 mark + 18px bold wordmark. */}
        <NextLink href={lh("/")} className="inline-flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="CaptureFlow"
            width={32}
            height={32}
            className="rounded-[7px]"
            draggable={false}
            priority
            unoptimized
          />
          <span className="text-lg font-bold tracking-[-0.01em] text-fg">
            CaptureFlow
          </span>
        </NextLink>

        {/* One right-hand cluster. Discord lives in the drawer and the footer
            rather than competing with the single CTA here; GitHub earns its
            place in the bar as the source link. Desktop/mobile split is
            CSS-gated (not JS breakpoints) so the server render matches the
            viewport — no mobile→desktop flip after hydration. */}
        <div className="hidden items-center gap-5 md:flex">
          <nav aria-label="Main" className="flex items-center gap-5">
            {sectionLinks()}
          </nav>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            aria-label={starLabel}
            title={starLabel}
            className={`${TEXT_LINK} inline-flex items-center`}
          >
            <GitHubIcon />
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
        <Drawer.Backdrop>
          <Drawer.Content placement="right" className="w-70">
            <Drawer.Dialog>
              <Drawer.Body className="flex flex-col items-stretch gap-2 p-4">
                <nav
                  aria-label="Main"
                  className="flex flex-col items-stretch gap-2"
                >
                  {sectionLinks(true)}
                </nav>
                <NavLink
                  href={GITHUB_URL}
                  external
                  block
                  icon={<Star size={16} />}
                >
                  {starLabel}
                </NavLink>
                <NavLink
                  href={DISCORD_URL}
                  external
                  block
                  icon={<DiscordIcon size={16} />}
                >
                  Discord
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

function GitHubIcon({ size = 19 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 .5C5.73.5.5 5.73.5 12a11.5 11.5 0 0 0 7.86 10.93c.58.1.79-.25.79-.56v-2.16c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.12 3.05.74.81 1.18 1.84 1.18 3.1 0 4.43-2.69 5.4-5.25 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5" />
    </svg>
  );
}

function DiscordIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M20.317 4.369A19.79 19.79 0 0 0 15.432 3a13.9 13.9 0 0 0-.617 1.269 18.27 18.27 0 0 0-5.63 0A13 13 0 0 0 8.56 3a19.74 19.74 0 0 0-4.886 1.372C.716 8.78-.09 13.08.16 17.32a19.9 19.9 0 0 0 6.06 3.06c.49-.67.926-1.382 1.3-2.13a12.9 12.9 0 0 1-2.05-.98c.173-.126.342-.257.505-.392a14.2 14.2 0 0 0 12.05 0c.165.14.334.27.505.392-.653.386-1.34.714-2.053.98.375.748.81 1.46 1.3 2.13a19.9 19.9 0 0 0 6.063-3.06c.293-4.914-.99-9.176-3.523-12.951M8.02 14.79c-1.183 0-2.157-1.085-2.157-2.42s.955-2.42 2.157-2.42 2.176 1.096 2.156 2.42c0 1.335-.955 2.42-2.156 2.42m7.96 0c-1.183 0-2.157-1.085-2.157-2.42s.955-2.42 2.157-2.42 2.176 1.096 2.156 2.42c0 1.335-.954 2.42-2.156 2.42" />
    </svg>
  );
}
