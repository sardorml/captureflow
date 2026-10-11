import type { CampaignStatus } from "@captureflow/mail";
import { Tone } from "../_ui";

const STATUS_COLOR: Record<CampaignStatus, "default" | "warning" | "success"> =
  {
    draft: "default",
    sending: "warning",
    sent: "success",
  };

export function StatusChip({ status }: { status: CampaignStatus }) {
  return <Tone color={STATUS_COLOR[status]}>{status}</Tone>;
}
