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
  Flex,
  Modal,
  Radio,
  Space,
  Tooltip,
  Typography,
  type MenuProps,
} from "antd";

type SnapVisibility = "public" | "workspace" | "private";

type Props = {
  snapId: string;
  snapUrl: string;
  editUrl: string;
  initialVisibility: SnapVisibility;
  isOwner: boolean;
  workspaceName: string | null;
  allowPublicLinks: boolean;
  signedIn: boolean;
};

const VISIBILITY_LABELS: Record<SnapVisibility, string> = {
  public: "Public",
  workspace: "Workspace",
  private: "Private",
};

const VISIBILITY_DESCRIPTIONS: Record<SnapVisibility, string> = {
  public: "Anyone with the link can view",
  workspace: "Only signed-in workspace members can view",
  private: "Only you can view",
};

const VISIBILITY_ICONS: Record<SnapVisibility, typeof Globe> = {
  public: Globe,
  workspace: Users,
  private: Lock,
};

export function SnapActions({
  snapId,
  snapUrl,
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
    useState<SnapVisibility>(initialVisibility);
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
      .writeText(snapUrl)
      .then(() => setCopied(true))
      .catch(() => setCopied(false));
  };

  const changeVisibility = (next: SnapVisibility) => {
    if (next === visibility || !isOwner) return;
    const previous = visibility;
    setVisibility(next);
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch(
          `/api/s/snaps/${encodeURIComponent(snapId)}/visibility`,
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
      "Delete this snap permanently? The image and link will stop working immediately.",
    );
    if (!ok) return;
    setError(null);
    startDelete(async () => {
      try {
        const res = await fetch(`/api/s/snaps/${encodeURIComponent(snapId)}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        router.replace("/");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Could not delete the snap",
        );
      }
    });
  };

  const renderPublic = allowPublicLinks || visibility === "public";
  const renderWorkspace = !!workspaceName || visibility === "workspace";

  const options: SnapVisibility[] = [
    ...(renderPublic ? (["public"] as const) : []),
    ...(renderWorkspace ? (["workspace"] as const) : []),
    "private",
  ];

  const moreItems: MenuProps["items"] = [
    {
      key: "delete",
      icon: <Trash2 size={16} />,
      danger: true,
      disabled: deleting,
      label: deleting ? "Deleting…" : "Delete snap",
      onClick: onDelete,
    },
  ];

  return (
    <>
      <Flex align="center" gap={8}>
        {isOwner && (
          <Button icon={<Pencil size={16} />} href={editUrl}>
            Edit snap
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

      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        title="Share snap"
        width={480}
        footer={
          <Flex align="center" justify="space-between">
            <Button
              type="text"
              icon={copied ? <Check size={16} /> : <Link2 size={16} />}
              onClick={copyLink}
            >
              {copied ? "Link copied" : "Copy link"}
            </Button>
            <Button onClick={() => setOpen(false)}>Done</Button>
          </Flex>
        }
      >
        <Typography.Text
          type="secondary"
          style={{
            fontSize: 11,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          General access
        </Typography.Text>
        {isOwner ? (
          <Radio.Group
            value={visibility}
            disabled={pending}
            onChange={(e) => changeVisibility(e.target.value as SnapVisibility)}
            style={{ display: "block", marginTop: 12, width: "100%" }}
          >
            <Space direction="vertical" size={8} style={{ width: "100%" }}>
              {options.map((option) => (
                <Radio key={option} value={option} style={{ width: "100%" }}>
                  <VisibilityLabel
                    value={option}
                    workspaceName={workspaceName}
                  />
                </Radio>
              ))}
            </Space>
          </Radio.Group>
        ) : (
          <div style={{ marginTop: 12 }}>
            <VisibilityLabel value={visibility} workspaceName={workspaceName} />
          </div>
        )}
        {error && (
          <Alert
            type="error"
            message={error}
            showIcon
            style={{ marginTop: 12 }}
          />
        )}
      </Modal>
    </>
  );
}

function VisibilityLabel({
  value,
  workspaceName,
}: {
  value: SnapVisibility;
  workspaceName: string | null;
}) {
  const Icon = VISIBILITY_ICONS[value];
  const label =
    value === "workspace" && workspaceName
      ? `Workspace · ${workspaceName}`
      : VISIBILITY_LABELS[value];
  return (
    <Space align="start" size={8}>
      <Icon size={18} />
      <span>
        <Typography.Text strong>{label}</Typography.Text>
        <br />
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          {VISIBILITY_DESCRIPTIONS[value]}
        </Typography.Text>
      </span>
    </Space>
  );
}
