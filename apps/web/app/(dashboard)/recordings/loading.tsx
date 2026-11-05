import {
  InlineSkeleton,
  ListToolbarSkeleton,
  MediaGridSkeleton,
} from "../_skeletons";
import { getAppI18n } from "@/lib/i18n/app/server";
import { PageHeader } from "../PageHeader";

export default async function Loading() {
  const { messages: m } = await getAppI18n();
  return (
    <>
      <PageHeader
        title={m.library.recording.pageTitle}
        subtitle={<InlineSkeleton className="h-3.5 w-24" />}
      />
      <div className="mt-6">
        <ListToolbarSkeleton />
        <MediaGridSkeleton />
      </div>
    </>
  );
}
