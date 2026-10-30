"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type TocItem = { id: string; title: string };

const ACTIVE_OFFSET = 140;

export function TableOfContents({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState(items[0]?.id);

  useEffect(() => {
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);
    const update = () => {
      const passed = headings.filter(
        (el) => el.getBoundingClientRect().top <= ACTIVE_OFFSET,
      );
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 4;
      const current = atBottom ? headings.at(-1) : passed.at(-1);
      setActiveId(current?.id ?? items[0]?.id);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [items]);

  return (
    <ol className="mt-4 flex flex-col border-l border-fg/10 text-sm leading-snug">
      {items.map((item) => {
        const active = item.id === activeId;
        return (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              aria-current={active ? "location" : undefined}
              className={cn(
                "-ml-px block border-l-2 py-1.5 pl-4 transition-colors",
                active
                  ? "border-primary font-medium text-fg"
                  : "border-transparent text-fg-muted hover:text-fg",
              )}
            >
              {item.title}
            </a>
          </li>
        );
      })}
    </ol>
  );
}
