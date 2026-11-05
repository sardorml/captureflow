"use client";

import { useCallback, useRef, useState, type ReactElement } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppMessages } from "@/components/app-i18n-provider";

export type ConfirmOptions = {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
};

type ConfirmState = ConfirmOptions & { open: boolean };

const CLOSED: ConfirmState = { open: false, title: "" };

/*
 * Replaces window.confirm, which renders as a browser chrome dialog ("localhost
 * says…") that ignores the theme and cannot be styled. Returns a promise so the
 * call sites keep their `if (!ok) return;` shape instead of splitting a handler
 * across two callbacks.
 */
export function useConfirm(): {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  dialog: ReactElement;
} {
  const [state, setState] = useState<ConfirmState>(CLOSED);
  const resolveRef = useRef<((ok: boolean) => void) | null>(null);

  const settle = useCallback((ok: boolean) => {
    resolveRef.current?.(ok);
    resolveRef.current = null;
    setState(CLOSED);
  }, []);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    // A second call while one is open would strand the first promise forever.
    resolveRef.current?.(false);
    setState({ ...options, open: true });
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  const dialog = (
    <ConfirmDialog
      {...state}
      onCancel={() => settle(false)}
      onConfirm={() => settle(true)}
    />
  );

  return { confirm, dialog };
}

function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  destructive = false,
  onCancel,
  onConfirm,
}: ConfirmState & {
  onCancel: () => void;
  onConfirm: () => void;
}): ReactElement {
  const m = useAppMessages();
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <DialogContent showCloseButton={false} className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={onCancel}>
            {cancelLabel ?? m.common.cancel}
          </Button>
          {/* autoFocus on the destructive action would make Enter delete;
              the cancel path is the safe default for a keyboard user. */}
          <Button
            variant={destructive ? "destructive" : "default"}
            onClick={onConfirm}
          >
            {confirmLabel ?? m.common.confirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
