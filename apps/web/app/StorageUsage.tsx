import { Sparkles } from 'lucide-react';
import { UpgradeModal } from './(dashboard)/UpgradeModal';

// Account-scoped storage indicator for the dashboard sidebar.
//
// /api/init enforces the same cap by aggregating every share + snap owned
// by the signed-in user (regardless of device). Admins can bump a user's
// cap via admin.captureflow.xyz's user_quotas override; the limit prop
// already reflects that override.

// Public Lemon Squeezy checkout link (not secret) — hardcoded fallback for the
// same reason as in UpgradeModal/public-analytics. Env still wins when set.
const UPGRADE_BASE_URL =
  process.env.NEXT_PUBLIC_LEMON_SQUEEZY_CHECKOUT_URL ||
  'https://sardorml.lemonsqueezy.com/checkout/buy/775fbd57-6dea-4dee-9b27-4cc8aa664916';

// Pre-fills the LS checkout email so it matches the buyer's account (the webhook
// links the subscription by email), mirroring UpgradeModal's checkoutUrlFor.
function upgradeUrlFor(email: string): string {
  const u = new URL(UPGRADE_BASE_URL);
  u.searchParams.set('billing', 'monthly');
  if (email) u.searchParams.set('checkout[email]', email);
  return u.toString();
}

type StorageUsageProps = {
  usedBytes: number;
  limitBytes: number;
  // Pre-fills the upgrade modal's checkout so the signed-in user doesn't retype.
  email: string;
};

export function StorageUsage({
  usedBytes,
  limitBytes,
  email,
}: StorageUsageProps) {
  const limit = limitBytes;
  // Free tier has no cloud quota (limit 0) — cloud storage is Pro-only. A
  // 0-byte limit would render a nonsensical "X of 0 B" at a red 0%, so show
  // the upgrade prompt instead of a meter, with a CTA that opens the same
  // in-app upgrade modal the topbar uses.
  if (limit <= 0) {
    return (
      <div>
        <div className="flex items-center justify-between text-xs font-medium text-fg-muted">
          <span>Storage</span>
        </div>
        <p className="mt-2 text-xs text-neutral-400">
          Cloud storage is a Pro feature.
        </p>
        <UpgradeModal
          email={email}
          trigger={
            <button
              type="button"
              className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-blue-600 px-2 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-500"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Upgrade to Pro
            </button>
          }
        />
      </div>
    );
  }
  const ratio = Math.min(1, usedBytes / limit);
  const pct = Math.round(ratio * 100);
  const over = usedBytes >= limit;
  const near = !over && ratio >= 0.8;
  const barColor = over
    ? 'bg-red-500'
    : near
      ? 'bg-amber-400'
      : 'bg-neutral-300';
  return (
    <div>
      <div className="flex items-center justify-between text-xs font-medium text-fg-muted">
        <span>Storage</span>
        <span className={over ? 'text-red-300' : near ? 'text-amber-300' : ''}>
          {pct}%
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-overlay">
        <div
          className={`h-full rounded-full transition-[width] duration-300 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-neutral-400">
        {formatBytes(usedBytes)} of {formatBytes(limit)}
      </p>
      {over ? (
        <a
          href={upgradeUrlFor(email)}
          target="_blank"
          rel="noreferrer noopener"
          className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-blue-600 px-2 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-500"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Upgrade to Pro
        </a>
      ) : null}
    </div>
  );
}

function formatBytes(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let v = n;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(v >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}
