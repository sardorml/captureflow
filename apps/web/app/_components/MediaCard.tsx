"use client";

import Link from "next/link";
import { useState, useTransition, type FormEvent, type ReactNode } from "react";
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
import {
  Avatar,
  Button,
  ButtonGroup,
  Card,
  Checkbox,
  Dropdown,
  Input,
  Separator,
  Spinner,
  Tooltip,
  Typography,
  buttonVariants,
} from "@heroui/react";
import { cn } from "@/lib/utils";
import {
  initials,
  formatBytes,
  formatRelativeShort as formatRelative,
} from "@/lib/format";
import { VisibilityDialog, type Visibility } from "@/app/VisibilityDialog";

type ActionResult = { error: string | null } | void;

export type MediaCardStats = {
  views: number;
  comments: number;
  reactions: number;
};

export type MediaCardProps = {
  noun: string;
  media: ReactNode;
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
  deleteConfirm: string;
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
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [visibility, setVisibility] = useState<Visibility>(initialVisibility);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

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

  const remove = () => {
    if (!confirm(deleteConfirm)) return;
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

  const onMenuAction = (key: React.Key) => {
    if (key === "open") window.open(viewUrl, "_blank", "noreferrer");
    else if (key === "rename") setEditing(true);
    else if (key === "delete") remove();
  };

  return (
    /* p-0/gap-0: HeroUI's .card pads itself, which insets the thumbnail and
       leaves the text (Card.Content's own p-4) at double that — the image and
       the copy end up on different rails. Card.Content owns the inset now. */
    <Card
      className={cn(
        "group gap-0 overflow-hidden p-0 transition-[border-color,box-shadow] hover:border-accent-bg hover:shadow-[0_0_0_1px_var(--color-accent-bg)]",
        selected &&
          "border-accent-bg shadow-[0_0_0_1px_var(--color-accent-bg)]",
      )}
    >
      {/* The card's one link is stretched over it from the title below, so the
          thumbnail needs no anchor of its own — and the actions, which sit on
          top of that overlay, need raising above it. */}
      <div className="relative">
        <div className="aspect-video overflow-hidden">{media}</div>

        {onSelectedChange && (
          /* Hidden until the card is hovered, so a grid at rest stays as quiet
             as it was before selection existed. Once anything is selected the
             whole grid shows its boxes: picking a second card shouldn't mean
             hunting for a control that only appears under the cursor. */
          <Checkbox
            aria-label={`Select ${displayTitle}`}
            isSelected={selected}
            onChange={onSelectedChange}
            className={cn(
              "absolute top-2 left-2 z-10 p-1 transition-opacity group-hover:opacity-100 motion-reduce:transition-none",
              selected || selectionActive
                ? "opacity-100"
                : "opacity-0 focus-within:opacity-100",
            )}
          >
            {/* Control and indicator are children, not something the root
                draws — a bare Checkbox renders an empty box. Its own colours
                are field colours, which vanish against a thumbnail: fixed
                white-on-scrim reads over whatever the frame happens to be. */}
            <Checkbox.Content>
              <Checkbox.Control className="size-5 border-2 border-white/90 bg-black/40 shadow-sm backdrop-blur-sm">
                <Checkbox.Indicator />
              </Checkbox.Control>
            </Checkbox.Content>
          </Checkbox>
        )}

        <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5">
          <Tooltip>
            <Tooltip.Trigger className="inline-flex">
              <Button
                size="sm"
                isIconOnly
                variant={copied ? "primary" : "secondary"}
                aria-label={copied ? "Link copied" : "Copy link"}
                onPress={copyLink}
              >
                {copied ? <Check size={16} /> : <Link2 size={16} />}
              </Button>
            </Tooltip.Trigger>
            <Tooltip.Content>
              {copied ? "Link copied" : "Copy link"}
            </Tooltip.Content>
          </Tooltip>
          {canManage && (
            <Dropdown>
              <Dropdown.Trigger
                aria-label="More actions"
                className={buttonVariants({
                  variant: "secondary",
                  size: "sm",
                  isIconOnly: true,
                })}
              >
                <MoreHorizontal size={16} />
              </Dropdown.Trigger>
              <Dropdown.Popover placement="bottom end">
                <Dropdown.Menu onAction={onMenuAction}>
                  <Dropdown.Item id="open">
                    <ExternalLink size={16} />
                    Open {noun}
                  </Dropdown.Item>
                  {canAuthor ? (
                    <Dropdown.Item id="rename">
                      <Pencil size={16} />
                      Rename
                    </Dropdown.Item>
                  ) : null}
                  <Dropdown.Item
                    id="delete"
                    isDisabled={pending}
                    className="text-danger"
                  >
                    <Trash2 size={16} />
                    Delete {noun}
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown.Popover>
            </Dropdown>
          )}
        </div>
      </div>

      <Card.Content className="flex flex-col gap-3 p-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <Avatar className="h-7 w-7 shrink-0">
            {authorImage && (
              <Avatar.Image src={authorImage} alt={authorLabel} />
            )}
            <Avatar.Fallback>{initials(authorLabel)}</Avatar.Fallback>
          </Avatar>
          <div className="min-w-0 leading-tight">
            {/* size on each child, not text-sm on the wrapper: Typography
                always emits its own size class, which wins over inheritance. */}
            <div className="flex items-center gap-1.5">
              <Typography weight="semibold" type="body-sm" truncate>
                {authorLabel}
              </Typography>
              <Typography color="muted" type="body-sm">
                ·
              </Typography>
              <Typography color="muted" type="body-sm">
                <span suppressHydrationWarning>
                  {formatRelative(createdAt)}
                </span>
              </Typography>
            </div>
            <div className="relative z-10 w-fit">
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
                fullWidth
              />
              <Button type="submit" variant="primary" isDisabled={pending}>
                {pending && <Spinner size="sm" color="current" />}
                Save
              </Button>
              <Button
                variant="secondary"
                onPress={() => {
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
            className="line-clamp-2 text-[15px] font-semibold text-fg after:absolute after:inset-0 after:content-['']"
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
            <Typography
              color="muted"
              type="body-sm"
              className="whitespace-nowrap"
            >
              {formatBytes(sizeBytes)}
            </Typography>
            {canAuthor && (
              <Tooltip>
                <Tooltip.Trigger className="relative z-10 inline-flex">
                  <Link
                    href={editUrl}
                    aria-label={`Edit ${noun}`}
                    className={buttonVariants({
                      variant: "ghost",
                      size: "sm",
                      isIconOnly: true,
                    })}
                  >
                    <Pencil size={16} />
                  </Link>
                </Tooltip.Trigger>
                <Tooltip.Content>Edit {noun}</Tooltip.Content>
              </Tooltip>
            )}
          </div>
        </div>

        {error && (
          <Typography type="body-xs" className="text-danger">
            {error}
          </Typography>
        )}
      </Card.Content>
    </Card>
  );
}

function Stat({ icon, value }: { icon: ReactNode; value: number }) {
  return (
    <div className="flex items-center gap-1 text-fg-muted">
      {icon}
      <Typography color="muted" type="body-sm">
        {value}
      </Typography>
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
      <Typography type="body-xs" color="muted">
        {visibilityLabel(visibility)}
      </Typography>
    );
  }
  return (
    <span className="inline-flex cursor-pointer items-center gap-0.5 text-xs text-accent hover:text-accent-strong">
      {visibilityLabel(visibility)}
      <ChevronDown size={12} />
    </span>
  );
}
