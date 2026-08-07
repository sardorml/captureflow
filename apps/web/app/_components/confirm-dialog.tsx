"use client";

import { Button, Modal } from "@heroui/react";
import { useCallback, useRef, useState, type ReactElement } from "react";

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
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  onCancel,
  onConfirm,
}: ConfirmState & {
  onCancel: () => void;
  onConfirm: () => void;
}): ReactElement {
  return (
    <Modal isOpen={open} onOpenChange={(next) => !next && onCancel()}>
      <Modal.Backdrop>
        <Modal.Container size="sm">
          <Modal.Dialog>
            <Modal.Header>
              <Modal.Heading>{title}</Modal.Heading>
            </Modal.Header>
            {description ? (
              <Modal.Body>
                <p className="text-sm text-fg-muted">{description}</p>
              </Modal.Body>
            ) : null}
            <Modal.Footer>
              <Button variant="ghost" onPress={onCancel}>
                {cancelLabel}
              </Button>
              {/* autoFocus on the destructive action would make Enter delete;
                  the cancel path is the safe default for a keyboard user. */}
              <Button
                variant={destructive ? "danger" : "primary"}
                onPress={onConfirm}
              >
                {confirmLabel}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
