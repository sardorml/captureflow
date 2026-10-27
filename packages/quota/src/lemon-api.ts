/*
 * The one billing API call the app makes on its own: changing a
 * subscription's seat count when a member joins or leaves. Everything else
 * arrives through the webhook.
 */

const LEMON_API_BASE = "https://api.lemonsqueezy.com/v1";

export type SeatQuantityResult =
  | { ok: true }
  | { ok: false; status: number; body: string };

export async function setSubscriptionItemQuantity(input: {
  apiKey: string;
  subscriptionItemId: string;
  quantity: number;
  fetchImpl?: typeof fetch;
}): Promise<SeatQuantityResult> {
  const doFetch = input.fetchImpl ?? fetch;
  const res = await doFetch(
    `${LEMON_API_BASE}/subscription-items/${encodeURIComponent(input.subscriptionItemId)}`,
    {
      method: "PATCH",
      headers: {
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
        Authorization: `Bearer ${input.apiKey}`,
      },
      body: JSON.stringify({
        data: {
          type: "subscription-items",
          id: input.subscriptionItemId,
          // Prorated on the next invoice rather than charged on the spot, so
          // an invite never produces a surprise charge mid-month.
          attributes: { quantity: input.quantity, invoice_immediately: false },
        },
      }),
    },
  );
  if (res.ok) return { ok: true };
  return { ok: false, status: res.status, body: await res.text() };
}
