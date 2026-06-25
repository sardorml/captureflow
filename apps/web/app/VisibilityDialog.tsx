"use client";

import { useState, useTransition, type ReactNode } from "react";
import {
  ShareVisibilityModal,
  type Visibility,
} from "./_components/ShareVisibilityModal";

export type { Visibility };

type Props = {
  value: Visibility;
  disabled?: boolean;
  onChange: (next: Visibility) => Promise<void> | void;
  allowPublic?: boolean;
  workspaceName?: string | null;
  title?: string;
  shareUrl?: string;
  trigger: ReactNode;
};

export function VisibilityDialog({
  value,
  disabled,
  onChange,
  allowPublic = true,
  workspaceName,
  title = "Share",
  shareUrl,
  trigger,
}: Props) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const pick = (next: Visibility) => {
    if (next === value) return;
    startTransition(async () => {
      await onChange(next);
    });
  };

  return (
    <>
      <span
        onClick={() => {
          if (!disabled) setOpen(true);
        }}
        style={{ display: "contents" }}
      >
        {trigger}
      </span>
      <ShareVisibilityModal
        open={open}
        onClose={() => setOpen(false)}
        title={title}
        visibility={value}
        onChange={pick}
        workspaceName={workspaceName}
        allowPublic={allowPublic}
        pending={pending || disabled}
        shareUrl={shareUrl}
      />
    </>
  );
}
