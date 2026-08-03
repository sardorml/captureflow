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
import type { RecordingVisibility } from "@/lib/recording/types";
import { ShareVisibilityModal } from "@/app/_components/ShareVisibilityModal";

type Props = {
  slug: string;
  recordingUrl: string;
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

  const onDelete = () => {
    if (!isOwner) return;
    const ok = confirm(
      "Delete this recording permanently? The video and link will stop working immediately.",
    );
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
            <Button variant="primary" onPress={() => setOpen(true)}>
              <Users size={18} />
              <span className="hidden sm:inline">Share</span>
            </Button>
            {/* No Tooltip here: its Trigger renders a wrapping div, and
                ButtonGroup's radii key off :first-child/:last-child, so a
                wrapped button rounds on all sides and collides with Share. The
                aria-label plus the icon swap already convey the state. */}
            <Button
              variant="primary"
              isIconOnly
              onPress={copyLink}
              aria-label={copied ? "Link copied" : "Copy link"}
            >
              {/* Absolutely positioned against this button, so it draws the
                  hairline between the two halves of the split control. */}
              <ButtonGroup.Separator />
              {copied ? <Check size={18} /> : <Link2 size={18} />}
            </Button>
          </ButtonGroup>
        ) : (
          <Button
            variant="secondary"
            onPress={copyLink}
            aria-label={copied ? "Link copied" : "Copy link"}
          >
            {copied ? <Check size={16} /> : <Link2 size={16} />}
            <span className="hidden sm:inline">
              {copied ? "Copied" : "Copy link"}
            </span>
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
                  {deleting ? "Deleting…" : "Delete recording"}
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
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
      />
    </>
  );
}
