"use client";

import { useTransition } from "react";
import { Monitor } from "lucide-react";
import type { DeviceTokenRow } from "@/lib/device-tokens";
import { revokeDeviceTokenAction } from "./actions";

type DevicesSectionProps = {
  tokens: DeviceTokenRow[];
};

export function DevicesSection({ tokens }: DevicesSectionProps) {
  if (tokens.length === 0) {
    return (
      <p className="mt-4 rounded-lg border border-dashed border-line-strong bg-canvas px-4 py-6 text-center text-sm text-fg-muted">
        No connected devices. Open the CaptureFlow desktop app and click Sign in
        on the record bar to link this account.
      </p>
    );
  }
  return (
    <ul className="mt-4 divide-y divide-line overflow-hidden rounded-lg border border-line">
      {tokens.map((t) => (
        <DeviceRow key={t.id} token={t} />
      ))}
    </ul>
  );
}

function DeviceRow({ token }: { token: DeviceTokenRow }) {
  const [pending, startTransition] = useTransition();

  const onRevoke = () => {
    const ok = confirm(
      "Sign this device out? It will need to sign in again to manage shares.",
    );
    if (!ok) return;
    startTransition(async () => {
      await revokeDeviceTokenAction(token.id);
    });
  };

  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <Monitor className="h-4 w-4 text-neutral-500" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-neutral-200">
          {token.label || "Unlabelled device"}
        </p>
        <p className="mt-0.5 text-xs text-neutral-500">
          Added {formatDate(token.createdAt)}
          {token.lastUsedAt
            ? ` · last used ${formatDate(token.lastUsedAt)}`
            : ""}
        </p>
      </div>
      <button
        className="rounded-md px-2.5 py-1 text-xs text-fg-muted transition-colors hover:bg-danger-soft hover:text-danger disabled:opacity-60"
        disabled={pending}
        onClick={onRevoke}
        type="button"
      >
        Revoke
      </button>
    </li>
  );
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
