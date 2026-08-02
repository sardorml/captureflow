/*
 * The bearer token never leaves the extension except as an Authorization header
 * to the recording API.
 */

export type AuthSession = {
  token: string;
  tokenId: string;
};

export type SignedOutReason = "revoked" | "signed-out" | "other-user";

const authItem = storage.defineItem<AuthSession | null>("local:authSession", {
  fallback: null,
});

const reasonItem = storage.defineItem<SignedOutReason | null>(
  "local:authSignedOutReason",
  { fallback: null },
);

export const getAuthSession = (): Promise<AuthSession | null> =>
  authItem.getValue();

export async function setAuthSession(
  session: AuthSession | null,
): Promise<void> {
  await authItem.setValue(session);
  await reasonItem.setValue(null);
}

// Signing out because the browser moved on rather than because the user asked:
// the reason is what the gate shows, instead of appearing to log itself out.
export async function clearAuthSession(reason: SignedOutReason): Promise<void> {
  await authItem.setValue(null);
  await reasonItem.setValue(reason);
}

export const getSignedOutReason = (): Promise<SignedOutReason | null> =>
  reasonItem.getValue();

export const watchAuthSession = (
  cb: (session: AuthSession | null) => void,
): (() => void) => authItem.watch(cb);
