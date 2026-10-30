"use client";

import {
  Check,
  ChevronDown,
  ExternalLink,
  Eye,
  Link2,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Smile,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useState, useTransition, type FormEvent, type ReactNode } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useConfirm } from "./confirm-dialog";
import { VisibilityDialog, type Visibility } from "@/app/VisibilityDialog";
import {
  initials,
  formatBytes,
  formatRelativeShort as formatRelative,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import { useDevPref } from "@/lib/dev/prefs";

// Over the thumbnail the secondary button's pale fill and soft accent icon
// disappear against a light capture, so the controls there take the same
// dark glass as the selection checkbox.
const OVERLAY_BUTTON =
  "bg-black/55 text-white hover:bg-black/70 hover:text-white aria-expanded:bg-black/70 aria-expanded:text-white backdrop-blur-sm";

type ActionResult = { error: string | null } | void;

export type MediaCardStats = {
  views: number;
  comments: number;
  reactions: number;
};

export type MediaCardProps = {
  noun: string;
  // A function receives whether the card is hovered, for a live preview.
  media: ReactNode | ((hovered: boolean) => ReactNode);
  viewUrl: string;
  editUrl: string;
  displayTitle: string;
  initialTitle: string;
  titlePlaceholder: string;
  authorLabel: string;
  authorImage?: string | null;
  createdAt: number;
  visibility: Visibility;
  workspaceName?: string | null;
  allowPublicLinks: boolean;
  canAuthor: boolean;
  canManage: boolean;
  stats: MediaCardStats;
  sizeBytes: number;
  deleteConfirm: { title: string; description?: string };
  // Present only when the surface runs a selection; the checkbox and the
  // selected outline appear with it.
  selected?: boolean;
  selectionActive?: boolean;
  onSelectedChange?: (next: boolean) => void;
  onRename: (title: string) => Promise<ActionResult>;
  onDelete: () => Promise<ActionResult>;
  onChangeVisibility: (next: Visibility) => Promise<ActionResult>;
};

export function MediaCard({
  noun,
  media,
  viewUrl,
  editUrl,
  displayTitle,
  initialTitle,
  titlePlaceholder,
  authorLabel,
  authorImage,
  createdAt,
  visibility: initialVisibility,
  workspaceName,
  allowPublicLinks,
  canAuthor,
  canManage,
  stats,
  sizeBytes,
  deleteConfirm,
  selected = false,
  selectionActive = false,
  onSelectedChange,
  onRename,
  onDelete,
  onChangeVisibility,
}: MediaCardProps) {
  const showSize = useDevPref("file-sizes");
  const [hovered, setHovered] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [visibility, setVisibility] = useState<Visibility>(initialVisibility);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const { confirm, dialog } = useConfirm();

  const copyLink = () => {
    if (typeof window === "undefined") return;
    void navigator.clipboard
      .writeText(viewUrl)
      .then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => setCopied(false));
  };

  const submitRename = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await onRename(title);
      if (res?.error) {
        setError(res.error);
        return;
      }
      setEditing(false);
    });
  };

  const remove = async () => {
    const ok = await confirm({
      ...deleteConfirm,
      confirmLabel: "Delete",
      destructive: true,
    });
    if (!ok) return;
    setError(null);
    startTransition(async () => {
      const res = await onDelete();
      if (res?.error) setError(res.error);
    });
  };

  const changeVisibility = (next: Visibility) => {
    if (next === visibility) return;
    const previous = visibility;
    setVisibility(next);
    setError(null);
    startTransition(async () => {
      const res = await onChangeVisibility(next);
      if (res?.error) {
        setVisibility(previous);
        setError(res.error);
      }
    });
  };

  return (
    <Card
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      className={cn(
        "group relative gap-0 overflow-hidden border border-line p-0 shadow-none ring-0 transition-[border-color,box-shadow] hover:border-accent-bg hover:shadow-[0_0_0_1px_var(--color-accent-bg)]",
        selected &&
          "border-accent-bg shadow-[0_0_0_1px_var(--color-accent-bg)]",
      )}
    >
      {dialog}
      {/* The card's one link is stretched over it from the title below, so the
          thumbnail needs no anchor of its own — and the actions, which sit on
          top of that overlay, need raising above it. */}
      <div className="relative">
        <div className="relative aspect-video overflow-hidden bg-tint">
          {typeof media === "function" ? media(hovered) : media}
        </div>

        {onSelectedChange && (
          /* Hidden until the card is hovered, so a grid at rest stays as quiet
             as it was before selection existed. Once anything is selected the
             whole grid shows its boxes: picking a second card shouldn't mean
             hunting for a control that only appears under the cursor. */
          /* Field colours vanish against a thumbnail: fixed white-on-scrim reads
             over whatever the frame happens to be. */
          <Checkbox
            aria-label={`Select ${displayTitle}`}
            checked={selected}
            onCheckedChange={(next) => onSelectedChange(next === true)}
            className={cn(
              "absolute top-3 left-3 z-10 size-5 border-2 border-white/90 bg-black/40 shadow-sm backdrop-blur-sm transition-opacity group-hover:opacity-100 motion-reduce:transition-none dark:bg-black/40",
              selected || selectionActive
                ? "opacity-100"
                : "opacity-0 focus-visible:opacity-100",
            )}
          />
        )}

        {/* Hidden until the card is hovered, so the thumbnail reads clean in
            the grid; keyboard focus, an open menu and touch screens, which
            have no hover, keep the controls shown. */}
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100 has-[[aria-expanded=true]]:opacity-100 pointer-coarse:opacity-100">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon-sm"
                variant={copied ? "default" : "secondary"}
                className={copied ? undefined : OVERLAY_BUTTON}
                aria-label={copied ? "Link copied" : "Copy link"}
                onClick={copyLink}
              >
                {copied ? <Check size={16} /> : <Link2 size={16} />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {copied ? "Link copied" : "Copy link"}
            </TooltipContent>
          </Tooltip>
          {canManage && (
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label="More actions"
                className={cn(
                  buttonVariants({ variant: "secondary", size: "icon-sm" }),
                  OVERLAY_BUTTON,
                )}
              >
                <MoreHorizontal size={16} />
              </DropdownMenuTrigger>
              <DropdownMenuContent side="bottom" align="end" className="w-auto">
                <DropdownMenuItem
                  onSelect={() => window.open(viewUrl, "_blank", "noreferrer")}
                >
                  <ExternalLink size={16} />
                  Open {noun}
                </DropdownMenuItem>
                {canAuthor ? (
                  <DropdownMenuItem onSelect={() => setEditing(true)}>
                    <Pencil size={16} />
                    Rename
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuItem
                  variant="destructive"
                  disabled={pending}
                  onSelect={() => void remove()}
                >
                  <Trash2 size={16} />
                  Delete {noun}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <Avatar className="h-7 w-7 shrink-0">
            {authorImage && <AvatarImage src={authorImage} alt={authorLabel} />}
            <AvatarFallback>{initials(authorLabel)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 leading-tight">
            {/* The name gives way; the dot and the time never wrap. */}
            <div className="flex min-w-0 items-center gap-1.5 text-sm leading-6">
              <p className="block min-w-0 truncate font-semibold text-foreground">
                {authorLabel}
              </p>
              <p className="shrink-0 text-muted-foreground">·</p>
              <p className="shrink-0 whitespace-nowrap text-muted-foreground">
                <span suppressHydrationWarning>
                  {formatRelative(createdAt)}
                </span>
              </p>
            </div>
            <div className="relative z-10 -mt-1 w-fit">
              {canManage ? (
                <VisibilityDialog
                  value={visibility}
                  disabled={pending}
                  onChange={changeVisibility}
                  allowPublic={allowPublicLinks}
                  workspaceName={workspaceName}
                  title={`Share ${noun}`}
                  shareUrl={viewUrl}
                  trigger={
                    <VisibilityText visibility={visibility} interactive />
                  }
                />
              ) : (
                <VisibilityText visibility={visibility} />
              )}
            </div>
          </div>
        </div>

        {editing ? (
          <form onSubmit={submitRename}>
            <ButtonGroup className="w-full">
              <Input
                autoFocus
                maxLength={200}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={titlePlaceholder}
                value={title}
              />
              <Button type="submit" disabled={pending}>
                {pending && <Spinner />}
                Save
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setEditing(false);
                  setTitle(initialTitle);
                  setError(null);
                }}
              >
                Cancel
              </Button>
            </ButtonGroup>
          </form>
        ) : (
          /* Stretched link: the anchor is the title, but its ::after covers
             the whole card, so anywhere that isn't one of the controls above
             opens the recording. */
          <Link
            href={viewUrl}
            title={displayTitle}
            className="line-clamp-2 min-h-[2lh] text-[15px] font-semibold text-fg after:absolute after:inset-0 after:content-['']"
          >
            {displayTitle}
          </Link>
        )}

        <Separator />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Stat icon={<Eye size={14} />} value={stats.views} />
            <Stat icon={<MessageSquare size={14} />} value={stats.comments} />
            <Stat icon={<Smile size={14} />} value={stats.reactions} />
          </div>
          <div className="flex items-center gap-3">
            {showSize && (
              <p className="text-sm leading-6 whitespace-nowrap text-muted-foreground">
                {formatBytes(sizeBytes)}
              </p>
            )}
            {canAuthor && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href={editUrl}
                    aria-label={`Edit ${noun}`}
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "icon-sm" }),
                      "relative z-10",
                    )}
                  >
                    <Pencil size={16} />
                  </Link>
                </TooltipTrigger>
                <TooltipContent>Edit {noun}</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>

        {error && <p className="text-xs leading-5 text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}

function Stat({ icon, value }: { icon: ReactNode; value: number }) {
  return (
    <div className="flex items-center gap-1 text-fg-muted">
      {icon}
      <p className="text-sm leading-6 text-muted-foreground">{value}</p>
    </div>
  );
}

function visibilityLabel(v: Visibility): string {
  if (v === "public") return "Public";
  if (v === "workspace") return "Workspace";
  return "Private";
}

function VisibilityText({
  visibility,
  interactive,
}: {
  visibility: Visibility;
  interactive?: boolean;
}) {
  if (!interactive) {
    return (
      <p className="text-xs leading-5 text-muted-foreground">
        {visibilityLabel(visibility)}
      </p>
    );
  }
  return (
    <span className="inline-flex cursor-pointer items-center gap-0.5 text-xs text-accent-strong hover:text-accent-strong">
      {visibilityLabel(visibility)}
      <ChevronDown size={12} />
    </span>
  );
}
