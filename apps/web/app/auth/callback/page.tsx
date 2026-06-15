import { redirect } from 'next/navigation';
import { loadSession } from '@/lib/session-guard';
import { issueDeviceToken } from '@/lib/device-tokens';
import { CallbackHandoff } from './CallbackHandoff';

export const dynamic = 'force-dynamic';

// Renders the deep-link handoff. Flow:
//   1. Desktop opens https://app.captureflow.xyz/auth/callback?label=Mac
//      in the user's default browser. (Optional ?return= overrides the
//      captureflow:// scheme target — locked to the configured scheme so
//      a hostile referrer can't redirect into javascript: or http:.)
//   2. If unauthenticated → redirect to /login?next=/auth/callback?...
//   3. Once authenticated, mint a fresh device token (this is the one
//      and only place it appears in plaintext) and embed it in a
//      `captureflow://auth/callback?token=...` deep link.
//   4. The page kicks off the navigation; the OS hands control to the
//      Electron app's `open-url` handler.

const DEFAULT_SCHEME = 'captureflow';

function buildDeepLink(scheme: string, token: string, tokenId: string): string {
  const u = new URL(`${scheme}://auth/callback`);
  u.searchParams.set('token', token);
  u.searchParams.set('id', tokenId);
  return u.toString();
}

export default async function CallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ label?: string; return?: string }>;
}) {
  const sp = await searchParams;
  const session = await loadSession();
  if (!session) {
    // Bounce through login carrying the callback's query string so
    // the user lands back here after authenticating.
    const params = new URLSearchParams();
    if (sp.label) params.set('label', sp.label);
    if (sp.return) params.set('return', sp.return);
    const tail = params.toString();
    const next = `/auth/callback${tail ? `?${tail}` : ''}`;
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  // Only allow the configured captureflow:// scheme. Anything else gets
  // ignored — caller may still pass a label.
  const scheme = DEFAULT_SCHEME;
  const requestedReturn =
    typeof sp.return === 'string' && sp.return.startsWith(`${scheme}://`)
      ? sp.return
      : null;
  const label = typeof sp.label === 'string' ? sp.label : null;

  const issued = await issueDeviceToken(session.user.id, label);
  const deepLink = requestedReturn
    ? appendTokenToReturn(requestedReturn, issued.rawToken, issued.id)
    : buildDeepLink(scheme, issued.rawToken, issued.id);

  return <CallbackHandoff deepLink={deepLink} email={session.user.email} />;
}

// If the caller passed a fully-formed captureflow:// URL (e.g. with a
// state param the desktop wants echoed back), append the freshly
// minted credentials without trampling existing query keys.
function appendTokenToReturn(
  returnUrl: string,
  token: string,
  tokenId: string
): string {
  try {
    const u = new URL(returnUrl);
    u.searchParams.set('token', token);
    u.searchParams.set('id', tokenId);
    return u.toString();
  } catch {
    return buildDeepLink(DEFAULT_SCHEME, token, tokenId);
  }
}
