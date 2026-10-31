"use client";

import { Pencil } from "lucide-react";
import {
  type ReactElement,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { renameRecordingAction } from "@/app/actions";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type Props = {
  slug: string;
  title: string;
  canEdit: boolean;
  // Overrides the headline's size; the share page keeps the default.
  sizeClassName?: string;
};

const HEADLINE_CLASS =
  "text-3xl font-[600] tracking-tight text-neutral-100 lg:text-2xl";

export function EditableTitle({
  slug,
  title: initialTitle,
  canEdit,
  sizeClassName,
}: Props) {
  const headline = cn(HEADLINE_CLASS, sizeClassName);
  const [title, setTitle] = useState(initialTitle);
  const [draft, setDraft] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const [fullTitleShown, setFullTitleShown] = useState(false);
  const editing = draft != null;

  // Only a title the line actually cuts off gets the tooltip.
  const withFullTitle = (trigger: ReactElement) => (
    <Tooltip
      open={fullTitleShown}
      onOpenChange={(open) => {
        const el = headingRef.current;
        setFullTitleShown(open && !!el && el.scrollWidth > el.clientWidth);
      }}
    >
      <TooltipTrigger asChild>{trigger}</TooltipTrigger>
      <TooltipContent side="bottom" align="start" className="max-w-lg">
        {title}
      </TooltipContent>
    </Tooltip>
  );

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  if (!canEdit) {
    return withFullTitle(
      <h1 ref={headingRef} className={cn("lg:truncate", headline)}>
        {title}
      </h1>,
    );
  }

  const commit = (): void => {
    if (draft == null) return;
    const next = draft.trim();
    setDraft(null);
    if (next.length === 0 || next === title) return;
    const previous = title;
    setTitle(next);
    setError(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("slug", slug);
      fd.set("title", next);
      const res = await renameRecordingAction({ error: null, slug: null }, fd);
      if (res.error) {
        setTitle(previous);
        setError(res.error);
        return;
      }
      document.title = next;
    });
  };

  if (editing) {
    return (
      <div className="-mx-3 flex items-center gap-3 rounded-xl px-3 py-1.5 ring-2 ring-accent-ring">
        <Pencil className="size-5 shrink-0 text-fg" aria-hidden="true" />
        <input
          ref={inputRef}
          autoFocus
          value={draft}
          maxLength={200}
          aria-label="Recording title"
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") setDraft(null);
          }}
          className={cn("w-full min-w-0 bg-transparent outline-none", headline)}
        />
      </div>
    );
  }

  return (
    <>
      {withFullTitle(
        <button
          type="button"
          onClick={() => setDraft(title)}
          className="group/title -mx-3 flex w-[calc(100%+1.5rem)] items-center gap-3 rounded-xl px-3 py-1.5 text-left transition-colors hover:bg-tint"
          aria-label="Rename recording"
        >
          <Pencil
            className="hidden size-5 shrink-0 text-fg-muted group-hover/title:block"
            aria-hidden="true"
          />
          <h1
            ref={headingRef}
            className={cn(
              "min-w-0 transition-colors group-hover/title:text-accent-strong lg:truncate",
              headline,
            )}
          >
            {title}
          </h1>
        </button>,
      )}
      {error ? <p className="mt-1 text-sm text-destructive">{error}</p> : null}
    </>
  );
}
