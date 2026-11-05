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
import {
  ShareVisibilityModal,
  type Visibility,
} from "@/app/_components/ShareVisibilityModal";
import { useConfirm } from "@/app/_components/confirm-dialog";
import { useAppMessages } from "@/components/app-i18n-provider";

type Props = {
  screenshotId: string;
  screenshotUrl: string;
  editUrl: string;
  initialVisibility: Visibility;
  isOwner: boolean;
  workspaceName: string | null;
  allowPublicLinks: boolean;
  signedIn: boolean;
};

export function ScreenshotActions({
  screenshotId,
  screenshotUrl,
  editUrl,
  initialVisibility,
  isOwner,
  workspaceName,
  allowPublicLinks,
  signedIn,
}: Props) {
  const router = useRouter();
  const m = useAppMessages();
  const copy = m.screenshotView.actions;
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [visibility, setVisibility] = useState<Visibility>(initialVisibility);
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
      .writeText(screenshotUrl)
      .then(() => setCopied(true))
      .catch(() => setCopied(false));
  };

  const changeVisibility = (next: Visibility) => {
    if (next === visibility || !isOwner) return;
    const previous = visibility;
    setVisibility(next);
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch(
          `/api/s/${encodeURIComponent(screenshotId)}/visibility`,
          {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ value: next }),
          },
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      } catch (err) {
        setVisibility(previous);
        setError(err instanceof Error ? err.message : copy.visibilityFailed);
      }
    });
  };

  const onDelete = async () => {
    if (!isOwner) return;
    const ok = await confirm({
      title: copy.deleteTitle,
      description: copy.deleteDescription,
      confirmLabel: m.common.delete,
      destructive: true,
    });
    if (!ok) return;
    setError(null);
    startDelete(async () => {
      try {
        const res = await fetch(`/api/s/${encodeURIComponent(screenshotId)}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        router.replace("/");
      } catch (err) {
        setError(err instanceof Error ? err.message : copy.deleteFailed);
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
            {copy.edit}
          </a>
        )}
        {signedIn ? (
          <ButtonGroup>
            <Button onClick={() => setOpen(true)}>
              <Users size={18} />
              {copy.share}
            </Button>
            <ButtonGroupSeparator />
            <Button
              size="icon"
              aria-label={copied ? copy.linkCopied : copy.copyLink}
              onClick={copyLink}
            >
              {copied ? <Check size={18} /> : <Link2 size={18} />}
            </Button>
          </ButtonGroup>
        ) : (
          <Button
            variant="secondary"
            aria-label={copied ? copy.linkCopied : copy.copyLink}
            onClick={copyLink}
          >
            {copied ? <Check size={16} /> : <Link2 size={16} />}
            <span className="max-sm:hidden">
              {copied ? m.common.copied : copy.copyLink}
            </span>
          </Button>
        )}

        {isOwner && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={copy.more}>
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
                {deleting ? m.common.deleting : copy.delete}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <ShareVisibilityModal
        open={open}
        onClose={() => setOpen(false)}
        title={copy.shareTitle}
        visibility={visibility}
        onChange={changeVisibility}
        canEdit={isOwner}
        workspaceName={workspaceName}
        allowPublic={allowPublicLinks}
        pending={pending}
        error={error}
        shareUrl={screenshotUrl}
      />
    </>
  );
}
