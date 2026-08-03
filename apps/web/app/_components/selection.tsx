"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button, Spinner, Typography } from "@heroui/react";

export type Selection = {
  keys: string[];
  count: number;
  has: (key: string) => boolean;
  set: (key: string, next: boolean) => void;
  clear: () => void;
};

/*
 * Selection is held as a set of keys and intersected with what the surface can
 * still show, so a row that was deleted (or filtered away) drops out instead of
 * counting toward the total.
 */
export function useSelection(available: string[]): Selection {
  const [picked, setPicked] = useState<ReadonlySet<string>>(new Set());

  const keys = useMemo(
    () => available.filter((key) => picked.has(key)),
    [available, picked],
  );

  const set = useCallback((key: string, next: boolean) => {
    setPicked((prev) => {
      const copy = new Set(prev);
      if (next) copy.add(key);
      else copy.delete(key);
      return copy;
    });
  }, []);

  const clear = useCallback(() => setPicked(new Set()), []);

  return {
    keys,
    count: keys.length,
    has: (key) => picked.has(key),
    set,
    clear,
  };
}

type SelectionBarProps = {
  noun: string;
  selection: Selection;
  onDelete: (key: string) => Promise<{ error: string | null }>;
};

/*
 * Floats over the grid while anything is selected. Deletes run one action per
 * key rather than through a bulk endpoint — each one re-checks ownership
 * server-side, and a partial failure still reports which count landed.
 */
export function SelectionBar({ noun, selection, onDelete }: SelectionBarProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const { count, keys, clear } = selection;

  if (count === 0) return null;

  const plural = count === 1 ? noun : `${noun}s`;

  const remove = () => {
    if (
      !confirm(
        `Delete ${count} ${plural} permanently? Their links stop working immediately.`,
      )
    ) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const results = await Promise.all(keys.map((key) => onDelete(key)));
      const failed = results.filter((r) => r?.error).length;
      if (failed > 0) {
        setError(
          `${failed} of ${count} couldn't be deleted. The rest are gone.`,
        );
      }
      clear();
    });
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-30 flex justify-center px-4">
      <div className="pointer-events-auto flex max-w-full items-center gap-3 rounded-full border border-line-strong bg-panel px-3 py-2 shadow-lg">
        <Typography type="body-sm" className="ps-2 whitespace-nowrap">
          {count} {plural} selected
        </Typography>
        {error && (
          <Typography type="body-sm" className="text-danger">
            {error}
          </Typography>
        )}
        <Button size="sm" variant="ghost" onPress={clear} isDisabled={pending}>
          Clear
        </Button>
        <Button
          size="sm"
          variant="danger"
          onPress={remove}
          isDisabled={pending}
        >
          {pending ? (
            <Spinner size="sm" color="current" />
          ) : (
            <Trash2 size={14} />
          )}
          Delete
        </Button>
      </div>
    </div>
  );
}
