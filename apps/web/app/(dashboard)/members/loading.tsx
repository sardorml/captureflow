import { MembersListSkeleton } from "../_skeletons";
import { PageHeader } from "../PageHeader";

export default function Loading() {
  return (
    <>
      <PageHeader
        title="Members"
        subtitle="Invite teammates to share recordings and screenshots privately."
        showRecord={false}
      />
      <div className="mt-6 space-y-8">
        <MembersListSkeleton />
      </div>
    </>
  );
}
