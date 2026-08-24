import type { ReactNode } from "react";
import { Alert, Card, Table, Typography } from "@heroui/react";

export function formatBytes(bytes: number): string {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), 4);
  const n = bytes / 1024 ** i;
  return `${n >= 100 || i === 0 ? Math.round(n) : n.toFixed(1)} ${units[i]}`;
}

export function formatDate(ms: number | null): string {
  if (!ms) return "—";
  return new Date(ms).toISOString().slice(0, 16).replace("T", " ");
}

export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <Card.Content className="p-4">
        <Card.Description className="text-xs">{label}</Card.Description>
        <div className="text-fg mt-1 text-2xl font-semibold tabular-nums">
          {value}
        </div>
      </Card.Content>
    </Card>
  );
}

export function SectionHeading({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <div>
      <Typography.Heading level={2} className="mt-0 mb-0 text-sm font-semibold">
        {title}
      </Typography.Heading>
      {children && (
        <Typography.Paragraph className="text-fg-muted mt-1 mb-0 text-sm">
          {children}
        </Typography.Paragraph>
      )}
    </div>
  );
}

export function PageHeading({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <div>
      <Typography.Heading level={1} className="mt-0 mb-0 text-xl font-semibold">
        {title}
      </Typography.Heading>
      {children && (
        <Typography.Paragraph className="text-fg-muted mt-1 mb-0 text-sm">
          {children}
        </Typography.Paragraph>
      )}
    </div>
  );
}

export function DataTable({
  label,
  columns,
  children,
}: {
  label: string;
  columns: string[];
  children: ReactNode;
}) {
  return (
    <Table>
      <Table.ScrollContainer>
        <Table.Content aria-label={label} className="w-full">
          <Table.Header>
            {columns.map((c, i) => (
              // A blank trailing column header carries the row actions; the
              // first column is the row header for assistive tech.
              <Table.Column key={c || `actions-${i}`} isRowHeader={i === 0}>
                {c}
              </Table.Column>
            ))}
          </Table.Header>
          <Table.Body>{children}</Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  );
}

export function Notice({
  tone = "info",
  children,
}: {
  tone?: "info" | "error";
  children: ReactNode;
}) {
  return (
    <Alert status={tone === "error" ? "danger" : "accent"}>
      <Alert.Content>
        <Alert.Description>{children}</Alert.Description>
      </Alert.Content>
    </Alert>
  );
}
