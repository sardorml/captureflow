import { getAuth } from '@/lib/auth';

// Catch-all route delegating every /api/auth/* request to the better-auth handler.

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const auth = await getAuth();
  return auth.handler(req);
}

export async function GET(req: Request) {
  const auth = await getAuth();
  return auth.handler(req);
}
