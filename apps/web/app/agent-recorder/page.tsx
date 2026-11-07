import { AgentRecorderPage } from "@/components/marketing/site-pages";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import { pageMetadata } from "@/lib/i18n/metadata";
import { MESSAGES } from "@/lib/marketing/messages";

export const metadata = pageMetadata("agentRecorder", DEFAULT_LOCALE, MESSAGES);

export default function Page() {
  return <AgentRecorderPage />;
}
