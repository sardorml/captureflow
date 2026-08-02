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
import { Camera, Check } from "lucide-react";
import {
  Avatar,
  Button,
  Description,
  FieldError,
  Form,
  Input,
  Label,
  Separator,
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
  const displayName = initialName.trim() || email;
  return (
    <div>
      <div className="flex items-center gap-4">
        <AvatarUploader
          userId={userId}
          name={initialName}
          email={email}
          imageUrl={imageUrl}
        />
        <div className="min-w-0">
          <Typography weight="semibold" truncate className="block">
            {displayName}
          </Typography>
          <Typography type="body-xs" color="muted" truncate>
            {email}
          </Typography>
        </div>
      </div>
      <Separator className="my-6" />
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
    <div className="flex flex-col items-start gap-1">
      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={onPick}
      />
      <button
        type="button"
        disabled={busy}
        aria-label={imageUrl ? "Change avatar" : "Upload avatar"}
        onClick={() => fileRef.current?.click()}
        className="group relative block rounded-full border-0 bg-transparent p-0 outline-none disabled:cursor-progress"
      >
        <Avatar
          className="h-14 w-14"
          style={
            imageUrl ? undefined : { backgroundColor: avatarColor(userId) }
          }
        >
          {imageUrl && <Avatar.Image src={imageUrl} alt={name || email} />}
          <Avatar.Fallback>{initials(name, email)}</Avatar.Fallback>
        </Avatar>
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
        >
          <Camera className="h-5 w-5" />
        </span>
      </button>
      <div className="flex items-center gap-2 text-xs">
        {uploading && <Typography color="muted">Uploading…</Typography>}
        {!uploading && imageUrl && (
          <Button
            variant="ghost"
            size="sm"
            onPress={onRemove}
            isDisabled={busy}
            className="h-auto p-0 text-accent underline-offset-4 hover:underline"
          >
            {removePending ? "Removing…" : "Remove"}
          </Button>
        )}
        {error && <span className="text-danger">{error}</span>}
      </div>
    </div>
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
    <Form onSubmit={onSubmit} className="flex max-w-md flex-col gap-4">
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
        <Label>Display name</Label>
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
        <Label>Email</Label>
        <Input type="email" readOnly />
        <Description>Used to sign in. Contact support to change.</Description>
      </TextField>

      <div className="flex items-center gap-3">
        <Button variant="primary" type="submit" isDisabled={!dirty || pending}>
          {pending && <Spinner size="sm" color="current" />}
          {pending ? "Saving…" : "Save"}
        </Button>
        {savedAt && (
          <span className="inline-flex items-center gap-1 text-success">
            <Check className="h-3.5 w-3.5" /> Saved
          </span>
        )}
      </div>
    </Form>
  );
}
