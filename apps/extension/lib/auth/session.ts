/*
 * The bearer token never leaves the extension except as an Authorization header
 * to the share API.
 */

export type AuthSession = {
  token: string;
  tokenId: string;
};

const authItem = storage.defineItem<AuthSession | null>("local:authSession", {
  fallback: null,
});

export const getAuthSession = (): Promise<AuthSession | null> =>
  authItem.getValue();

export const setAuthSession = (session: AuthSession | null): Promise<void> =>
  authItem.setValue(session);

export const watchAuthSession = (
  cb: (session: AuthSession | null) => void,
): (() => void) => authItem.watch(cb);
