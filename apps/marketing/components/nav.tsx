"use client";

import { Clapperboard, Film, Image, LayoutGrid, Library } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@captureflow/ui/cn";

const ITEMS = [
  { href: "/", label: "Overview", icon: LayoutGrid },
  { href: "/images", label: "Images", icon: Image },
  { href: "/gifs", label: "GIFs", icon: Film },
  { href: "/video", label: "Video", icon: Clapperboard },
  { href: "/library", label: "Library", icon: Library },
] as const;

export function Nav() {
  const pathname = usePathname();
  return (
    <nav className="sticky top-0 flex h-screen w-56 shrink-0 flex-col gap-1 border-r border-line bg-panel px-3 py-6">
      <p className="mb-4 px-3 text-sm font-semibold text-fg">
        Marketing studio
      </p>
      {ITEMS.map(({ href, label, icon: Icon }) => {
        const isActive =
          href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-fg-muted transition-colors hover:bg-tint hover:text-fg",
              isActive && "bg-tint-strong text-fg",
            )}
          >
            <Icon size={16} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
