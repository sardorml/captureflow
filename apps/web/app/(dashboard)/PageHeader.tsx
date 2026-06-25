import type { ReactNode } from "react";
import { Video } from "lucide-react";
import { Button, Flex } from "antd";

type Props = {
  title: string;
  eyebrow?: string;
  subtitle?: string;
  actions?: ReactNode;
  showRecord?: boolean;
};

export function PageHeader({
  title,
  eyebrow,
  subtitle,
  actions,
  showRecord = true,
}: Props) {
  return (
    <Flex
      wrap
      align="flex-end"
      justify="space-between"
      gap={16}
      className="border-b border-line"
      style={{ paddingBottom: 16 }}
    >
      <div style={{ minWidth: 0 }}>
        {eyebrow && (
          <p className="text-xs font-medium tracking-tight text-fg-subtle">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-fg-strong">
          {title}
        </h1>
        {subtitle && <p className="mt-2 text-sm text-fg-muted">{subtitle}</p>}
      </div>
      {(actions || showRecord) && (
        <Flex align="center" gap={8}>
          {actions}
          {showRecord && (
            <Button
              type="primary"
              icon={<Video size={16} />}
              href="captureflow://record"
            >
              New recording
            </Button>
          )}
        </Flex>
      )}
    </Flex>
  );
}
