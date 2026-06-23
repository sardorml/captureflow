'use client';

import {
  useActionState,
  useEffect,
  useRef,
  useState,
  useTransition,
} from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Check } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { Avatar, AvatarFallback, AvatarImage, SmoothButton } from '@captureflow/ui';
import { removeUserAvatarAction, uploadUserAvatarAction } from './actions';

type Props = {
  userId: string;
  initialName: string;
  email: string;
  imageUrl: string | null;
};

type FormState = { error: string | null; ok: string | null };
const AVATAR_INITIAL: FormState = { error: null, ok: null };

function initials(name: string, email: string): string {
  const source = name.trim() || email;
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
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
          <p className="truncate text-sm font-medium text-fg">{displayName}</p>
          <p className="truncate text-xs text-fg-muted">{email}</p>
        </div>
      </div>
      <div className="my-6 h-px bg-overlay" />
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
  const fileRef = useRef<HTMLInputElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const [state, formAction, uploading] = useActionState(
    uploadUserAvatarAction,
    AVATAR_INITIAL
  );
  const [removePending, startRemove] = useTransition();
  const busy = uploading || removePending;

  const submitOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) formRef.current?.requestSubmit();
  };

  const onRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (busy || !imageUrl) return;
    startRemove(async () => {
      await removeUserAvatarAction();
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <form ref={formRef} action={formAction}>
        <input
          ref={fileRef}
          type="file"
          name="avatar"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="hidden"
          onChange={submitOnChange}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          aria-label={imageUrl ? 'Change avatar' : 'Upload avatar'}
          title={imageUrl ? 'Change avatar' : 'Upload avatar'}
          className="group relative block rounded-full outline-none focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-2 focus-visible:ring-offset-canvas-2 disabled:cursor-progress"
        >
          <Avatar className="h-14 w-14">
            {imageUrl ? <AvatarImage src={imageUrl} alt="" /> : null}
            <AvatarFallback className="text-base" seed={userId}>
              {initials(name, email)}
            </AvatarFallback>
          </Avatar>
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
          >
            <Camera className="h-5 w-5" />
          </span>
        </button>
      </form>
      <div className="flex items-center gap-2 text-xs">
        {uploading && <span className="text-fg-muted">Uploading…</span>}
        {!uploading && imageUrl && (
          <button
            type="button"
            onClick={onRemove}
            disabled={busy}
            className="text-fg-muted transition-colors hover:text-danger disabled:opacity-50"
          >
            {removePending ? 'Removing…' : 'Remove'}
          </button>
        )}
        {state.error && <span className="text-danger">{state.error}</span>}
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

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = name.trim();
    if (!next) {
      setError('Name is required.');
      return;
    }
    if (next === initialName.trim()) return;
    setError(null);
    startTransition(async () => {
      try {
        const res = await authClient.updateUser({ name: next });
        const apiError = (res as { error?: { message?: string } }).error;
        if (apiError) {
          setError(apiError.message ?? 'Could not update name.');
          return;
        }
        setSavedAt(Date.now());
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not update name.');
      }
    });
  };

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-end"
    >
      <div className="space-y-4">
        <div>
          <label
            htmlFor="profile-name"
            className="block text-sm font-medium text-fg"
          >
            Display name
          </label>
          <p className="mt-1 text-xs text-fg-muted">
            Shown on shares, snaps, and activity rows.
          </p>
          <input
            id="profile-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            autoComplete="name"
            className="mt-2 w-full max-w-md rounded-md border border-line-strong bg-canvas-2 px-3 py-2 text-sm text-fg placeholder:text-fg-subtle focus:border-accent-ring focus:outline-none focus:ring-1 focus:ring-accent-ring"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-fg">Email</label>
          <p className="mt-1 text-xs text-fg-muted">
            Used to sign in. Contact support to change.
          </p>
          <input
            type="email"
            value={email}
            readOnly
            className="mt-2 w-full max-w-md cursor-not-allowed rounded-md border border-line bg-overlay px-3 py-2 text-sm text-fg-muted"
          />
        </div>
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
      <div className="flex items-center gap-3">
        {savedAt && (
          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-300">
            <Check className="h-3.5 w-3.5" />
            Saved
          </span>
        )}
        <SmoothButton type="submit" disabled={!dirty || pending}>
          {pending ? 'Saving…' : 'Save'}
        </SmoothButton>
      </div>
    </form>
  );
}
