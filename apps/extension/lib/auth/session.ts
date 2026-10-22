/*
 * The bearer token never leaves the extension except as an Authorization header
 * to the recording API.
 */

export type AuthSession = {
  token: string;
  tokenId: string;
};

export type SignedOutReason = "revoked" | "signed-out" | "other-user";

// Who the token belongs to, as the server last described them. Refreshed on
// every auth probe; the bubble shows it where the camera would be.
export type UserProfile = {
  name: string | null;
  email: string;
  image: string | null;
};

const authItem = storage.defineItem<AuthSession | null>("local:authSession", {
  fallback: null,
});

const reasonItem = storage.defineItem<SignedOutReason | null>(
  "local:authSignedOutReason",
  { fallback: null },
);

const profileItem = storage.defineItem<UserProfile | null>(
  "local:userProfile",
  { fallback: null },
);

export const getAuthSession = (): Promise<AuthSession | null> =>
  authItem.getValue();

export async function setAuthSession(
  session: AuthSession | null,
): Promise<void> {
  await authItem.setValue(session);
  await reasonItem.setValue(null);
  if (!session) await profileItem.setValue(null);
}

// Signing out because the browser moved on rather than because the user asked:
// the reason is what the gate shows, instead of appearing to log itself out.
export async function clearAuthSession(reason: SignedOutReason): Promise<void> {
  await authItem.setValue(null);
  await reasonItem.setValue(reason);
  await profileItem.setValue(null);
}

export const getUserProfile = (): Promise<UserProfile | null> =>
  profileItem.getValue();
export const setUserProfile = (profile: UserProfile): Promise<void> =>
  profileItem.setValue(profile);
export const watchUserProfile = (
  cb: (profile: UserProfile | null) => void,
): (() => void) => profileItem.watch(cb);

export const getSignedOutReason = (): Promise<SignedOutReason | null> =>
  reasonItem.getValue();

export const watchAuthSession = (
  cb: (session: AuthSession | null) => void,
): (() => void) => authItem.watch(cb);
