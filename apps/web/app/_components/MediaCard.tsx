"use client";

import Link from "next/link";
import { useState, useTransition, type FormEvent, type ReactNode } from "react";
import {
  Check,
  ChevronDown,
  ExternalLink,
  Eye,
  Link2,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Smile,
  Trash2,
} from "lucide-react";
import {
  Avatar,
  Button,
  Card,
  Dropdown,
  Flex,
  Input,
  Space,
  theme,
  Tooltip,
  Typography,
} from "antd";
import type { MenuProps } from "antd";
import {
  initials,
  formatBytes,
  formatRelativeShort as formatRelative,
} from "@/lib/format";
import { VisibilityDialog, type Visibility } from "@/app/VisibilityDialog";

type ActionResult = { error: string | null } | void;

export type MediaCardStats = {
  views: number;
  comments: number;
  reactions: number;
};

export type MediaCardProps = {
  noun: string;
  media: ReactNode;
  viewUrl: string;
  editUrl: string;
  displayTitle: string;
  initialTitle: string;
  titlePlaceholder: string;
  authorLabel: string;
  authorImage?: string | null;
  createdAt: number;
  visibility: Visibility;
  workspaceName?: string | null;
  allowPublicLinks: boolean;
  canAuthor: boolean;
  canManage: boolean;
  stats: MediaCardStats;
  sizeBytes: number;
  deleteConfirm: string;
  onRename: (title: string) => Promise<ActionResult>;
  onDelete: () => Promise<ActionResult>;
  onChangeVisibility: (next: Visibility) => Promise<ActionResult>;
};

