import { requireSession } from '@/lib/session-guard';
import { listDeviceTokensForUser } from '@/lib/device-tokens';
import { DevicesSection } from '../../DevicesSection';
import { PageHeader } from '../PageHeader';

export const dynamic = 'force-dynamic';

export default async function DevicesPage() {
  const session = await requireSession();

  const tokens = await listDeviceTokensForUser(session.user.id);

  return (
    <>
      <PageHeader
        title="Connected devices"
        subtitle={`${tokens.length} device${
          tokens.length === 1 ? '' : 's'
        } signed in`}
        showRecord={false}
      />
      <div className="mt-6">
        <DevicesSection tokens={tokens} />
      </div>
    </>
  );
}
