import Link from "next/link";
import { MARKETING_SITE_URL, PRODUCT_NAME } from "@/lib/site";

export default function ShareNotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black p-6 text-center">
      <h1 className="text-2xl font-medium text-white">Share not found</h1>
      <p className="mt-2 max-w-md text-sm text-neutral-400">
        This link has expired or never existed. Shares are kept for 30 days from
        the last time they were viewed.
      </p>
      <Link
        href={MARKETING_SITE_URL}
        className="mt-6 text-sm text-neutral-400 hover:text-fg-strong"
      >
        Made with {PRODUCT_NAME}
      </Link>
    </main>
  );
}
