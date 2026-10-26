import {
  InlineSkeleton,
  ListToolbarSkeleton,
  MediaGridSkeleton,
} from "../_skeletons";
import { PageHeader } from "../PageHeader";

export default function Loading() {
  return (
    <>
      <PageHeader
        title="Recordings"
        subtitle={<InlineSkeleton className="h-3.5 w-24" />}
      />
      <div className="mt-6">
        <ListToolbarSkeleton />
        <MediaGridSkeleton />
      </div>
    </>
  );
}
