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
import { useAppMessages } from "@/components/app-i18n-provider";
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
  const m = useAppMessages();
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
          err instanceof Error
            ? err.message
            : m.viewer.actions.visibilityFailed,
        );
      }
    });
  };

  const onDelete = async () => {
    if (!isOwner) return;
    const ok = await confirm({
      title: m.library.recording.deleteTitle,
      description: m.library.recording.deleteDescription,
      confirmLabel: m.common.delete,
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
          err instanceof Error ? err.message : m.viewer.actions.deleteFailed,
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
            <span className="hidden sm:inline">{m.library.recording.edit}</span>
          </a>
        )}
        {signedIn ? (
          <ButtonGroup>
            <Button onClick={() => setOpen(true)}>
              <Users size={18} />
              <span className="hidden sm:inline">{m.viewer.actions.share}</span>
            </Button>
            <ButtonGroupSeparator />
            <Button
              size="icon"
              onClick={copyLink}
              aria-label={
                copied ? m.library.share.linkCopied : m.library.share.copyLink
              }
            >
              {copied ? <Check size={18} /> : <Link2 size={18} />}
            </Button>
          </ButtonGroup>
        ) : (
          <Button
            variant="secondary"
            onClick={copyLink}
            aria-label={
              copied ? m.library.share.linkCopied : m.library.share.copyLink
            }
          >
            {copied ? <Check size={16} /> : <Link2 size={16} />}
            <span className="hidden sm:inline">
              {copied ? m.common.copied : m.library.share.copyLink}
            </span>
          </Button>
        )}

        {isOwner && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={m.library.card.moreActions}
              >
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
                {deleting ? m.common.deleting : m.library.recording.delete}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <ShareVisibilityModal
        open={open}
        onClose={() => setOpen(false)}
        title={m.library.recording.share}
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
