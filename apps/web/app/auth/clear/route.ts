import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const next = url.searchParams.get("next");
  const cookieStore = await cookies();

  for (const c of cookieStore.getAll()) {
    const isBetterAuth =
      c.name.startsWith("better-auth.") ||
      c.name.startsWith("__Secure-better-auth.") ||
      c.name.startsWith("__Host-better-auth.");
    if (isBetterAuth) cookieStore.delete(c.name);
  }

  const target = new URL("/login", url);
  if (next && next.startsWith("/")) {
    target.searchParams.set("next", next);
  }
  const res = NextResponse.redirect(target);
  res.headers.set("cache-control", "no-store, must-revalidate");
  res.headers.set("clear-site-data", '"cache", "cookies", "storage"');
  return res;
}
