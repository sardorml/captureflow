"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Search } from "lucide-react";
import { Kbd } from "@heroui/react";
import { withSplitLoaded } from "@/components/dev/split-loaded";

const SearchDialog = dynamic(
  () =>
    import("./SearchDialog").then((m) =>
      withSplitLoaded("search-dialog", m.SearchDialog),
    ),
  { ssr: false },
);

export function SearchTrigger() {
  const [open, setOpen] = useState(false);
  // Stays mounted after the first open so closing can animate out.
  const [opened, setOpened] = useState(false);
  const show = () => {
    setOpened(true);
    setOpen(true);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        show();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={show}
        className="flex h-9 w-full max-w-xl cursor-pointer items-center gap-2 rounded-xl bg-field px-4 text-sm text-fg shadow-[0_1px_3px_rgb(0_0_0/0.06),0_0_0_1px_rgb(0_0_0/0.05)] transition-colors hover:bg-panel-2 dark:shadow-[0_1px_3px_rgb(0_0_0/0.3),0_0_0_1px_rgb(255_255_255/0.06)] dark:hover:bg-tint-strong"
      >
        <Search size={16} className="shrink-0" />
        <span className="flex-1 truncate text-left">
          Search your recordings and screenshots
        </span>
        <Kbd>⌘K</Kbd>
      </button>

      {opened ? <SearchDialog isOpen={open} onOpenChange={setOpen} /> : null}
    </>
  );
}
