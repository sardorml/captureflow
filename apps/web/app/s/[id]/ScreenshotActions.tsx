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
import { Button, Dropdown, Flex, Space, Tooltip, type MenuProps } from "antd";
import {
  ShareVisibilityModal,
  type Visibility,
} from "@/app/_components/ShareVisibilityModal";

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

  const moreItems: MenuProps["items"] = [
    {
      key: "delete",
      icon: <Trash2 size={16} />,
      danger: true,
      disabled: deleting,
      label: deleting ? "Deleting…" : "Delete screenshot",
      onClick: onDelete,
    },
  ];

  return (
    <>
      <Flex align="center" gap={8}>
        {isOwner && (
          <Button icon={<Pencil size={16} />} href={editUrl}>
            Edit screenshot
          </Button>
        )}
        {signedIn ? (
          <Space.Compact>
            <Button
              type="primary"
              icon={<Users size={18} />}
              onClick={() => setOpen(true)}
            >
              Share
            </Button>
            <Tooltip title={copied ? "Link copied" : "Copy link"}>
              <Button
                type="primary"
                aria-label={copied ? "Link copied" : "Copy link"}
                icon={copied ? <Check size={18} /> : <Link2 size={18} />}
                onClick={copyLink}
              />
            </Tooltip>
          </Space.Compact>
        ) : (
          <Button
            icon={copied ? <Check size={16} /> : <Link2 size={16} />}
            onClick={copyLink}
          >
            {copied ? "Copied" : "Copy link"}
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
      </Flex>

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
