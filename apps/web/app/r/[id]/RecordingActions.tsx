"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@/components/ui/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Check,
  Link2,
  MoreHorizontal,
  Pencil,
  Trash2,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { ShareVisibilityModal } from "@/app/_components/ShareVisibilityModal";
import { useConfirm } from "@/app/_components/confirm-dialog";
import type { RecordingVisibility } from "@/lib/recording/types";
import { currentPlayerMs } from "./player-clock";

type Props = {
  slug: string;
  recordingUrl: string;
  embedUrl: string;
  editUrl: string;
  initialVisibility: RecordingVisibility;
  isOwner: boolean;
  // Null when the recording has no workspace (legacy anonymous uploads).
  workspaceName: string | null;
  allowPublicLinks: boolean;
  signedIn: boolean;
};

export function RecordingActions({
  slug,
  recordingUrl,
  embedUrl,
  editUrl,
  initialVisibility,
  isOwner,
  workspaceName,
  allowPublicLinks,
  signedIn,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [visibility, setVisibility] =
    useState<RecordingVisibility>(initialVisibility);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [deleting, startDelete] = useTransition();
  const { confirm, dialog } = useConfirm();

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);

  const copyLink = () => {
    if (typeof window === "undefined") return;
    void navigator.clipboard
      .writeText(recordingUrl)
      .then(() => setCopied(true))
      .catch(() => setCopied(false));
  };

  const changeVisibility = (next: RecordingVisibility) => {
    if (next === visibility || !isOwner) return;
    const previous = visibility;
    setVisibility(next);
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch(
          `/api/r/visibility?slug=${encodeURIComponent(slug)}`,
          {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ value: next }),
          },
        );
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
      } catch (err) {
        setVisibility(previous);
        setError(
          err instanceof Error ? err.message : "Could not update visibility",
        );
      }
    });
  };

  const onDelete = async () => {
    if (!isOwner) return;
    const ok = await confirm({
      title: "Delete this recording?",
      description:
        "The video and its link stop working immediately. This cannot be undone.",
      confirmLabel: "Delete",
      destructive: true,
    });
    if (!ok) return;
    setError(null);
    startDelete(async () => {
      try {
        const res = await fetch(`/api/r/${encodeURIComponent(slug)}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        router.replace("/");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Could not delete the recording",
        );
      }
    });
  };

  return (
    <>
      {dialog}
      <div className="flex items-center gap-2">
        {isOwner && (
          <a
            href={editUrl}
            className={buttonVariants({ variant: "secondary" })}
          >
            <Pencil size={16} />
            <span className="hidden sm:inline">Edit recording</span>
          </a>
        )}
        {signedIn ? (
          <ButtonGroup>
            <Button onClick={() => setOpen(true)}>
              <Users size={18} />
              <span className="hidden sm:inline">Share</span>
            </Button>
            <ButtonGroupSeparator />
            <Button
              size="icon"
              onClick={copyLink}
              aria-label={copied ? "Link copied" : "Copy link"}
            >
              {copied ? <Check size={18} /> : <Link2 size={18} />}
            </Button>
          </ButtonGroup>
        ) : (
          <Button
            variant="secondary"
            onClick={copyLink}
            aria-label={copied ? "Link copied" : "Copy link"}
          >
            {copied ? <Check size={16} /> : <Link2 size={16} />}
            <span className="hidden sm:inline">
              {copied ? "Copied" : "Copy link"}
            </span>
          </Button>
        )}

        {isOwner && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="More actions">
                <MoreHorizontal size={18} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                variant="destructive"
                disabled={deleting}
                onSelect={onDelete}
              >
                <Trash2 size={16} />
                {deleting ? "Deleting…" : "Delete recording"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <ShareVisibilityModal
        open={open}
        onClose={() => setOpen(false)}
        title="Share recording"
        visibility={visibility}
        onChange={changeVisibility}
        canEdit={isOwner}
        workspaceName={workspaceName}
        allowPublic={allowPublicLinks}
        pending={pending}
        error={error}
        shareUrl={recordingUrl}
        embedUrl={embedUrl}
        getCurrentMs={currentPlayerMs}
      />
    </>
  );
}
