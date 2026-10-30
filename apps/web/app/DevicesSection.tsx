"use client";

import { useTransition } from "react";
import { Monitor } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Empty } from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import type { DeviceTokenRow } from "@/lib/device-tokens";
import { revokeDeviceTokenAction } from "./actions";

type DevicesSectionProps = {
  tokens: DeviceTokenRow[];
};

export function DevicesSection({ tokens }: DevicesSectionProps) {
  if (tokens.length === 0) {
    return (
      <Empty className="mt-4 text-center text-sm text-fg-muted">
        No connected devices. Open the CaptureFlow desktop app and click Sign in
        on the record bar to link this account.
      </Empty>
    );
  }
  return (
    <Card className="mt-4">
      <ul className="divide-y divide-line">
        {tokens.map((token) => (
          <DeviceRow key={token.id} token={token} />
        ))}
      </ul>
    </Card>
  );
}

function DeviceRow({ token }: { token: DeviceTokenRow }) {
  const [pending, startTransition] = useTransition();

  const onRevoke = () => {
    startTransition(async () => {
      await revokeDeviceTokenAction(token.id);
    });
  };

  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <Monitor className="h-4 w-4 shrink-0 text-fg-subtle" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-fg">
          {token.label || "Unlabelled device"}
        </p>
        <p className="mt-0.5 flex items-center gap-2 text-xs text-fg-muted">
          <span>
            Added {formatDate(token.createdAt)}
            {token.lastUsedAt
              ? ` · last used ${formatDate(token.lastUsedAt)}`
              : ""}
          </span>
          {token.lastUsedAt ? null : (
            <Badge variant="secondary">Never used</Badge>
          )}
        </p>
      </div>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="sm" className="text-destructive">
            {pending && <Spinner />}
            Revoke
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Sign this device out?</AlertDialogTitle>
            <AlertDialogDescription>
              It will need to sign in again to manage recordings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="secondary" size="sm">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              size="sm"
              onClick={onRevoke}
            >
              Revoke
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
