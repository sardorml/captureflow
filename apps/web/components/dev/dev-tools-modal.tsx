"use client";

import { Checkbox, Kbd, Modal } from "@heroui/react";
import { useEffect, useSyncExternalStore } from "react";
import {
  drainSplitStamps,
  formatSplitTime,
  getServerSplitLoads,
  getSplitLoads,
  subscribeSplitLoads,
} from "@/lib/dev/split-loads";
import { setDevPref, useDevPref } from "@/lib/dev/prefs";

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
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog>
            <Modal.Header>
              <Modal.Heading>Developer</Modal.Heading>
            </Modal.Header>
            <Modal.Body className="flex flex-col gap-5 pb-6">
              <Checkbox
                isSelected={codeSplitView}
                onChange={onCodeSplitViewChange}
              >
                {/* Content is the <label>, so the text has to sit inside it
                    for a click on the words to toggle. */}
                <Checkbox.Content className="items-start gap-3">
                  <Checkbox.Control className="mt-0.5">
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                  <span className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-fg">
                      Code-split view
                    </span>
                    <span className="text-xs text-fg-muted">
                      Outlines every section that streams on its own or ships in
                      its own chunk, with when it arrived. Stays on across
                      reloads.
                    </span>
                  </span>
                </Checkbox.Content>
              </Checkbox>

              <Checkbox
                isSelected={fileSizes}
                onChange={(on) => setDevPref("file-sizes", on)}
              >
                <Checkbox.Content className="items-start gap-3">
                  <Checkbox.Control className="mt-0.5">
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                  <span className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-fg">
                      File sizes
                    </span>
                    <span className="text-xs text-fg-muted">
                      Shows each recording&apos;s and screenshot&apos;s size on
                      its card.
                    </span>
                  </span>
                </Checkbox.Content>
              </Checkbox>

              {LOCAL_DEV ? (
                <Checkbox
                  isSelected={fakeCheckout}
                  onChange={(on) => setDevPref("fake-checkout", on)}
                >
                  <Checkbox.Content className="items-start gap-3">
                    <Checkbox.Control className="mt-0.5">
                      <Checkbox.Indicator />
                    </Checkbox.Control>
                    <span className="flex flex-col gap-1">
                      <span className="text-sm font-medium text-fg">
                        Fake checkout
                      </span>
                      <span className="text-xs text-fg-muted">
                        Upgrade in the upgrade dialog applies the seat picks and
                        activates the plan here, without Lemon Squeezy. Only
                        under next dev.
                      </span>
                    </span>
                  </Checkbox.Content>
                </Checkbox>
              ) : null}

              <div className="flex flex-col gap-2">
                <p className="text-xs font-medium text-fg-subtle">
                  Sections on this page
                </p>
                {arrived.length === 0 ? (
                  <p className="text-xs text-fg-muted">
                    None have arrived yet.
                  </p>
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
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
