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
import { useAppLocale, useAppMessages } from "@/components/app-i18n-provider";
import { fmt } from "@/lib/i18n/format";
import { formatDate } from "@/lib/i18n/intl";
import type { DeviceTokenRow } from "@/lib/device-tokens";
import { revokeDeviceTokenAction } from "./actions";

type DevicesSectionProps = {
  tokens: DeviceTokenRow[];
};

export function DevicesSection({ tokens }: DevicesSectionProps) {
  const m = useAppMessages();
  if (tokens.length === 0) {
    return (
      <Empty className="mt-4 text-center text-sm text-fg-muted">
        {m.settings.devices.empty}
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
  const m = useAppMessages();
  const { lang } = useAppLocale();
  const added = (ts: number) => formatDate(ts, lang, DEVICE_DATE);
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
          {token.label || m.settings.devices.unlabelled}
        </p>
        <p className="mt-0.5 flex items-center gap-2 text-xs text-fg-muted">
          <span>
            {token.lastUsedAt
              ? fmt(m.settings.devices.addedLastUsed, {
                  date: added(token.createdAt),
                  lastUsed: added(token.lastUsedAt),
                })
              : fmt(m.settings.devices.added, {
                  date: added(token.createdAt),
                })}
          </span>
          {token.lastUsedAt ? null : (
            <Badge variant="secondary">{m.settings.devices.neverUsed}</Badge>
          )}
        </p>
      </div>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="sm" className="text-destructive">
            {pending && <Spinner />}
            {m.settings.devices.revoke.action}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {m.settings.devices.revoke.title}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {m.settings.devices.revoke.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="secondary" size="sm">
              {m.common.cancel}
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              size="sm"
              onClick={onRevoke}
            >
              {m.settings.devices.revoke.action}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </li>
  );
}

const DEVICE_DATE = {
  month: "short",
  day: "numeric",
  year: "numeric",
} as const;
