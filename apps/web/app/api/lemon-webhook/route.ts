/// <reference types="@cloudflare/workers-types" />

import { NextRequest, NextResponse } from 'next/server';
import { getAppWebEnv } from '@/lib/cf-env';
import type { ProSubscriptionStatus } from '@captureflow/quota';

/*
 * Lemon Squeezy subscription event sink. Does NOT handle the lifetime
 * license-key product — that flows through Lemon's licensing endpoints,
 * activated locally via `licenses/activate`.
 *
 * Signature: HMAC-SHA256 of the raw request body, hex-encoded, in the
 * X-Signature header. The body must be hashed as text (not re-stringified
 * JSON) or the bytes won't match LS's and the signature will never verify.
 */

type LSSubscriptionEvent = {
  meta: {
    event_name: string;
    // From `checkout[custom][...]`; carries the signed-in user_id when set.
    custom_data?: Record<string, string> | null;
  };
  data: {
    type: 'subscriptions';
    id: string;
    attributes: {
      customer_id: number | null;
      user_email: string;
      status: ProSubscriptionStatus | string;
      variant_id: number;
      // ISO from LS; normalised to unix seconds before writing to match the schema's INTEGER timestamp columns.
      renews_at: string | null;
      ends_at: string | null;
      cancelled: boolean;
      created_at: string;
      updated_at: string;
    };
  };
};

// LS reports the active-period end via renews_at on healthy subscriptions
// and ends_at on cancelled ones.
function periodEndFromAttributes(
  attrs: LSSubscriptionEvent['data']['attributes']
): number | null {
  const iso = attrs.cancelled ? attrs.ends_at : attrs.renews_at;
  if (!iso) return null;
  const ms = Date.parse(iso);
  return Number.isFinite(ms) ? Math.floor(ms / 1000) : null;
}

function cycleFromVariant(
  variantId: number,
  monthlyIds: Array<string | undefined>,
  annualIds: Array<string | undefined>
): 'monthly' | 'annual' {
  const v = String(variantId);
  if (annualIds.some((id) => id && id === v)) return 'annual';
  if (monthlyIds.some((id) => id && id === v)) return 'monthly';
  // Default to monthly rather than drop the row on a misconfigured env var.
  console.warn(
    `[lemon-webhook] unknown variant_id=${v}; defaulting to monthly. Set LEMON_{MONTHLY,ANNUAL,TEST_MONTHLY,TEST_ANNUAL}_VARIANT_ID.`
  );
  return 'monthly';
}

async function verifySignature(
  rawBody: string,
  signatureHex: string,
  secret: string
): Promise<boolean> {
  if (!signatureHex) return false;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(rawBody)
  );
  const computed = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  // Constant-time compare to avoid leaking signature bytes via timing.
  if (computed.length !== signatureHex.length) return false;
  let diff = 0;
  for (let i = 0; i < computed.length; i++) {
    diff |= computed.charCodeAt(i) ^ signatureHex.charCodeAt(i);
  }
  return diff === 0;
}

export async function POST(req: NextRequest) {
  const env = await getAppWebEnv();
  if (!env?.DB) {
    return NextResponse.json({ error: 'db unavailable' }, { status: 500 });
  }
  const secret = env.LEMON_WEBHOOK_SECRET;
  if (!secret) {
    console.error('[lemon-webhook] LEMON_WEBHOOK_SECRET not configured');
    return NextResponse.json({ error: 'not configured' }, { status: 500 });
  }

  // Read raw body BEFORE parsing — the signature is over the exact bytes sent.
  const rawBody = await req.text();
  const signature = req.headers.get('x-signature') ?? '';
  const ok = await verifySignature(rawBody, signature, secret);
  if (!ok) {
    return NextResponse.json({ error: 'invalid signature' }, { status: 401 });
  }

  let event: LSSubscriptionEvent;
  try {
    event = JSON.parse(rawBody) as LSSubscriptionEvent;
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const name = event.meta?.event_name ?? '';
  if (!name.startsWith('subscription_')) {
    return NextResponse.json({ ok: true, ignored: name });
  }

  const data = event.data;
  if (!data || data.type !== 'subscriptions' || !data.attributes) {
    return NextResponse.json({ error: 'unexpected payload' }, { status: 400 });
  }
  const attrs = data.attributes;
  const now = Math.floor(Date.now() / 1000);
  const cycle = cycleFromVariant(
    attrs.variant_id,
    [env.LEMON_MONTHLY_VARIANT_ID, env.LEMON_TEST_MONTHLY_VARIANT_ID],
    [env.LEMON_ANNUAL_VARIANT_ID, env.LEMON_TEST_ANNUAL_VARIANT_ID]
  );
  const periodEnd = periodEndFromAttributes(attrs);
  // Resolve user_id from checkout custom_data, else by case-insensitive email
  // match (covers buyers who paid before signing in); unattached otherwise.
  let userId: string | null = event.meta.custom_data?.user_id ?? null;
  if (!userId && attrs.user_email) {
    const u = await env.DB.prepare(
      `SELECT id FROM users WHERE LOWER(email) = LOWER(?1) LIMIT 1`
    )
      .bind(attrs.user_email)
      .first<{ id: string }>();
    if (u) userId = u.id;
  }
  const cancelledAt = attrs.cancelled ? now : null;

  // Upsert by LS subscription id. COALESCE(excluded.user_id, user_id) keeps a
  // later event (e.g. a renewal lacking custom_data) from clobbering an
  // already-attached user.
  await env.DB.prepare(
    `INSERT INTO pro_subscription (
       ls_subscription_id, user_id, ls_variant_id, ls_customer_id,
       ls_customer_email, status, cycle, current_period_end,
       cancelled_at, created_at, updated_at
     )
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?10)
     ON CONFLICT(ls_subscription_id) DO UPDATE SET
       user_id            = COALESCE(excluded.user_id, user_id),
       ls_variant_id      = excluded.ls_variant_id,
       ls_customer_id     = excluded.ls_customer_id,
       ls_customer_email  = excluded.ls_customer_email,
       status             = excluded.status,
       cycle              = excluded.cycle,
       current_period_end = excluded.current_period_end,
       cancelled_at       = excluded.cancelled_at,
       updated_at         = excluded.updated_at`
  )
    .bind(
      data.id,
      userId,
      String(attrs.variant_id),
      attrs.customer_id !== null ? String(attrs.customer_id) : null,
      attrs.user_email,
      attrs.status,
      cycle,
      periodEnd,
      cancelledAt,
      now
    )
    .run();

  return NextResponse.json({ ok: true });
}
