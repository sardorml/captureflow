import Link from "next/link";
import { MARKETING_SITE_URL, PRODUCT_NAME } from "@/lib/site";
import { getAppI18n } from "@/lib/i18n/app/server";
import { fmt } from "@/lib/i18n/format";

export default async function ScreenshotNotFound() {
  const { messages: m } = await getAppI18n();
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black p-6 text-center">
      <h1 className="text-2xl font-medium text-white">
        {m.screenshotView.notFound.title}
      </h1>
      <p className="mt-2 max-w-md text-sm text-neutral-400">
        {m.screenshotView.notFound.description}
      </p>
      <Link
        href={MARKETING_SITE_URL}
        className="mt-6 text-sm text-neutral-400 hover:text-fg-strong"
      >
        {fmt(m.screenshotView.page.madeWith, { product: PRODUCT_NAME })}
      </Link>
    </main>
  );
}
