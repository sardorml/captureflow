"use client";

import { useEffect, useState } from "react";
import { Check, Globe, Link2, Lock, Users } from "lucide-react";
import { Alert, Button, Modal, Radio, type RadioChangeEvent } from "antd";

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

function VisibilityTile({
  value,
  workspaceName,
}: {
  value: Visibility;
  workspaceName?: string | null;
}) {
  return (
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
  );
}

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
}: ShareVisibilityModalProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);

  const copyLink = () => {
    if (typeof window === "undefined" || !shareUrl) return;
    void navigator.clipboard
      .writeText(shareUrl)
      .then(() => setCopied(true))
      .catch(() => setCopied(false));
  };

  const renderPublic = allowPublic || visibility === "public";
  const renderWorkspace = !!workspaceName || visibility === "workspace";
  const options = (
    [
      renderPublic ? "public" : null,
      renderWorkspace ? "workspace" : null,
      "private",
    ].filter(Boolean) as Visibility[]
  ).map((value) => ({
    value,
    label: <VisibilityTile value={value} workspaceName={workspaceName} />,
  }));

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={title}
      width={448}
      footer={
        <div className="flex items-center justify-between">
          {shareUrl ? (
            <Button
              type="text"
              onClick={copyLink}
              icon={copied ? <Check size={16} /> : <Link2 size={16} />}
            >
              {copied ? "Link copied" : "Copy link"}
            </Button>
          ) : (
            <span />
          )}
          <Button onClick={onClose}>Done</Button>
        </div>
      }
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-fg-muted">
        General access
      </p>
      <div className="mt-2">
        {canEdit ? (
          <Radio.Group
            value={visibility}
            onChange={(e: RadioChangeEvent) =>
              onChange(e.target.value as Visibility)
            }
            disabled={pending}
            options={options}
            style={{ display: "flex", flexDirection: "column", gap: 4 }}
          />
        ) : (
          <div className="rounded-lg border border-line-strong bg-canvas-2 px-3 py-2">
            <VisibilityTile value={visibility} workspaceName={workspaceName} />
          </div>
        )}
      </div>
      {error && (
        <Alert type="error" message={error} showIcon className="mt-3" />
      )}
    </Modal>
  );
}
