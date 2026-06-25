"use client";

import Image from "next/image";
import {
  initials,
  formatBytes,
  formatRelativeShort as formatRelative,
} from "@/lib/format";
import Link from "next/link";
import { useState, useTransition, type FormEvent } from "react";
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
  Empty,
  Flex,
  Input,
  Space,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import type { MenuProps } from "antd";
import type { DashboardSnapRow, SnapVisibility } from "@/lib/snaps-db";
import { snapViewUrlFor } from "@/lib/site";
import {
  deleteSnapAction,
  renameSnapAction,
  setSnapVisibilityAction,
} from "../../actions";
import { VisibilityDialog } from "../../VisibilityDialog";

const R2_BASE =
  process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL ?? "https://cdn.captureflow.xyz";

// R2 is served with long cache headers, so cache-bust by tagging the URL with
// the freshest mutation timestamp; otherwise overwrites serve stale bytes.
function publicSnapImageUrl(snap: DashboardSnapRow): string {
  const v = snap.editedAt ?? snap.updatedAt ?? snap.createdAt;
  return `${R2_BASE}/${snap.storageKey}?v=${v}`;
}

function publicSnapViewUrl(id: string): string {
  return snapViewUrlFor(id);
}

type SnapsGridProps = {
  snaps: DashboardSnapRow[];
  viewerUserId?: string;
  viewerIsWorkspaceOwner?: boolean;
  allowPublicLinks?: boolean;
  ownerNames?: Record<string, string>;
  ownerImages?: Record<string, string>;
};

export function SnapsGrid({
  snaps,
  viewerUserId,
  viewerIsWorkspaceOwner,
  allowPublicLinks = true,
  ownerNames,
  ownerImages,
}: SnapsGridProps) {
  if (snaps.length === 0) {
    return (
      <Card style={{ marginTop: 24 }}>
        <Empty
          description={
            <span>
              No snaps yet. Open CaptureFlow → Screenshot tab → pick a Display,
              Window, or Area to capture. Your snap appears here automatically.
            </span>
          }
        />
      </Card>
    );
  }
  return (
    <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {snaps.map((snap) => {
        const isAuthor = !viewerUserId || snap.userId === viewerUserId;
        const isAdmin = !isAuthor && Boolean(viewerIsWorkspaceOwner);
        const authorName = ownerNames?.[snap.userId] ?? null;
        const authorImage = ownerImages?.[snap.userId] ?? null;
        return (
          <SnapCard
            key={snap.id}
            snap={snap}
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

function SnapCard({
  snap,
  canAuthor,
  canAdminister,
  allowPublicLinks,
  authorName,
  authorImage,
}: {
  snap: DashboardSnapRow;
  canAuthor: boolean;
  canAdminister: boolean;
  allowPublicLinks: boolean;
  authorName?: string | null;
  authorImage?: string | null;
}) {
  const canManage = canAuthor || canAdminister;
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [renaming, startRenameTransition] = useTransition();
  const [title, setTitle] = useState(snap.title ?? "");
  const [renameError, setRenameError] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<SnapVisibility>(snap.visibility);
  const [visibilityError, setVisibilityError] = useState<string | null>(null);
  const viewUrl = publicSnapViewUrl(snap.id);
  const imageUrl = publicSnapImageUrl(snap);
  const displayTitle = snap.title?.trim() || `Snap ${snap.id}`;
  const authorLabel = authorName ?? "Unknown";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(viewUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable; the visible link remains the fallback.
    }
  };

  const remove = () => {
    if (!confirm("Delete this snap? The public link will stop working."))
      return;
    startTransition(async () => {
      await deleteSnapAction(snap.id);
    });
  };

  const onRename = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const next = title.trim();
    setRenameError(null);
    startRenameTransition(async () => {
      const res = await renameSnapAction(snap.id, next);
      if (res.error) {
        setRenameError(res.error);
        return;
      }
      setEditing(false);
    });
  };

  const onChangeVisibility = (next: SnapVisibility) => {
    if (next === visibility) return;
    const previous = visibility;
    setVisibility(next);
    setVisibilityError(null);
    startTransition(async () => {
      const res = await setSnapVisibilityAction(snap.id, next);
      if (res.error) {
        setVisibility(previous);
        setVisibilityError(res.error);
      }
    });
  };

  const menuItems: MenuProps["items"] = [
    { key: "open", icon: <ExternalLink size={16} />, label: "Open snap" },
    ...(canAuthor
      ? [{ key: "rename", icon: <Pencil size={16} />, label: "Rename" }]
      : []),
    { type: "divider" as const },
    {
      key: "delete",
      icon: <Trash2 size={16} />,
      label: "Delete snap",
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
      href={viewUrl}
      target="_blank"
      rel="noreferrer"
      style={{
        position: "relative",
        display: "block",
        aspectRatio: "16 / 9",
        overflow: "hidden",
      }}
    >
      <Image
        src={imageUrl}
        alt={displayTitle}
        width={snap.width}
        height={snap.height}
        unoptimized
        style={{ height: "100%", width: "100%", objectFit: "cover" }}
      />
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
        {snap.width}×{snap.height}
      </Tag>

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
            onClick={copy}
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
                <span suppressHydrationWarning>
                  {formatRelative(snap.createdAt)}
                </span>
              </Typography.Text>
            </Space>
            <div>
              {canManage ? (
                <VisibilityDialog
                  value={visibility}
                  disabled={pending}
                  allowPublic={allowPublicLinks}
                  onChange={onChangeVisibility}
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
            <Space.Compact style={{ width: "100%" }}>
              <Input
                autoFocus
                maxLength={200}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Untitled snap"
                value={title}
              />
              <Button htmlType="submit" type="primary" loading={renaming}>
                Save
              </Button>
              <Button
                onClick={() => {
                  setEditing(false);
                  setTitle(snap.title ?? "");
                  setRenameError(null);
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

        {renameError && (
          <Typography.Text type="danger" style={{ fontSize: 12 }}>
            {renameError}
          </Typography.Text>
        )}
        {visibilityError && (
          <Typography.Text type="danger" style={{ fontSize: 12 }}>
            {visibilityError}
          </Typography.Text>
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
                {snap.viewCount}
              </Space>
            </Typography.Text>
            <Typography.Text type="secondary">
              <Space size={6}>
                <MessageSquare size={16} />0
              </Space>
            </Typography.Text>
            <Typography.Text type="secondary">
              <Space size={6}>
                <Smile size={16} />0
              </Space>
            </Typography.Text>
          </Space>
          <Space size={12}>
            <Typography.Text type="secondary" style={{ whiteSpace: "nowrap" }}>
              {formatBytes(snap.sizeBytes)}
            </Typography.Text>
            {canAuthor && (
              <Tooltip title="Edit snap">
                <Link href={`/snaps/${snap.id}/edit`} aria-label="Edit snap">
                  <Button type="text" size="small" icon={<Pencil size={16} />} />
                </Link>
              </Tooltip>
            )}
          </Space>
        </Flex>
      </Space>
    </Card>
  );
}

function visibilityLabel(v: SnapVisibility): string {
  if (v === "public") return "Public";
  if (v === "workspace") return "Workspace";
  return "Private";
}

function VisibilityText({
  visibility,
  interactive,
}: {
  visibility: SnapVisibility;
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
