'use client';

import { createAuthClient } from 'better-auth/react';

// baseURL falls through to the current origin: server actions and the
// client both hit `/api/auth/...` on the same host.
export const authClient = createAuthClient({
  baseURL: typeof window !== 'undefined' ? window.location.origin : undefined,
});

export const { signIn, signUp, signOut, useSession } = authClient;
