import { getAppI18n } from "@/lib/i18n/app/server";

export default async function Loading() {
  const { messages: m } = await getAppI18n();
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-sm text-neutral-400">
      {m.screenshotEditor.loading}
    </div>
  );
}
