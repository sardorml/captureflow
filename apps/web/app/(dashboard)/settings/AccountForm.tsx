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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";
import {
  removeUserAvatarAction,
  uploadUserAvatarAction,
} from "./account-actions";

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

export function AccountForm({ userId, initialName, email, imageUrl }: Props) {
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
      <p className="mb-2 block text-sm leading-6 font-medium text-foreground">
        Avatar
      </p>
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
          className="h-14 w-14 shrink-0 rounded-full"
          style={
            imageUrl ? undefined : { backgroundColor: avatarColor(userId) }
          }
        >
          {imageUrl && <AvatarImage src={imageUrl} alt={name || email} />}
          <AvatarFallback>{initials(name, email)}</AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={busy}
              onClick={() => fileRef.current?.click()}
            >
              {uploading ? "Uploading…" : "Change avatar"}
            </Button>
            {imageUrl && !uploading && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRemove}
                disabled={busy}
              >
                {removePending ? "Removing…" : "Remove"}
              </Button>
            )}
          </div>
          {error ? (
            <span className="text-destructive text-xs">{error}</span>
          ) : (
            <p className="text-xs leading-5 text-muted-foreground">
              {AVATAR_HINT}
            </p>
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
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {/* Name and email pair up on one row; the id spans both since it is long
          enough to wrap in half the width. */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field data-invalid={Boolean(error) || undefined}>
          <FieldLabel htmlFor="account-name">Full name</FieldLabel>
          <Input
            id="account-name"
            name="name"
            placeholder="Your name"
            autoComplete="name"
            aria-invalid={Boolean(error) || undefined}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError(null);
            }}
          />
          {error ? (
            <FieldError>{error}</FieldError>
          ) : (
            <FieldDescription>
              Shown on recordings, screenshots, and activity rows.
            </FieldDescription>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="account-email">Email address</FieldLabel>
          <Input
            id="account-email"
            name="email"
            type="email"
            value={email}
            readOnly
          />
          <FieldDescription>
            Used to sign in. Contact support to change.
          </FieldDescription>
        </Field>
      </div>

      <Field>
        <FieldLabel htmlFor="account-user-id">User ID</FieldLabel>
        <InputGroup>
          <InputGroupInput
            id="account-user-id"
            name="userId"
            value={userId}
            readOnly
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              size="icon-sm"
              aria-label={copied ? "Copied" : "Copy user ID"}
              onClick={() => {
                void navigator.clipboard
                  ?.writeText(userId)
                  .then(() => setCopied(true));
              }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        <FieldDescription>Quote this when contacting support.</FieldDescription>
      </Field>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={!dirty || pending}>
          {pending && <Spinner />}
          {pending ? "Saving…" : "Save changes"}
        </Button>
        {savedAt && (
          <span className="text-emerald-500 inline-flex items-center gap-1">
            <Check className="h-3.5 w-3.5" /> Saved
          </span>
        )}
      </div>
    </form>
  );
}
