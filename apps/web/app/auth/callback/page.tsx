import { redirect } from 'next/navigation';
import { loadSession } from '@/lib/session-guard';
import { issueDeviceToken } from '@/lib/device-tokens';
import { CallbackHandoff } from './CallbackHandoff';

export const dynamic = 'force-dynamic';

// Deep-link handoff flow:
//   1. Desktop opens .../auth/callback?label=Mac in the default browser.
//      An optional ?return= overrides the deep-link target but is locked
//      to the configured scheme so a hostile referrer can't redirect into
//      javascript: or http:.
//   2. If unauthenticated → redirect to /login?next=/auth/callback?...
//   3. Once authenticated, mint a fresh device token (the one and only
//      place it appears in plaintext) and embed it in the deep link.
//   4. The page kicks off navigation; the OS hands control to the
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
    // Carry the callback's query string through login so the user
    // lands back here after authenticating.
    const params = new URLSearchParams();
    if (sp.label) params.set('label', sp.label);
    if (sp.return) params.set('return', sp.return);
    const tail = params.toString();
    const next = `/auth/callback${tail ? `?${tail}` : ''}`;
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  // Only honor a ?return= that uses the configured scheme; anything
  // else is ignored. The caller may still pass a label.
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

// Append freshly minted credentials to a caller-supplied captureflow://
// URL (e.g. one carrying a state param the desktop wants echoed back)
// without trampling its existing query keys.
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
