"use client";

import { useEffect, useSyncExternalStore } from "react";
import {
  drainSplitStamps,
  formatSplitTime,
  getServerSplitLoads,
  getSplitLoads,
  subscribeSplitLoads,
} from "@/lib/dev/split-loads";
import { setDevPref, useDevPref } from "@/lib/dev/prefs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Kbd } from "@/components/ui/kbd";
import { Label } from "@/components/ui/label";
import { DevSubscription } from "./dev-subscription";

const LOCAL_DEV = process.env.NODE_ENV === "development";

type Props = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  codeSplitView: boolean;
  onCodeSplitViewChange: (on: boolean) => void;
};

export function DevToolsModal({
  isOpen,
  onOpenChange,
  codeSplitView,
  onCodeSplitViewChange,
}: Props) {
  const { navAt, loads } = useSyncExternalStore(
    subscribeSplitLoads,
    getSplitLoads,
    getServerSplitLoads,
  );
  useEffect(() => {
    if (isOpen) drainSplitStamps();
  }, [isOpen]);
  const fakeCheckout = useDevPref("fake-checkout");
  const fileSizes = useDevPref("file-sizes");
  const arrived = [...loads].sort((a, b) => a.at - b.at);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Developer</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-5">
          <Label className="items-start gap-3 leading-normal font-normal">
            <Checkbox
              className="mt-0.5"
              checked={codeSplitView}
              onCheckedChange={(v) => onCodeSplitViewChange(v === true)}
            />
            <span className="flex flex-col gap-1">
              <span className="text-sm font-medium text-fg">
                Code-split view
              </span>
              <span className="text-xs text-fg-muted">
                Outlines every section that streams on its own or ships in its
                own chunk, with when it arrived. Stays on across reloads.
              </span>
            </span>
          </Label>

          <Label className="items-start gap-3 leading-normal font-normal">
            <Checkbox
              className="mt-0.5"
              checked={fileSizes}
              onCheckedChange={(v) => setDevPref("file-sizes", v === true)}
            />
            <span className="flex flex-col gap-1">
              <span className="text-sm font-medium text-fg">File sizes</span>
              <span className="text-xs text-fg-muted">
                Shows each recording&apos;s and screenshot&apos;s size on its
                card.
              </span>
            </span>
          </Label>

          {LOCAL_DEV ? (
            <Label className="items-start gap-3 leading-normal font-normal">
              <Checkbox
                className="mt-0.5"
                checked={fakeCheckout}
                onCheckedChange={(v) => setDevPref("fake-checkout", v === true)}
              />
              <span className="flex flex-col gap-1">
                <span className="text-sm font-medium text-fg">
                  Fake checkout
                </span>
                <span className="text-xs text-fg-muted">
                  Upgrade in the upgrade dialog applies the seat picks and
                  activates the plan here, without Lemon Squeezy. Only under
                  next dev.
                </span>
              </span>
            </Label>
          ) : null}

          {LOCAL_DEV ? <DevSubscription isOpen={isOpen} /> : null}

          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-fg-subtle">
              Sections on this page
            </p>
            {arrived.length === 0 ? (
              <p className="text-xs text-fg-muted">None have arrived yet.</p>
            ) : (
              <dl className="grid grid-cols-[1fr_auto] gap-x-6 gap-y-1 font-mono text-xs">
                {arrived.map((load) => (
                  <div key={load.name} className="contents">
                    <dt className="text-fg">{load.name}</dt>
                    <dd className="text-right text-fg-muted">
                      {formatSplitTime(load.at, navAt)}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </div>

          <p className="text-xs text-fg-subtle">
            <Kbd>⌘⇧E</Kbd> opens this panel on any page.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
