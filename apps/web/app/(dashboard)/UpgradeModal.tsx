"use client";

import { useState, type ReactElement } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";

// The dialog's copy and the managed card only download on the first open.
const UpgradeModalBody = dynamic(
  () => import("./UpgradeModalBody").then((m) => m.UpgradeModalBody),
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
};

export function UpgradeModal({
  email,
  userId,
  trigger,
  openOnUpgradeParam = false,
}: Props) {
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(
    () => openOnUpgradeParam && searchParams.has("upgrade"),
  );
  // Stays mounted after the first open so closing can animate out.
  const [opened, setOpened] = useState(open);
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
          isOpen={open}
          onOpenChange={setOpen}
        />
      ) : null}
    </>
  );
}
