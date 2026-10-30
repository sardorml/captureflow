"use client";

import { useEffect, useId, useState } from "react";
import {
  Check,
  ChevronDown,
  Code2,
  Copy,
  Globe,
  Link2,
  Lock,
  Users,
} from "lucide-react";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { formatTimestamp } from "@/lib/format";
import { shareUrlAt } from "@/lib/recording/share-time";
import { cn } from "@/lib/utils";

export type Visibility = "public" | "workspace" | "private";

const VISIBILITY_LABELS: Record<Visibility, string> = {
  public: "Public",
  workspace: "Workspace",
  private: "Private",
};

const VISIBILITY_DESCRIPTIONS: Record<Visibility, string> = {
  public: "Anyone with the link can view",
  workspace: "Only signed-in workspace members can view",
  private: "Only you can view",
};

function VisibilityIcon({ value }: { value: Visibility }) {
  const Icon =
    value === "public" ? Globe : value === "workspace" ? Users : Lock;
  return <Icon className="h-4 w-4" />;
}

function optionLabel(value: Visibility, workspaceName?: string | null): string {
  return value === "workspace" && workspaceName
    ? `Workspace · ${workspaceName}`
    : VISIBILITY_LABELS[value];
}

function embedSnippetFor(embedUrl: string): string {
  return `<iframe src="${embedUrl}" width="640" height="360" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
}

type Copied = "link" | "embed";

export type ShareVisibilityModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  visibility: Visibility;
  onChange: (next: Visibility) => void;
  canEdit?: boolean;
  // Null when the resource has no workspace (legacy anonymous uploads); the
  // Workspace option is then hidden unless it is already the current value.
  workspaceName?: string | null;
  allowPublic?: boolean;
  pending?: boolean;
  error?: string | null;
  shareUrl?: string;
  embedUrl?: string;
  // Sampled when the dialog opens, for a link that starts at that moment.
  getCurrentMs?: () => number;
};

export function ShareVisibilityModal({
  open,
  onClose,
  title,
  visibility,
  onChange,
  canEdit = true,
  workspaceName,
  allowPublic = true,
  pending = false,
  error,
  shareUrl,
  embedUrl,
  getCurrentMs,
}: ShareVisibilityModalProps) {
  const [copied, setCopied] = useState<Copied | null>(null);
  const [embedOpen, setEmbedOpen] = useState(false);
  const [atMs, setAtMs] = useState(0);
  const [shareAtTime, setShareAtTime] = useState(false);
  const shareAtId = useId();

  useEffect(() => {
    if (!open) return;
    setAtMs(getCurrentMs ? getCurrentMs() : 0);
    setShareAtTime(false);
    setEmbedOpen(false);
    setCopied(null);
  }, [open, getCurrentMs]);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(null), 1500);
    return () => clearTimeout(t);
  }, [copied]);

  const copy = (kind: Copied, text: string) => {
    if (typeof window === "undefined") return;
    void navigator.clipboard
      .writeText(text)
      .then(() => setCopied(kind))
      .catch(() => setCopied(null));
  };

  const canShareAt = !!shareUrl && atMs >= 1000;
  const linkToShare =
    shareUrl && shareAtTime && canShareAt
      ? shareUrlAt(shareUrl, atMs / 1000)
      : shareUrl;
  const embedSnippet = embedUrl ? embedSnippetFor(embedUrl) : null;

  const renderPublic = allowPublic || visibility === "public";
  const renderWorkspace = !!workspaceName || visibility === "workspace";
  const options = [
    renderPublic ? "public" : null,
    renderWorkspace ? "workspace" : null,
    "private",
  ].filter(Boolean) as Visibility[];

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-5">
          {embedSnippet ? (
            <div>
              <Button
                size="sm"
                variant={embedOpen ? "default" : "secondary"}
                onClick={() => setEmbedOpen((v) => !v)}
                aria-pressed={embedOpen}
              >
                <Code2 size={14} />
                Embed
              </Button>
              {embedOpen ? (
                <div className="mt-3 rounded-xl border border-black/[0.15] bg-panel-2 p-3 dark:border-white/[0.16]">
                  <pre className="overflow-x-auto font-mono text-xs leading-relaxed break-all whitespace-pre-wrap text-fg">
                    {embedSnippet}
                  </pre>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <p className="text-xs text-fg-muted">
                      {visibility === "public"
                        ? "Plays wherever the snippet is pasted."
                        : "Plays only for people who can already open the link."}
                    </p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copy("embed", embedSnippet)}
                    >
                      {copied === "embed" ? (
                        <Check size={14} />
                      ) : (
                        <Copy size={14} />
                      )}
                      {copied === "embed" ? "Copied" : "Copy code"}
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          <section>
            <p className="text-sm font-semibold text-fg">General access</p>
            <div className="mt-3 flex items-center gap-3">
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                  visibility === "public"
                    ? "bg-primary/15 text-accent-strong"
                    : "bg-tint text-fg-muted",
                )}
              >
                <VisibilityIcon value={visibility} />
              </span>
              <div className="min-w-0 flex-1">
                {canEdit ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      disabled={pending}
                      aria-label={`General access: ${optionLabel(visibility, workspaceName)}`}
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "sm" }),
                        "-ml-3 gap-1",
                      )}
                    >
                      {optionLabel(visibility, workspaceName)}
                      <ChevronDown size={14} className="text-fg-muted" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      side="bottom"
                      align="start"
                      aria-label="General access"
                      className="w-auto min-w-72"
                    >
                      {options.map((value) => (
                        <DropdownMenuItem
                          key={value}
                          textValue={VISIBILITY_LABELS[value]}
                          onSelect={() => onChange(value)}
                        >
                          <span className="flex w-full items-center gap-3">
                            <span className="text-fg-muted">
                              <VisibilityIcon value={value} />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm text-fg">
                                {optionLabel(value, workspaceName)}
                              </span>
                              <span className="block text-xs text-fg-muted">
                                {VISIBILITY_DESCRIPTIONS[value]}
                              </span>
                            </span>
                            {value === visibility ? (
                              <Check size={14} className="text-accent-strong" />
                            ) : null}
                          </span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <p className="text-sm font-medium text-fg">
                    {optionLabel(visibility, workspaceName)}
                  </p>
                )}
                <p className="text-xs text-fg-muted">
                  {VISIBILITY_DESCRIPTIONS[visibility]}
                </p>
              </div>
            </div>
            {error && (
              <Alert variant="destructive" className="mt-3">
                <AlertTitle>{error}</AlertTitle>
              </Alert>
            )}
          </section>
        </div>
        <DialogFooter className="flex-row flex-wrap items-center gap-3">
          {shareUrl && linkToShare ? (
            <Button
              variant="secondary"
              onClick={() => copy("link", linkToShare)}
            >
              {copied === "link" ? <Check size={16} /> : <Link2 size={16} />}
              {copied === "link" ? "Link copied" : "Copy link"}
            </Button>
          ) : null}
          {canShareAt ? (
            <div className="flex items-center gap-2">
              <Checkbox
                id={shareAtId}
                checked={shareAtTime}
                onCheckedChange={(next) => setShareAtTime(next === true)}
              />
              <Label
                htmlFor={shareAtId}
                className="text-sm font-normal text-fg"
              >
                Share at {formatTimestamp(atMs)}
              </Label>
            </div>
          ) : null}
          <Button className="ml-auto" onClick={onClose}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
