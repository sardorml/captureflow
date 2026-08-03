"use client";

import { useTransition } from "react";
import { Monitor } from "lucide-react";
import {
  AlertDialog,
  Button,
  Card,
  Chip,
  EmptyState,
  Spinner,
  buttonVariants,
} from "@heroui/react";
import type { DeviceTokenRow } from "@/lib/device-tokens";
import { revokeDeviceTokenAction } from "./actions";

type DevicesSectionProps = {
  tokens: DeviceTokenRow[];
};

export function DevicesSection({ tokens }: DevicesSectionProps) {
  if (tokens.length === 0) {
    return (
      <EmptyState className="mt-4 text-center text-sm text-fg-muted">
        No connected devices. Open the CaptureFlow desktop app and click Sign in
        on the record bar to link this account.
      </EmptyState>
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
          {token.lastUsedAt ? null : <Chip size="sm">Never used</Chip>}
        </p>
      </div>
      <AlertDialog>
        <AlertDialog.Trigger className="inline-flex">
          <Button variant="ghost" size="sm" className="text-danger">
            {pending && <Spinner size="sm" color="current" />}
            Revoke
          </Button>
        </AlertDialog.Trigger>
        <AlertDialog.Backdrop>
          <AlertDialog.Container size="sm">
            <AlertDialog.Dialog>
              <AlertDialog.Header>
                <AlertDialog.Heading>Sign this device out?</AlertDialog.Heading>
              </AlertDialog.Header>
              <AlertDialog.Body>
                It will need to sign in again to manage recordings.
              </AlertDialog.Body>
              <AlertDialog.Footer className="flex justify-end gap-2">
                <AlertDialog.CloseTrigger
                  className={buttonVariants({
                    variant: "secondary",
                    size: "sm",
                  })}
                >
                  Cancel
                </AlertDialog.CloseTrigger>
                <AlertDialog.CloseTrigger
                  className={buttonVariants({ variant: "danger", size: "sm" })}
                  onPress={onRevoke}
                >
                  Revoke
                </AlertDialog.CloseTrigger>
              </AlertDialog.Footer>
            </AlertDialog.Dialog>
          </AlertDialog.Container>
        </AlertDialog.Backdrop>
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
