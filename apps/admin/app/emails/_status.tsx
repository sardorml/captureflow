import { Chip } from "@heroui/react";
import type { CampaignStatus } from "@captureflow/mail";

const STATUS_COLOR: Record<CampaignStatus, "default" | "warning" | "success"> =
  {
    draft: "default",
    sending: "warning",
    sent: "success",
  };

export function StatusChip({ status }: { status: CampaignStatus }) {
  return (
    <Chip size="sm" color={STATUS_COLOR[status]}>
      {status}
    </Chip>
  );
}
