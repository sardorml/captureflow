"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Link2,
  MoreHorizontal,
  Pencil,
  Trash2,
  Users,
} from "lucide-react";
import { Button, ButtonGroup, Dropdown, buttonVariants } from "@heroui/react";
import {
  ShareVisibilityModal,
  type Visibility,
} from "@/app/_components/ShareVisibilityModal";
import { cn } from "@/lib/utils";

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
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [visibility, setVisibility] = useState<Visibility>(initialVisibility);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [deleting, startDelete] = useTransition();

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
        setError(
          err instanceof Error ? err.message : "Could not update visibility",
        );
      }
    });
  };

  const onDelete = () => {
    if (!isOwner) return;
    const ok = confirm(
      "Delete this screenshot permanently? The image and link will stop working immediately.",
    );
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
        setError(
          err instanceof Error
            ? err.message
            : "Could not delete the screenshot",
        );
      }
    });
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {isOwner && (
          /* See RecordingActions: filled pills need the extra 8px to sit as far
             apart as the padded icon buttons later in the row look. */
          <a
            href={editUrl}
            className={cn(buttonVariants({ variant: "secondary" }), "me-2")}
          >
            <Pencil size={16} />
            Edit screenshot
          </a>
        )}
        {signedIn ? (
          <ButtonGroup>
            <Button variant="primary" onPress={() => setOpen(true)}>
              <Users size={18} />
              Share
            </Button>
            {/* See RecordingActions: a Tooltip.Trigger wrapper breaks
                ButtonGroup's first/last-child radii. */}
            <Button
              variant="primary"
              isIconOnly
              aria-label={copied ? "Link copied" : "Copy link"}
              onPress={copyLink}
            >
              <ButtonGroup.Separator />
              {copied ? <Check size={18} /> : <Link2 size={18} />}
            </Button>
          </ButtonGroup>
        ) : (
          <Button variant="secondary" onPress={copyLink}>
            {copied ? <Check size={16} /> : <Link2 size={16} />}
            {copied ? "Copied" : "Copy link"}
          </Button>
        )}

        {isOwner && (
          <Dropdown>
            <Dropdown.Trigger
              aria-label="More actions"
              className={buttonVariants({
                variant: "ghost",
                size: "sm",
                isIconOnly: true,
              })}
            >
              <MoreHorizontal size={18} />
            </Dropdown.Trigger>
            <Dropdown.Popover placement="bottom end">
              <Dropdown.Menu>
                <Dropdown.Item
                  isDisabled={deleting}
                  onAction={onDelete}
                  className="text-danger"
                >
                  <Trash2 size={16} />
                  {deleting ? "Deleting…" : "Delete screenshot"}
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
        )}
      </div>

      <ShareVisibilityModal
        open={open}
        onClose={() => setOpen(false)}
        title="Share screenshot"
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
