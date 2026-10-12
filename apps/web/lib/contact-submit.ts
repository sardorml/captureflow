import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";
import { getAppWebEnv } from "@/lib/cf-env";
import {
  CONTACT_REQUESTS_PER_HOUR,
  hashIp,
  insertContactRequest,
  recentRequestCount,
  type ContactRequest,
  type Hydrated,
} from "@/lib/contact-requests";

export type ContactFormState = { error: string | null; sent: boolean };

// Saves first and emails after, so a failed send never loses the message.
export async function submitContactRequest<T>(
  input: Hydrated<T>,
  toRequest: (value: T) => ContactRequest,
  notify: (value: T) => Promise<unknown>,
): Promise<ContactFormState> {
  // A bot that filled the honeypot gets the same answer as a person.
  if (!input.ok) {
    return "spam" in input
      ? { error: null, sent: true }
      : { error: input.error, sent: false };
  }

  const env = await getAppWebEnv();
  if (!env?.DB) {
    return { error: "This form is unavailable right now.", sent: false };
  }
  const h = await headers();
  const ip =
    h.get("cf-connecting-ip") ??
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";
  const ipHash = await hashIp(ip, env.BETTER_AUTH_SECRET ?? "captureflow-dev");
  const now = Date.now();
  if (
    (await recentRequestCount(env.DB, ipHash, now)) >= CONTACT_REQUESTS_PER_HOUR
  ) {
    return {
      error: "That's a lot of messages at once. Try again in an hour.",
      sent: false,
    };
  }

  const session = await (await getAuth()).api
    .getSession({ headers: h })
    .catch(() => null);
  await insertContactRequest(
    env.DB,
    { ...toRequest(input.value), userId: session?.user.id ?? null, ipHash },
    now,
  );
  await notify(input.value);
  return { error: null, sent: true };
}
