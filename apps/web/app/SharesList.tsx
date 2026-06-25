"use client";

import Link from "next/link";
import {
  initials,
  formatBytes,
  formatDuration,
  formatRelativeShort as formatRelative,
} from "@/lib/format";
import { useState, useTransition } from "react";
import type React from "react";
import {
  Check,
  ChevronDown,
  ExternalLink,
  Eye,
  Film,
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
  Empty,
  Flex,
  Input,
  Space,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import type { MenuProps } from "antd";
import type { DashboardShareRow, ShareVisibility } from "@/lib/shares-db";
import { viewUrlFor } from "@/lib/site";
import {
  deleteShareAction,
  renameShareAction,
  setVisibilityAction,
} from "./actions";
import { VisibilityDialog } from "./VisibilityDialog";

const CDN_BASE_URL =
  process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL ?? "https://cdn.captureflow.xyz";

type SharesListProps = {
  shares: DashboardShareRow[];
  viewerUserId?: string;
  viewerIsWorkspaceOwner?: boolean;
  allowPublicLinks?: boolean;
  ownerNames?: Record<string, string>;
  ownerImages?: Record<string, string>;
};

export function SharesList({
  shares,
  viewerUserId,
  viewerIsWorkspaceOwner,
  allowPublicLinks = true,
  ownerNames,
  ownerImages,
}: SharesListProps) {
  if (shares.length === 0) {
    return (
      <Card style={{ marginTop: 24 }}>
        <Empty
          description="You haven't created any share links yet. Record in the CaptureFlow desktop app and your shares will show up here."
        />
      </Card>
    );
  }
  return (
    <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {shares.map((s) => {
        const isAuthor = !viewerUserId || s.userId === viewerUserId;
        const isAdmin = !isAuthor && Boolean(viewerIsWorkspaceOwner);
        const authorName = ownerNames?.[s.userId] ?? null;
        const authorImage = ownerImages?.[s.userId] ?? null;
        return (
          <ShareCard
            key={s.slug}
            share={s}
            canAuthor={isAuthor}
            canAdminister={isAdmin}
            allowPublicLinks={allowPublicLinks}
            authorName={authorName}
            authorImage={authorImage}
          />
        );
      })}
    </div>
  );
}

type ShareCardProps = {
  share: DashboardShareRow;
  canAuthor: boolean;
  canAdminister: boolean;
  allowPublicLinks: boolean;
  authorName?: string | null;
  authorImage?: string | null;
};

function ShareCard({
  share,
  canAuthor,
  canAdminister,
  allowPublicLinks,
  authorName,
  authorImage,
}: ShareCardProps) {
  const canManage = canAuthor || canAdminister;
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(share.title ?? "");
  const [visibility, setVisibility] = useState<ShareVisibility>(
    share.visibility,
  );
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const shareUrl = viewUrlFor(share.slug);
  const posterUrl = share.posterKey
    ? `${CDN_BASE_URL}/${share.posterKey}`
    : null;
  const videoThumbUrl =
    share.state === "ready" && !posterUrl
      ? `${CDN_BASE_URL}/${share.storageKey}?v=${share.sizeBytes}`
      : null;

  const onRename = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      const res = await renameShareAction({ error: null, slug: null }, form);
      if (res.error) {
        setError(res.error);
        return;
      }
      setEditing(false);
    });
  };

  const onChangeVisibility = (next: ShareVisibility) => {
    if (next === visibility) return;
    const previous = visibility;
    setVisibility(next);
    setError(null);
    startTransition(async () => {
      const res = await setVisibilityAction(share.slug, next);
      if (res.error) {
        setVisibility(previous);
        setError(res.error);
      }
    });
  };

  const onDelete = () => {
    const ok = confirm(
      `Delete this share permanently? The video and link will stop working immediately.`,
    );
    if (!ok) return;
    setError(null);
    startTransition(async () => {
      const res = await deleteShareAction(share.slug);
      if (res.error) setError(res.error);
    });
  };

  const onCopyLink = () => {
    if (typeof window === "undefined") return;
    void navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => setCopied(false));
  };

  const displayTitle = share.title?.trim() || "Untitled share";
  const authorLabel = authorName ?? "Unknown";

  const menuItems: MenuProps["items"] = [
    {
      key: "open",
      icon: <ExternalLink size={16} />,
      label: "Open share",
    },
    ...(canAuthor
      ? [{ key: "rename", icon: <Pencil size={16} />, label: "Rename" }]
      : []),
    { type: "divider" as const },
    {
      key: "delete",
      icon: <Trash2 size={16} />,
      label: "Delete share",
      danger: true,
      disabled: pending,
    },
  ];

  const onMenuClick: MenuProps["onClick"] = ({ key }) => {
    if (key === "open") window.open(shareUrl, "_blank", "noreferrer");
    else if (key === "rename") setEditing(true);
    else if (key === "delete") onDelete();
  };

  const cover = (
    <Link
      aria-label={canAuthor ? "Edit share" : "Open share"}
      href={shareUrl}
      target="_blank"
      rel="noreferrer"
      style={{
        position: "relative",
        display: "block",
        aspectRatio: "16 / 9",
        overflow: "hidden",
      }}
    >
      {posterUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt=""
          style={{ height: "100%", width: "100%", objectFit: "cover" }}
          decoding="async"
          loading="lazy"
          src={posterUrl}
        />
      ) : videoThumbUrl ? (
        <video
          style={{
            height: "100%",
            width: "100%",
            objectFit: "cover",
            pointerEvents: "none",
          }}
          src={videoThumbUrl}
          preload="metadata"
          muted
          playsInline
        />
      ) : (
        <Flex
          align="center"
          justify="center"
          style={{ height: "100%", width: "100%" }}
          className="text-fg-subtle"
        >
          <Film size={24} />
        </Flex>
      )}
      {share.durationMs != null && (
        <Tag
          style={{
            position: "absolute",
            right: 8,
            bottom: 8,
            margin: 0,
            background: "rgba(0,0,0,0.75)",
            color: "#fff",
            border: "none",
          }}
        >
          {formatDuration(share.durationMs)}
        </Tag>
      )}
      {share.state !== "ready" && (
        <Tag
          color="warning"
          style={{ position: "absolute", left: 8, top: 8, margin: 0 }}
        >
          {share.state}
        </Tag>
      )}

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
            onClick={onCopyLink}
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
    <Card cover={cover} styles={{ body: { padding: 16 } }}>
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
                {formatRelative(share.createdAt)}
              </Typography.Text>
            </Space>
            <div>
              {canManage ? (
                <VisibilityDialog
                  value={visibility}
                  disabled={pending}
                  onChange={onChangeVisibility}
                  allowPublic={allowPublicLinks}
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
          <form onSubmit={onRename}>
            <input type="hidden" name="slug" value={share.slug} />
            <Space.Compact style={{ width: "100%" }}>
              <Input
                autoFocus
                maxLength={200}
                name="title"
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Untitled share"
                value={title}
              />
              <Button htmlType="submit" type="primary" loading={pending}>
                Save
              </Button>
              <Button
                onClick={() => {
                  setEditing(false);
                  setTitle(share.title ?? "");
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
          style={{ paddingTop: 12, borderTop: "1px solid var(--ant-color-split, rgba(128,128,128,0.2))" }}
        >
          <Space size={16}>
            <Typography.Text type="secondary">
              <Space size={6}>
                <Eye size={16} />
                {share.viewCount}
              </Space>
            </Typography.Text>
            <Typography.Text type="secondary">
              <Space size={6}>
                <MessageSquare size={16} />
                {share.commentCount}
              </Space>
            </Typography.Text>
            <Typography.Text type="secondary">
              <Space size={6}>
                <Smile size={16} />
                {share.reactionCount}
              </Space>
            </Typography.Text>
          </Space>
          <Space size={12}>
            <Typography.Text type="secondary" style={{ whiteSpace: "nowrap" }}>
              {formatBytes(share.sizeBytes)}
            </Typography.Text>
            {canAuthor && (
              <Tooltip title="Edit recording">
                <Link href={`/shares/${share.slug}/edit`} aria-label="Edit recording">
                  <Button type="text" size="small" icon={<Pencil size={16} />} />
                </Link>
              </Tooltip>
            )}
          </Space>
        </Flex>

        {error && (
          <Typography.Text type="danger" style={{ fontSize: 12 }}>
            {error}
          </Typography.Text>
        )}
      </Space>
    </Card>
  );
}

function visibilityLabel(v: ShareVisibility): string {
  if (v === "public") return "Public";
  if (v === "workspace") return "Workspace";
  return "Private";
}

function VisibilityText({
  visibility,
  interactive,
}: {
  visibility: ShareVisibility;
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
