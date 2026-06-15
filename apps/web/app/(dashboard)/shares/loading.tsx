import { DashboardLoading } from '../_skeletons';

// Instant placeholder rendered the moment a sidebar link to /shares is
// clicked. Next.js streams the real page in once the D1 query lands.
export default function Loading() {
  return <DashboardLoading variant="grid" />;
}
