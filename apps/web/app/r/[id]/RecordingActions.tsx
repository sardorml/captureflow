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
import { Button, Dropdown, Space, Tooltip, type MenuProps } from "antd";
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

  const moreItems: MenuProps["items"] = [
    {
      key: "delete",
      danger: true,
      disabled: deleting,
      icon: <Trash2 size={16} />,
      label: deleting ? "Deleting…" : "Delete recording",
      onClick: onDelete,
    },
  ];

  return (
    <>
      <Space size={8}>
        {isOwner && (
          <Button href={editUrl} icon={<Pencil size={16} />}>
            <span className="hidden sm:inline">Edit recording</span>
          </Button>
        )}
        {signedIn ? (
          <Space.Compact>
            <Button
              type="primary"
              onClick={() => setOpen(true)}
              icon={<Users size={18} />}
            >
              <span className="hidden sm:inline">Share</span>
            </Button>
            <Tooltip title={copied ? "Link copied" : "Copy link"}>
              <Button
                type="primary"
                onClick={copyLink}
                aria-label={copied ? "Link copied" : "Copy link"}
                icon={copied ? <Check size={18} /> : <Link2 size={18} />}
              />
            </Tooltip>
          </Space.Compact>
        ) : (
          <Button
            onClick={copyLink}
            aria-label={copied ? "Link copied" : "Copy link"}
            icon={copied ? <Check size={16} /> : <Link2 size={16} />}
          >
            <span className="hidden sm:inline">
              {copied ? "Copied" : "Copy link"}
            </span>
          </Button>
        )}

        {isOwner && (
          <Dropdown
            menu={{ items: moreItems }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <Button
              type="text"
              aria-label="More actions"
              icon={<MoreHorizontal size={18} />}
            />
          </Dropdown>
        )}
      </Space>

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
