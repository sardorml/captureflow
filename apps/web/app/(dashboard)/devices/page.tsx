import { requireSession } from "@/lib/session-guard";
import { listDeviceTokensForUser } from "@/lib/device-tokens";
import { getAppI18n } from "@/lib/i18n/app/server";
import { plural } from "@/lib/i18n/format";
import { DevicesSection } from "../../DevicesSection";
import { PageHeader } from "../PageHeader";

export const dynamic = "force-dynamic";

export default async function DevicesPage() {
  const session = await requireSession();

  const tokens = await listDeviceTokensForUser(session.user.id);
  const { messages: m, lang } = await getAppI18n();

  return (
    <>
      <PageHeader
        title={m.settings.devices.title}
        subtitle={plural(m.settings.devices.count, tokens.length, lang)}
        showRecord={false}
      />
      <div className="mt-6">
        <DevicesSection tokens={tokens} />
      </div>
    </>
  );
}
