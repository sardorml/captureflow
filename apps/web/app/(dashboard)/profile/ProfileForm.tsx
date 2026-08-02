"use client";

import {
  useEffect,
  useRef,
  useState,
  useTransition,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import { Check, Copy } from "lucide-react";
import {
  Avatar,
  Button,
  Description,
  FieldError,
  Form,
  Input,
  InputGroup,
  Label,
  Spinner,
  TextField,
  Typography,
} from "@heroui/react";
import { authClient } from "@/lib/auth-client";
import { removeUserAvatarAction, uploadUserAvatarAction } from "./actions";

type Props = {
  userId: string;
  initialName: string;
  email: string;
  imageUrl: string | null;
};

// Mirrors AVATAR_MAX_BYTES and the accepted types in ./actions.
const AVATAR_HINT = "JPG, PNG, WebP or GIF. 2 MB max.";
const AVATAR_ACCEPT = "image/png,image/jpeg,image/webp,image/gif";

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
  for (let i = 0; i < seed.length; i++)
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  return AVATAR_HUES[Math.abs(hash) % AVATAR_HUES.length];
}

export function ProfileForm({ userId, initialName, email, imageUrl }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <AvatarField
        userId={userId}
        name={initialName}
        email={email}
        imageUrl={imageUrl}
      />
      <AccountFields userId={userId} initialName={initialName} email={email} />
    </div>
  );
}

function AvatarField({
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
  const fileRef = useRef<HTMLInputElement>(null);
  const busy = uploading || removePending;

  const onPick = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
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
        if (fileRef.current) fileRef.current.value = "";
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
    <div>
      <Typography type="body-sm" weight="medium" className="mb-2 block">
        Avatar
      </Typography>
      <input
        ref={fileRef}
        type="file"
        accept={AVATAR_ACCEPT}
        className="hidden"
        onChange={onPick}
      />
      {/* The picker is a labelled button beside the avatar rather than a
          hover-only overlay on it, which gave no affordance until moused. */}
      <div className="flex items-center gap-4">
        <Avatar
          className="h-14 w-14 shrink-0"
          style={
            imageUrl ? undefined : { backgroundColor: avatarColor(userId) }
          }
        >
          {imageUrl && <Avatar.Image src={imageUrl} alt={name || email} />}
          <Avatar.Fallback>{initials(name, email)}</Avatar.Fallback>
        </Avatar>
        <div className="flex min-w-0 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="tertiary"
              size="sm"
              isDisabled={busy}
              onPress={() => fileRef.current?.click()}
            >
              {uploading ? "Uploading…" : "Change avatar"}
            </Button>
            {imageUrl && !uploading && (
              <Button
                variant="ghost"
                size="sm"
                onPress={onRemove}
                isDisabled={busy}
              >
                {removePending ? "Removing…" : "Remove"}
              </Button>
            )}
          </div>
          {error ? (
            <span className="text-danger text-xs">{error}</span>
          ) : (
            <Typography type="body-xs" color="muted">
              {AVATAR_HINT}
            </Typography>
          )}
        </div>
      </div>
    </div>
  );
}

function AccountFields({
  userId,
  initialName,
  email,
}: {
  userId: string;
  initialName: string;
  email: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (savedAt == null) return;
    const id = window.setTimeout(() => setSavedAt(null), 2000);
    return () => window.clearTimeout(id);
  }, [savedAt]);

  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 1500);
    return () => window.clearTimeout(id);
  }, [copied]);

  const dirty = name.trim() !== initialName.trim();

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
    <Form onSubmit={onSubmit} className="flex flex-col gap-4">
      {/* Name and email pair up on one row; the id spans both since it is long
          enough to wrap in half the width. */}
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          name="name"
          isInvalid={Boolean(error)}
          fullWidth
          value={name}
          onChange={(next) => {
            setName(next);
            if (error) setError(null);
          }}
        >
          <Label>Full name</Label>
          <Input placeholder="Your name" autoComplete="name" />
          {error ? (
            <FieldError>{error}</FieldError>
          ) : (
            <Description>
              Shown on recordings, screenshots, and activity rows.
            </Description>
          )}
        </TextField>

        <TextField name="email" fullWidth value={email} isReadOnly>
          <Label>Email address</Label>
          <Input type="email" readOnly />
          <Description>Used to sign in. Contact support to change.</Description>
        </TextField>
      </div>

      <TextField name="userId" fullWidth value={userId} isReadOnly>
        <Label>User ID</Label>
        <InputGroup>
          <InputGroup.Input readOnly />
          <InputGroup.Suffix>
            <Button
              variant="ghost"
              size="sm"
              isIconOnly
              aria-label={copied ? "Copied" : "Copy user ID"}
              onPress={() => {
                void navigator.clipboard
                  ?.writeText(userId)
                  .then(() => setCopied(true));
              }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </Button>
          </InputGroup.Suffix>
        </InputGroup>
        <Description>Quote this when contacting support.</Description>
      </TextField>

      <div className="flex items-center gap-3">
        <Button variant="primary" type="submit" isDisabled={!dirty || pending}>
          {pending && <Spinner size="sm" color="current" />}
          {pending ? "Saving…" : "Save changes"}
        </Button>
        {savedAt && (
          <span className="text-success inline-flex items-center gap-1">
            <Check className="h-3.5 w-3.5" /> Saved
          </span>
        )}
      </div>
    </Form>
  );
}
