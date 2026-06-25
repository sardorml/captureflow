"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Camera, Check } from "lucide-react";
import {
  Avatar,
  Button,
  Divider,
  Flex,
  Form,
  Input,
  Typography,
  Upload,
} from "antd";
import type { UploadProps } from "antd";
import { authClient } from "@/lib/auth-client";
import { removeUserAvatarAction, uploadUserAvatarAction } from "./actions";

type Props = {
  userId: string;
  initialName: string;
  email: string;
  imageUrl: string | null;
};

function initials(name: string, email: string): string {
  const source = name.trim() || email;
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Stable fallback hue per user, so the avatar color doesn't shuffle on rerender.
const AVATAR_HUES = ["#1677ff", "#52c41a", "#722ed1", "#eb2f96", "#fa8c16"];
function avatarColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  return AVATAR_HUES[Math.abs(hash) % AVATAR_HUES.length];
}

export function ProfileForm({ userId, initialName, email, imageUrl }: Props) {
  const displayName = initialName.trim() || email;
  return (
    <div>
      <Flex align="center" gap={16}>
        <AvatarUploader
          userId={userId}
          name={initialName}
          email={email}
          imageUrl={imageUrl}
        />
        <div style={{ minWidth: 0 }}>
          <Typography.Text strong ellipsis style={{ display: "block" }}>
            {displayName}
          </Typography.Text>
          <Typography.Text type="secondary" ellipsis style={{ fontSize: 12 }}>
            {email}
          </Typography.Text>
        </div>
      </Flex>
      <Divider />
      <NameRow initialName={initialName} email={email} />
    </div>
  );
}

function AvatarUploader({
  userId,
  name,
  email,
  imageUrl,
}: {
  userId: string;
  name: string;
  email: string;
  imageUrl: string | null;
}) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [removePending, startRemove] = useTransition();
  const busy = uploading || removePending;

  const beforeUpload: UploadProps["beforeUpload"] = (file) => {
    setError(null);
    setUploading(true);
    startUpload(file);
    return false; // handled manually via the server action
  };

  const startUpload = (file: File) => {
    void (async () => {
      try {
        const fd = new FormData();
        fd.set("avatar", file);
        const res = await uploadUserAvatarAction({ error: null, ok: null }, fd);
        if (res.error) setError(res.error);
        else router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    })();
  };

  const onRemove = () => {
    if (busy || !imageUrl) return;
    startRemove(async () => {
      await removeUserAvatarAction();
      router.refresh();
    });
  };

  return (
    <Flex vertical align="flex-start" gap={4}>
      <Upload
        accept="image/png,image/jpeg,image/webp,image/gif"
        showUploadList={false}
        beforeUpload={beforeUpload}
        disabled={busy}
      >
        <button
          type="button"
          disabled={busy}
          aria-label={imageUrl ? "Change avatar" : "Upload avatar"}
          title={imageUrl ? "Change avatar" : "Upload avatar"}
          className="group relative block rounded-full border-0 bg-transparent p-0 outline-none disabled:cursor-progress"
        >
          <Avatar
            size={56}
            src={imageUrl ?? undefined}
            style={imageUrl ? undefined : { backgroundColor: avatarColor(userId) }}
          >
            {initials(name, email)}
          </Avatar>
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
          >
            <Camera className="h-5 w-5" />
          </span>
        </button>
      </Upload>
      <Flex align="center" gap={8} style={{ fontSize: 12 }}>
        {uploading && <Typography.Text type="secondary">Uploading…</Typography.Text>}
        {!uploading && imageUrl && (
          <Button type="link" size="small" onClick={onRemove} disabled={busy} style={{ padding: 0 }}>
            {removePending ? "Removing…" : "Remove"}
          </Button>
        )}
        {error && <Typography.Text type="danger">{error}</Typography.Text>}
      </Flex>
    </Flex>
  );
}

function NameRow({
  initialName,
  email,
}: {
  initialName: string;
  email: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (savedAt == null) return;
    const id = window.setTimeout(() => setSavedAt(null), 2000);
    return () => window.clearTimeout(id);
  }, [savedAt]);

  const dirty = name.trim() !== initialName.trim();

  const onSubmit = () => {
    const next = name.trim();
    if (!next) {
      setError("Name is required.");
      return;
    }
    if (next === initialName.trim()) return;
    setError(null);
    startTransition(async () => {
      try {
        const res = await authClient.updateUser({ name: next });
        const apiError = (res as { error?: { message?: string } }).error;
        if (apiError) {
          setError(apiError.message ?? "Could not update name.");
          return;
        }
        setSavedAt(Date.now());
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not update name.");
      }
    });
  };

  return (
    <Form layout="vertical" onFinish={onSubmit} style={{ maxWidth: 448 }}>
      <Form.Item
        label="Display name"
        validateStatus={error ? "error" : undefined}
        help={error ?? undefined}
        extra="Shown on shares, snaps, and activity rows."
      >
        <Input
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError(null);
          }}
          placeholder="Your name"
          autoComplete="name"
        />
      </Form.Item>
      <Form.Item label="Email" help="Used to sign in. Contact support to change.">
        <Input type="email" value={email} readOnly />
      </Form.Item>
      <Flex align="center" gap={12}>
        <Button type="primary" htmlType="submit" loading={pending} disabled={!dirty}>
          {pending ? "Saving…" : "Save"}
        </Button>
        {savedAt && (
          <Typography.Text type="success">
            <Check className="inline h-3.5 w-3.5" /> Saved
          </Typography.Text>
        )}
      </Flex>
    </Form>
  );
}
