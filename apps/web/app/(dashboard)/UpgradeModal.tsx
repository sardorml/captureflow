"use client";

import { useEffect, useState, type ReactElement } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { withSplitLoaded } from "@/components/dev/split-loaded";
import type { SeatOffer } from "@/lib/billing/seat-checkout";

// The dialog's copy and the managed card only download on the first open.
const UpgradeModalBody = dynamic(
  () =>
    import("./UpgradeModalBody").then((m) =>
      withSplitLoaded("upgrade-modal", m.UpgradeModalBody),
    ),
  { ssr: false },
);

type Props = {
  email: string;
  userId: string;
  // Rendered as a child, never cloned — see the wrapper below. Stays an
  // element (not a render prop) because server components render this and
  // functions can't cross that boundary.
  trigger: ReactElement;
  // Auto-opens when the URL has ?upgrade — the landing/pricing tiers send
  // signed-out buyers through /login?mode=signup&next=/recordings?upgrade=1. Enable on
  // one instance per page or they all pop.
  openOnUpgradeParam?: boolean;
  seat: SeatOffer;
};

export function UpgradeModal({
  email,
  userId,
  trigger,
  openOnUpgradeParam = false,
  seat,
}: Props) {
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(
    () => openOnUpgradeParam && searchParams.has("upgrade"),
  );
  // Stays mounted after the first open so closing can animate out.
  const [opened, setOpened] = useState(open);
  /*
   * Mounted closed once the page is idle: the first open otherwise waits for
   * the dialog's chunk and its first render, most of a second on a clean
   * profile, while every later open is near-instant. A closed modal puts
   * nothing in the DOM.
   */
  useEffect(() => {
    const warm = () => setOpened(true);
    const idle =
      "requestIdleCallback" in window ? requestIdleCallback(warm) : null;
    const timer = window.setTimeout(warm, 1500);
    return () => {
      if (idle !== null) cancelIdleCallback(idle);
      window.clearTimeout(timer);
    };
  }, []);
  const show = () => {
    setOpened(true);
    setOpen(true);
  };

  return (
    <>
      {/*
       * Rendered, never cloned. React can hand a server-created element to a
       * client component as a lazy reference, and cloneElement reads `.type`
       * off that wrapper — undefined, which takes the whole page down with
       * "Element type is invalid". Capture phase, because React Aria's
       * usePress calls stopPropagation() on click.
       */}
      <span className="contents" onClickCapture={show}>
        {trigger}
      </span>
      {opened ? (
        <UpgradeModalBody
          email={email}
          userId={userId}
          seat={seat}
          isOpen={open}
          onOpenChange={setOpen}
        />
      ) : null}
    </>
  );
}
