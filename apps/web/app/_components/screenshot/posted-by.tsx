"use client";

import type { ReactElement } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAppMessages } from "@/components/app-i18n-provider";
import { avatarInitial, displayName } from "./display-name";

export type PostedByProps = {
  name: string | null;
  email: string | null;
  className?: string;
};

export function PostedBy({
  name,
  email,
  className = "",
}: PostedByProps): ReactElement {
  const copy = useAppMessages().viewer.postedBy;
  const owner = displayName(name, email, copy.someone);
  return (
    <div
      className={`hidden items-center gap-2 border-l border-line pl-4 sm:flex ${className}`}
    >
      <Avatar className="h-8 w-8">
        <AvatarFallback>{avatarInitial(owner)}</AvatarFallback>
      </Avatar>
      <div className="leading-tight">
        <p className="text-[11px] uppercase tracking-wider text-fg-subtle">
          {copy.label}
        </p>
        <p className="text-sm font-medium text-fg-strong">{owner}</p>
      </div>
    </div>
  );
}
