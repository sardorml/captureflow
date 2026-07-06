import { redirect } from "next/navigation";

// /login is the single auth URL; this route survives for old links only.
export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const sp = await searchParams;
  const suffix = sp.next ? `&next=${encodeURIComponent(sp.next)}` : "";
  redirect(`/login?mode=signup${suffix}`);
}
