import type { ReactElement } from "react";
import { Avatar } from "antd";
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
  const owner = displayName(name, email);
  return (
    <div
      className={`hidden items-center gap-2 border-l border-line pl-4 sm:flex ${className}`}
    >
      <Avatar size={32}>{avatarInitial(owner)}</Avatar>
      <div className="leading-tight">
        <p className="text-[11px] uppercase tracking-wider text-fg-subtle">
          Posted by
        </p>
        <p className="text-sm font-medium text-fg-strong">{owner}</p>
      </div>
    </div>
  );
}
