import { Button } from "@heroui/react";
import { UpgradeModal } from "./UpgradeModal";

export function SidebarUpgradeCard({
  email,
  userId,
}: {
  email: string;
  userId: string;
}) {
  return (
    <div className="rounded-2xl bg-panel p-4 ring-1 ring-line-strong">
      <p className="text-sm font-semibold text-fg-strong">
        Get more room with Pro
      </p>
      <p className="mt-1 text-xs leading-5 text-fg-muted">
        More storage for your recordings and screenshots.
      </p>
      <UpgradeModal
        email={email}
        userId={userId}
        openOnUpgradeParam
        trigger={
          <Button variant="primary" fullWidth className="mt-3">
            View plans
          </Button>
        }
      />
    </div>
  );
}
