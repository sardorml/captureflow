import { Skeleton } from "@/components/ui/skeleton";
import { getAppI18n } from "@/lib/i18n/app/server";
import { MeterSkeleton, SectionSkeleton } from "../_skeletons";
import { PageHeader } from "../PageHeader";

export default async function Loading() {
  const { messages: m } = await getAppI18n();
  const t = m.billing;
  return (
    <div className="mx-auto max-w-[880px]">
      <PageHeader
        title={t.page.title}
        subtitle={t.page.subtitle}
        showRecord={false}
      />
      <div className="mt-6 flex flex-col gap-8">
        <SectionSkeleton label={t.loading.plan}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex h-6 items-center">
                <Skeleton className="h-4 w-12 rounded" />
              </div>
              <div className="mt-2 flex h-6 items-center">
                <Skeleton className="h-3.5 w-80 max-w-full rounded" />
              </div>
            </div>
            <Skeleton className="h-10 w-36 shrink-0 rounded-xl" />
          </div>
        </SectionSkeleton>
        <SectionSkeleton label={t.loading.usage}>
          <MeterSkeleton />
        </SectionSkeleton>
      </div>
    </div>
  );
}
