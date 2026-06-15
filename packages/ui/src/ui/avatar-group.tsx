'use client';

import * as React from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/cn';

// Overlapping circle stack (workspace members + dashed "+" slots) —
// the smoothui "animated avatar group" pattern. Each circle stagger-
// fades in from the right; hovering nudges the stack to splay. Pair
// with a trigger slot so the trailing "+" placeholder can open an
// invite modal without the caller composing portals manually.

export type AvatarGroupItem = {
  // Stable key so the motion stagger keeps identity across re-orders.
  key: string;
  // First-initial fallback when no image is available.
  initials: string;
  // Pre-resolved display name for the tooltip / aria-label. Email if
  // the user hasn't set a name.
  label: string;
  // Optional avatar URL from better-auth `users.image`. When present,
  // the circle renders the image and the tone/initials become the
  // load-fail fallback (rendered behind the image).
  image?: string | null;
  // Optional explicit color override; defaults to a deterministic
  // palette pick based on the initials so the same user lights the
  // same color across renders.
  tone?: AvatarTone;
};

export type AvatarTone =
  | 'violet'
  | 'fuchsia'
  | 'emerald'
  | 'sky'
  | 'amber'
  | 'rose';

type Props = {
  items: AvatarGroupItem[];
  // Hard cap on visible avatars — the rest collapse into a +N chip.
  // Default 4 keeps the sidebar stack compact.
  max?: number;
  // Trailing dashed "+" slot. When provided, renders as an inline
  // button — the parent typically wires it as a Dialog trigger
  // (asChild) to open the invite modal. Without this, the group
  // renders the avatars only (read-only).
  onInviteClick?: () => void;
  // ID hook so the parent can render a DialogTrigger asChild around
  // the "+" slot (Radix re-parents the ref). Suppressed when
  // `inviteSlot` is provided to avoid a double-trigger.
  inviteSlot?: React.ReactNode;
  className?: string;
};

const TONES: Record<AvatarTone, string> = {
  violet: 'bg-blue-600 text-white',
  fuchsia: 'bg-fuchsia-600 text-white',
  emerald: 'bg-emerald-600 text-white',
  sky: 'bg-sky-600 text-white',
  amber: 'bg-amber-500 text-amber-950',
  rose: 'bg-rose-600 text-white',
};

const TONE_ORDER: AvatarTone[] = [
  'violet',
  'fuchsia',
  'emerald',
  'sky',
  'amber',
  'rose',
];

function toneFor(seed: string): AvatarTone {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return TONE_ORDER[h % TONE_ORDER.length];
}

export function AvatarGroup({
  items,
  max = 4,
  onInviteClick,
  inviteSlot,
  className,
}: Props) {
  const visible = items.slice(0, max);
  const overflow = items.length - visible.length;

  return (
    <div
      className={cn('flex items-center', className)}
      // Negative margin trick gives each avatar a -8px overlap.
      style={{ ['--avatar-gap' as string]: '-8px' }}
    >
      {visible.map((item, i) => {
        const tone = TONES[item.tone ?? toneFor(item.key)];
        return (
          <motion.span
            key={item.key}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              type: 'spring',
              stiffness: 420,
              damping: 28,
              delay: i * 0.04,
            }}
            whileHover={{ scale: 1.03 }}
            title={item.label}
            aria-label={item.label}
            style={{ marginLeft: i === 0 ? 0 : 'var(--avatar-gap)' }}
            className={cn(
              'relative inline-flex h-6 w-6 items-center justify-center overflow-hidden rounded-full text-[11px] font-semibold ring-2 ring-canvas-2',
              tone
            )}
          >
            {item.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.image}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            ) : null}
            {!item.image && item.initials}
          </motion.span>
        );
      })}

      {overflow > 0 && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            type: 'spring',
            stiffness: 420,
            damping: 28,
            delay: visible.length * 0.04,
          }}
          style={{ marginLeft: 'var(--avatar-gap)' }}
          className="relative inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-overlay px-1.5 text-[10px] font-semibold text-neutral-200 ring-2 ring-neutral-900"
          title={`${overflow} more`}
        >
          +{overflow}
        </motion.span>
      )}

      {inviteSlot ? (
        <span style={{ marginLeft: 'var(--avatar-gap)' }}>{inviteSlot}</span>
      ) : onInviteClick ? (
        <InvitePlaceholder
          onClick={onInviteClick}
          delay={(visible.length + (overflow > 0 ? 1 : 0)) * 0.04}
        />
      ) : null}
    </div>
  );
}

// Standalone dashed "+" pill — exported so the caller can render it
// inside a Radix DialogTrigger asChild without re-implementing the
// styles. Forwards the ref + spreads onClick so Radix's controlled
// open state takes over.
type AvatarInviteSlotProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  | 'onAnimationStart'
  | 'onAnimationEnd'
  | 'onAnimationIteration'
  | 'onDragStart'
  | 'onDragEnd'
  | 'onDrag'
> & { label?: string };

export const AvatarInviteSlot = React.forwardRef<
  HTMLButtonElement,
  AvatarInviteSlotProps
>(function AvatarInviteSlot(
  { className, label = 'Invite', style, ...props },
  ref
) {
  return (
    <motion.button
      ref={ref as React.Ref<HTMLButtonElement>}
      type="button"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ type: 'spring', stiffness: 420, damping: 28, delay: 0.16 }}
      aria-label={label}
      title={label}
      style={style}
      className={cn(
        'inline-flex h-6 w-6 items-center justify-center rounded-full border border-dashed border-line-strong bg-canvas-2 text-fg-muted ring-2 ring-canvas-2 transition-transform duration-100 ease-out hover:scale-110 hover:border-fg-muted hover:text-fg-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring',
        className
      )}
      {...props}
    >
      <span className="text-sm leading-none">+</span>
    </motion.button>
  );
});

function InvitePlaceholder({
  onClick,
  delay,
}: {
  onClick: () => void;
  delay: number;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ type: 'spring', stiffness: 420, damping: 28, delay }}
      aria-label="Invite"
      title="Invite"
      style={{ marginLeft: 'var(--avatar-gap)' }}
      className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-dashed border-line-strong bg-canvas-2 text-fg-muted ring-2 ring-canvas-2 transition-transform duration-100 ease-out hover:scale-110 hover:border-fg-muted hover:text-fg-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring"
    >
      <span className="text-sm leading-none">+</span>
    </motion.button>
  );
}
