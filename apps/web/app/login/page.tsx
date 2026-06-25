import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { ArrowLeft } from "lucide-react";
import { Button, Flex } from "antd";
import { ThemeToggle, readThemeFromCookieHeader } from "@captureflow/ui";
import { loadSession } from "@/lib/session-guard";
import { AuthForm } from "@/app/AuthForm";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const sp = await searchParams;
  const next = sp.next ?? "/shares";
  // Only same-origin path redirects — strip a forged "?next=https://evil".
  const safeNext = next.startsWith("/") ? next : "/shares";
  const session = await loadSession();
  if (session) redirect(safeNext);

  const theme = readThemeFromCookieHeader((await headers()).get("cookie"));

  return (
    <Flex
      align="center"
      justify="center"
      style={{ minHeight: "100vh", padding: 24, position: "relative" }}
    >
      <Link href="/" style={{ position: "absolute", left: 16, top: 16 }}>
        <Button type="text" icon={<ArrowLeft size={16} />}>
          Back
        </Button>
      </Link>
      <div style={{ position: "absolute", right: 16, top: 16 }}>
        <ThemeToggle initialTheme={theme} />
      </div>
      <AuthForm next={safeNext} initialMode="signin" />
    </Flex>
  );
}
