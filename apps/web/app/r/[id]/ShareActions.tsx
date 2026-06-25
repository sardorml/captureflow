"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Globe,
  Link2,
  Lock,
  MoreHorizontal,
  Pencil,
  Trash2,
  Users,
} from "lucide-react";
import {
  Alert,
  Button,
  Dropdown,
  Modal,
  Radio,
  Space,
  Tooltip,
  type MenuProps,
  type RadioChangeEvent,
} from "antd";
import type { ShareVisibility } from "@/lib/share/types";

type Props = {
  slug: string;
  shareUrl: string;
  editUrl: string;
  initialVisibility: ShareVisibility;
  isOwner: boolean;
  // Null when the share has no workspace (legacy anonymous uploads).
  workspaceName: string | null;
  allowPublicLinks: boolean;
  signedIn: boolean;
};

const VISIBILITY_LABELS: Record<ShareVisibility, string> = {
  public: "Public",
  workspace: "Workspace",
  private: "Private",
};

const VISIBILITY_DESCRIPTIONS: Record<ShareVisibility, string> = {
  public: "Anyone with the link can view",
  workspace: "Only signed-in workspace members can view",
  private: "Only you can view",
};

function VisibilityIcon({ value }: { value: ShareVisibility }) {
  const Icon =
    value === "public" ? Globe : value === "workspace" ? Users : Lock;
  return <Icon className="h-4 w-4" />;
}

export function ShareActions({
  slug,
  shareUrl,
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
    useState<ShareVisibility>(initialVisibility);
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
      .writeText(shareUrl)
      .then(() => setCopied(true))
      .catch(() => setCopied(false));
  };

  const changeVisibility = (next: ShareVisibility) => {
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
      "Delete this share permanently? The video and link will stop working immediately.",
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
          err instanceof Error ? err.message : "Could not delete the share",
        );
      }
    });
  };

  const showWorkspace = !!workspaceName;
  // Keep the option visible when the row is already public (uploaded before the
  // workspace flipped allow_public_links off) so the selection stays shown.
  const renderPublic = allowPublicLinks || visibility === "public";
  const renderWorkspace = showWorkspace || visibility === "workspace";

  const visibilityOptions = (
    [
      renderPublic ? "public" : null,
      renderWorkspace ? "workspace" : null,
      "private",
    ].filter(Boolean) as ShareVisibility[]
  ).map((value) => ({
    value,
    label: (
      <div className="flex items-start gap-3 py-1">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-overlay text-fg-muted">
          <VisibilityIcon value={value} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium text-fg">
            {value === "workspace" && workspaceName
              ? `Workspace · ${workspaceName}`
              : VISIBILITY_LABELS[value]}
          </span>
          <span className="block text-xs text-fg-muted">
            {VISIBILITY_DESCRIPTIONS[value]}
          </span>
        </span>
      </div>
    ),
  }));

  const moreItems: MenuProps["items"] = [
    {
      key: "delete",
      danger: true,
      disabled: deleting,
      icon: <Trash2 size={16} />,
      label: deleting ? "Deleting…" : "Delete share",
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

      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        title="Share recording"
        width={448}
        footer={
          <div className="flex items-center justify-between">
            <Button
              type="text"
              onClick={copyLink}
              icon={copied ? <Check size={16} /> : <Link2 size={16} />}
            >
              {copied ? "Link copied" : "Copy link"}
            </Button>
            <Button onClick={() => setOpen(false)}>Done</Button>
          </div>
        }
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-fg-muted">
          General access
        </p>
        <div className="mt-2">
          {isOwner ? (
            <Radio.Group
              value={visibility}
              onChange={(e: RadioChangeEvent) =>
                changeVisibility(e.target.value as ShareVisibility)
              }
              disabled={pending}
              options={visibilityOptions}
              style={{ display: "flex", flexDirection: "column", gap: 4 }}
            />
          ) : (
            <div className="flex items-center gap-3 rounded-lg border border-line-strong bg-canvas-2 px-3 py-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-overlay text-fg-muted">
                <VisibilityIcon value={visibility} />
              </span>
              <div>
                <p className="text-sm font-medium text-fg">
                  {VISIBILITY_LABELS[visibility]}
                </p>
                <p className="text-xs text-fg-muted">
                  {VISIBILITY_DESCRIPTIONS[visibility]}
                </p>
              </div>
            </div>
          )}
        </div>
        {error && (
          <Alert type="error" message={error} showIcon className="mt-3" />
        )}
      </Modal>
    </>
  );
}