export function MediaCard({
  noun,
  media,
  viewUrl,
  editUrl,
  displayTitle,
  initialTitle,
  titlePlaceholder,
  authorLabel,
  authorImage,
  createdAt,
  visibility: initialVisibility,
  workspaceName,
  allowPublicLinks,
  canAuthor,
  canManage,
  stats,
  sizeBytes,
  deleteConfirm,
  onRename,
  onDelete,
  onChangeVisibility,
}: MediaCardProps) {
  const { token } = theme.useToken();
  const [hovered, setHovered] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [visibility, setVisibility] = useState<Visibility>(initialVisibility);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const copyLink = () => {
    if (typeof window === "undefined") return;
    void navigator.clipboard
      .writeText(viewUrl)
      .then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => setCopied(false));
  };

  const submitRename = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await onRename(title);
      if (res?.error) {
        setError(res.error);
        return;
      }
      setEditing(false);
    });
  };

  const remove = () => {
    if (!confirm(deleteConfirm)) return;
    setError(null);
    startTransition(async () => {
      const res = await onDelete();
      if (res?.error) setError(res.error);
    });
  };

  const changeVisibility = (next: Visibility) => {
    if (next === visibility) return;
    const previous = visibility;
    setVisibility(next);
    setError(null);
    startTransition(async () => {
      const res = await onChangeVisibility(next);
      if (res?.error) {
        setVisibility(previous);
        setError(res.error);
      }
    });
  };

  const menuItems: MenuProps["items"] = [
    { key: "open", icon: <ExternalLink size={16} />, label: `Open ${noun}` },
    ...(canAuthor
      ? [{ key: "rename", icon: <Pencil size={16} />, label: "Rename" }]
      : []),
    { type: "divider" as const },
    {
      key: "delete",
      icon: <Trash2 size={16} />,
      label: `Delete ${noun}`,
      danger: true,
      disabled: pending,
    },
  ];

  const onMenuClick: MenuProps["onClick"] = ({ key }) => {
    if (key === "open") window.open(viewUrl, "_blank", "noreferrer");
    else if (key === "rename") setEditing(true);
    else if (key === "delete") remove();
  };

  const cover = (
    <Link
      aria-label={canAuthor ? `Edit ${noun}` : `Open ${noun}`}
      href={viewUrl}
      style={{
        position: "relative",
        display: "block",
        aspectRatio: "16 / 9",
        overflow: "hidden",
      }}
    >
      {media}

      {/* Eats clicks so the underlying Link doesn't fire. */}
      <div
        style={{
          position: "absolute",
          right: 8,
          top: 8,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <Tooltip title={copied ? "Link copied" : "Copy link"}>
          <Button
            size="small"
            type={copied ? "primary" : "default"}
            aria-label={copied ? "Link copied" : "Copy link"}
            icon={copied ? <Check size={16} /> : <Link2 size={16} />}
            onClick={copyLink}
          />
        </Tooltip>
        {canManage && (
          <Dropdown
            menu={{ items: menuItems, onClick: onMenuClick }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <Button
              size="small"
              aria-label="More actions"
              icon={<MoreHorizontal size={16} />}
            />
          </Dropdown>
        )}
      </div>
    </Link>
  );

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Card
        cover={cover}
        styles={{ body: { padding: 16 } }}
        style={{
          overflow: "hidden",
          transition: "border-color 0.2s, box-shadow 0.2s",
          borderColor: hovered ? token.colorPrimary : undefined,
          boxShadow: hovered ? `0 0 0 1px ${token.colorPrimary}` : undefined,
        }}
      >
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <Flex align="center" gap={10} style={{ minWidth: 0 }}>
            <Avatar size={28} src={authorImage || undefined}>
              {initials(authorLabel)}
            </Avatar>
            <div style={{ minWidth: 0, lineHeight: 1.2 }}>
              <Space size={6} style={{ fontSize: 14 }}>
                <Typography.Text strong ellipsis>
                  {authorLabel}
                </Typography.Text>
                <Typography.Text type="secondary">·</Typography.Text>
                <Typography.Text type="secondary">
                  <span suppressHydrationWarning>
                    {formatRelative(createdAt)}
                  </span>
                </Typography.Text>
              </Space>
              <div>
                {canManage ? (
                  <VisibilityDialog
                    value={visibility}
                    disabled={pending}
                    onChange={changeVisibility}
                    allowPublic={allowPublicLinks}
                    workspaceName={workspaceName}
                    title={`Share ${noun}`}
                    shareUrl={viewUrl}
                    trigger={
                      <VisibilityText visibility={visibility} interactive />
                    }
                  />
                ) : (
                  <VisibilityText visibility={visibility} />
                )}
              </div>
            </div>
          </Flex>

          {editing ? (
            <form onSubmit={submitRename}>
              <Space.Compact style={{ width: "100%" }}>
                <Input
                  autoFocus
                  maxLength={200}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={titlePlaceholder}
                  value={title}
                />
                <Button htmlType="submit" type="primary" loading={pending}>
                  Save
                </Button>
                <Button
                  onClick={() => {
                    setEditing(false);
                    setTitle(initialTitle);
                    setError(null);
                  }}
                >
                  Cancel
                </Button>
              </Space.Compact>
            </form>
          ) : (
            <Typography.Paragraph
              strong
              ellipsis={{ rows: 2, tooltip: displayTitle }}
              style={{ margin: 0, fontSize: 15 }}
            >
              {displayTitle}
            </Typography.Paragraph>
          )}

          <Flex
            align="center"
            justify="space-between"
            style={{
              paddingTop: 12,
              borderTop:
                "1px solid var(--ant-color-split, rgba(128,128,128,0.2))",
            }}
          >
            <Flex align="center" gap={10}>
              <Stat
                icon={<Eye size={16} color={token.colorTextSecondary} />}
                value={stats.views}
              />
              <Stat
                icon={
                  <MessageSquare size={16} color={token.colorTextSecondary} />
                }
                value={stats.comments}
              />
              <Stat
                icon={<Smile size={16} color={token.colorTextSecondary} />}
                value={stats.reactions}
              />
            </Flex>
            <Flex align="center" gap={12}>
              <Typography.Text
                type="secondary"
                style={{ whiteSpace: "nowrap" }}
              >
                {formatBytes(sizeBytes)}
              </Typography.Text>
              {canAuthor && (
                <Tooltip title={`Edit ${noun}`}>
                  <Link
                    href={editUrl}
                    aria-label={`Edit ${noun}`}
                    style={{ display: "inline-flex" }}
                  >
                    <Button
                      type="text"
                      size="small"
                      icon={<Pencil size={16} />}
                    />
                  </Link>
                </Tooltip>
              )}
            </Flex>
          </Flex>

          {error && (
            <Typography.Text type="danger" style={{ fontSize: 12 }}>
              {error}
            </Typography.Text>
          )}
        </Space>
      </Card>
    </div>
  );
}

function Stat({ icon, value }: { icon: ReactNode; value: number }) {
  return (
    <Flex align="center" gap={4}>
      {icon}
      <Typography.Text type="secondary">{value}</Typography.Text>
    </Flex>
  );
}

function visibilityLabel(v: Visibility): string {
  if (v === "public") return "Public";
  if (v === "workspace") return "Workspace";
  return "Private";
}

function VisibilityText({
  visibility,
  interactive,
}: {
  visibility: Visibility;
  interactive?: boolean;
}) {
  if (!interactive) {
    return (
      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
        {visibilityLabel(visibility)}
      </Typography.Text>
    );
  }
  return (
    <Typography.Link style={{ fontSize: 12 }}>
      <Space size={2}>
        {visibilityLabel(visibility)}
        <ChevronDown size={12} />
      </Space>
    </Typography.Link>
  );
}
