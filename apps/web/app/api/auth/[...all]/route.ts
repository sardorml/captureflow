import { getAuth } from '@/lib/auth';

// Catch-all for every better-auth endpoint:
//   POST /api/auth/sign-in/email
//   POST /api/auth/sign-up/email
//   POST /api/auth/sign-out
//   GET  /api/auth/get-session
//   ...etc

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const auth = await getAuth();
  return auth.handler(req);
}

export async function GET(req: Request) {
  const auth = await getAuth();
  return auth.handler(req);
}
