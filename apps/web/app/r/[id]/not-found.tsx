import Link from "next/link";
import { getAppI18n } from "@/lib/i18n/app/server";
import { fmt } from "@/lib/i18n/format";
import { MARKETING_SITE_URL, PRODUCT_NAME } from "@/lib/site";

export default async function RecordingNotFound() {
  const copy = (await getAppI18n()).messages.viewer.notFound;
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black p-6 text-center">
      <h1 className="text-2xl font-medium text-white">{copy.title}</h1>
      <p className="mt-2 max-w-md text-sm text-neutral-400">
        {copy.description}
      </p>
      <Link
        href={MARKETING_SITE_URL}
        className="mt-6 text-sm text-neutral-400 hover:text-fg-strong"
      >
        {fmt(copy.madeWith, { product: PRODUCT_NAME })}
      </Link>
    </main>
  );
}
