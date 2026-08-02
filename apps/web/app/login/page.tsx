import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { readThemeFromCookieHeader } from "@captureflow/ui";
import { loadSession } from "@/lib/session-guard";
import { AuthForm } from "@/app/AuthForm";
import { AuthShell } from "@/app/AuthShell";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; mode?: string }>;
}) {
  const sp = await searchParams;
  const next = sp.next ?? "/recordings";
  // Only same-origin path redirects — strip a forged "?next=https://evil".
  const safeNext = next.startsWith("/") ? next : "/recordings";
  const session = await loadSession();
  if (session) redirect(safeNext);

  const theme = readThemeFromCookieHeader((await headers()).get("cookie"));
  const initialMode = sp.mode === "signup" ? "signup" : "signin";

  return (
    <AuthShell theme={theme}>
      <AuthForm next={safeNext} initialMode={initialMode} />
    </AuthShell>
  );
}
