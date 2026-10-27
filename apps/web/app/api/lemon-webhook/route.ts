/// <reference types="@cloudflare/workers-types" />

import { NextRequest, NextResponse } from "next/server";
import { getAppWebEnv } from "@/lib/cf-env";
import {
  hydrateSeatPlanId,
  upsertWorkspaceSubscription,
  type SeatPlanId,
  type SubscriptionStatus,
} from "@captureflow/quota";

/*
 * Lemon Squeezy subscription event sink for the seat plans. Does NOT handle
 * the lifetime license-key product — that flows through Lemon's licensing
 * endpoints, activated locally via `licenses/activate`.
 *
 * Signature: HMAC-SHA256 of the raw request body, hex-encoded, in the
 * X-Signature header. The body must be hashed as text (not re-stringified
 * JSON) or the bytes won't match LS's and the signature will never verify.
 */

type LSSubscriptionEvent = {
  meta: {
    event_name: string;
    // From `checkout[custom][...]`; carries the workspace the checkout was for.
    custom_data?: Record<string, string> | null;
  };
  data: {
    type: "subscriptions";
    id: string;
    attributes: {
      customer_id: number | null;
      user_email: string;
      status: SubscriptionStatus | string;
      variant_id: number;
      // ISO from LS; normalised to unix seconds before writing to match the schema's INTEGER timestamp columns.
      renews_at: string | null;
      ends_at: string | null;
      cancelled: boolean;
      created_at: string;
      updated_at: string;
      // The item carries the seat quantity, and its id is what the quantity update API takes.
      first_subscription_item?: { id: number; quantity: number } | null;
      card_brand?: string | null;
      card_last_four?: string | null;
      urls?: {
        customer_portal?: string | null;
        update_payment_method?: string | null;
      } | null;
    };
  };
};

// LS reports the active-period end via renews_at on healthy subscriptions
// and ends_at on cancelled ones.
function periodEndFromAttributes(
  attrs: LSSubscriptionEvent["data"]["attributes"],
): number | null {
  const iso = attrs.cancelled ? attrs.ends_at : attrs.renews_at;
  if (!iso) return null;
  const ms = Date.parse(iso);
  return Number.isFinite(ms) ? Math.floor(ms / 1000) : null;
}

async function verifySignature(
  rawBody: string,
  signatureHex: string,
  secret: string,
): Promise<boolean> {
  if (!signatureHex) return false;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(rawBody),
  );
  const computed = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  // Constant-time compare to avoid leaking signature bytes via timing.
  if (computed.length !== signatureHex.length) return false;
  let diff = 0;
  for (let i = 0; i < computed.length; i++) {
    diff |= computed.charCodeAt(i) ^ signatureHex.charCodeAt(i);
  }
  return diff === 0;
}

type SeatVariant = { plan: SeatPlanId; cycle: "monthly" | "annual" };

function seatVariant(
  env: Partial<
    Record<
      `LEMON_${"LIGHT" | "PRO"}_${"MONTHLY" | "ANNUAL"}_VARIANT_ID`,
      string
    >
  >,
  variant: string,
): SeatVariant | null {
  const table: [string | undefined, SeatVariant][] = [
    [env.LEMON_LIGHT_MONTHLY_VARIANT_ID, { plan: "light", cycle: "monthly" }],
    [env.LEMON_LIGHT_ANNUAL_VARIANT_ID, { plan: "light", cycle: "annual" }],
    [env.LEMON_PRO_MONTHLY_VARIANT_ID, { plan: "pro", cycle: "monthly" }],
    [env.LEMON_PRO_ANNUAL_VARIANT_ID, { plan: "pro", cycle: "annual" }],
  ];
  return table.find(([id]) => id && id === variant)?.[1] ?? null;
}

export async function POST(req: NextRequest) {
  const env = await getAppWebEnv();
  if (!env?.DB) {
    return NextResponse.json({ error: "db unavailable" }, { status: 500 });
  }
  const secret = env.LEMON_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[lemon-webhook] LEMON_WEBHOOK_SECRET not configured");
    return NextResponse.json({ error: "not configured" }, { status: 500 });
  }

  // Read raw body BEFORE parsing — the signature is over the exact bytes sent.
  const rawBody = await req.text();
  const signature = req.headers.get("x-signature") ?? "";
  const ok = await verifySignature(rawBody, signature, secret);
  if (!ok) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  let event: LSSubscriptionEvent;
  try {
    event = JSON.parse(rawBody) as LSSubscriptionEvent;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const name = event.meta?.event_name ?? "";
  if (!name.startsWith("subscription_")) {
    return NextResponse.json({ ok: true, ignored: name });
  }

  // Payment events carry an invoice, not the subscription; the subscription
  // events that follow them hold everything this route needs.
  const data = event.data;
  if (data?.type !== "subscriptions") {
    return NextResponse.json({ ok: true, ignored: name });
  }
  if (!data.attributes) {
    return NextResponse.json({ error: "unexpected payload" }, { status: 400 });
  }
  const attrs = data.attributes;

  /*
   * A seat subscription is told apart by its variant, or by the workspace id
   * the checkout attached; the custom data only rides the first event, so
   * renewals match on the variant alone. Anything else is a product this
   * deployment does not sell, acknowledged so LS stops retrying.
   */
  const variant = String(attrs.variant_id);
  const known = seatVariant(env, variant);
  const custom = event.meta.custom_data;
  if (!known && !custom?.workspace_id) {
    console.warn(
      `[lemon-webhook] ignoring ${name} for unknown variant_id=${variant}; set LEMON_{LIGHT,PRO}_{MONTHLY,ANNUAL}_VARIANT_ID`,
    );
    return NextResponse.json({ ok: true, ignored: `variant ${variant}` });
  }
  const plan = known?.plan ?? hydrateSeatPlanId(custom?.plan);
  const cycle = known?.cycle ?? "monthly";

  const now = Math.floor(Date.now() / 1000);
  const item = attrs.first_subscription_item ?? null;
  await upsertWorkspaceSubscription(env.DB, {
    ls_subscription_id: data.id,
    ls_subscription_item_id: item ? String(item.id) : null,
    workspace_id: custom?.workspace_id ?? null,
    ls_variant_id: variant,
    ls_customer_id:
      attrs.customer_id !== null ? String(attrs.customer_id) : null,
    ls_customer_email: attrs.user_email,
    status: attrs.status as SubscriptionStatus,
    plan,
    cycle,
    quantity: Math.max(1, item?.quantity ?? 1),
    current_period_end: periodEndFromAttributes(attrs),
    cancelled_at: attrs.cancelled ? now : null,
    card_brand: attrs.card_brand ?? null,
    card_last_four: attrs.card_last_four ?? null,
    portal_url: attrs.urls?.customer_portal ?? null,
    update_payment_url: attrs.urls?.update_payment_method ?? null,
    now,
  });
  return NextResponse.json({ ok: true });
}
