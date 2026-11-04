import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import Link from "next/link";
import { cn } from "@captureflow/ui/cn";

export function Card({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-panel ring-1 ring-line">
      <div className="flex flex-wrap items-start justify-between gap-3 px-6 pt-6 pb-5">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-fg-strong">
            {title}
          </h2>
          {description && (
            <p className="mt-1 text-base text-fg-muted">{description}</p>
          )}
        </div>
        {action}
      </div>
      <div className="border-t border-line px-6 py-6">{children}</div>
    </section>
  );
}

const BUTTON_VARIANT = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/80",
  secondary:
    "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)]",
  danger: "bg-destructive/10 text-destructive hover:bg-destructive/20",
};

const BUTTON_SIZE = {
  md: "h-9 px-3.5 text-sm",
  sm: "h-7 px-2.5 text-[0.8rem]",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof BUTTON_VARIANT;
  size?: keyof typeof BUTTON_SIZE;
}) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg font-medium whitespace-nowrap transition-colors disabled:pointer-events-none disabled:opacity-50",
        BUTTON_VARIANT[variant],
        BUTTON_SIZE[size],
        className,
      )}
      {...props}
    />
  );
}

const FIELD =
  "h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(FIELD, "min-w-0", className)} {...props} />;
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(FIELD, "h-auto min-w-0 py-2 leading-6", className)}
      {...props}
    />
  );
}

export function Select({
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(FIELD, "pr-8", className)} {...props} />;
}

export function Alert({
  tone = "info",
  children,
}: {
  tone?: "info" | "error";
  children: ReactNode;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "rounded-xl px-4 py-3 text-sm",
        tone === "error"
          ? "bg-destructive/10 text-destructive"
          : "bg-tint text-fg",
      )}
    >
      {children}
    </div>
  );
}

const BADGE_TONE = {
  primary: "bg-primary text-primary-foreground",
  muted: "bg-tint text-fg",
  warn: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
};

export function Badge({
  tone = "primary",
  children,
}: {
  tone?: keyof typeof BADGE_TONE;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        BADGE_TONE[tone],
      )}
    >
      {children}
    </span>
  );
}

export function PageHeader({
  title,
  description,
  back,
  children,
}: {
  title: string;
  description?: string;
  back?: { href: string; label: string };
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {back && (
          <Link
            href={back.href}
            className="text-sm text-fg-muted underline-offset-4 hover:underline"
          >
            {back.label}
          </Link>
        )}
        <h1
          className={cn(
            "text-3xl font-semibold tracking-tight break-words text-fg-strong",
            back && "mt-2",
          )}
        >
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-base text-fg-muted">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

export function Stats({ children }: { children: ReactNode }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{children}</div>
  );
}

export function Stat({
  label,
  value,
  hint,
  href,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  href?: string;
}) {
  const body = (
    <>
      <p className="text-sm text-fg-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-fg-strong">
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-fg-muted">{hint}</p>}
    </>
  );
  const className = "rounded-2xl bg-panel p-5 ring-1 ring-line";
  return href ? (
    <Link href={href} className={cn(className, "hover:ring-ring")}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="py-6 text-center text-sm text-fg-muted">{children}</p>;
}

// Prev/next over ?page=, keeping the other filters in the URL.
export function Pager({
  page,
  total,
  pageSize,
  params,
}: {
  page: number;
  total: number;
  pageSize: number;
  params: Record<string, string>;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;
  const href = (p: number) =>
    `?${new URLSearchParams({ ...params, page: String(p) })}`;
  const link = (p: number, label: string, enabled: boolean) =>
    enabled ? (
      <Link
        href={href(p)}
        className="rounded-lg bg-secondary px-3 py-1.5 text-sm text-secondary-foreground"
      >
        {label}
      </Link>
    ) : (
      <span className="rounded-lg px-3 py-1.5 text-sm text-fg-muted opacity-50">
        {label}
      </span>
    );
  return (
    <div className="flex items-center justify-between pt-4 text-sm text-fg-muted">
      {link(page - 1, "Previous", page > 1)}
      <span>
        Page {page} of {pages}
      </span>
      {link(page + 1, "Next", page < pages)}
    </div>
  );
}

export function Table({
  head,
  children,
}: {
  head: ReactNode[];
  children: ReactNode;
}) {
  // Scrolls inside the card on a phone, so the page itself never does.
  return (
    <div className="-mx-6 overflow-x-auto px-6">
      <table className="w-full min-w-[32rem] text-sm">
        <thead>
          <tr className="border-b border-line text-left text-fg-muted">
            {head.map((cell, i) => (
              <th
                key={i}
                className={cn(
                  "py-2 pr-4 font-medium",
                  i === head.length - 1 && "text-right",
                )}
              >
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">{children}</tbody>
      </table>
    </div>
  );
}

export function Cell({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <td className={cn("py-3 pr-4 align-middle", className)}>{children}</td>
  );
}

// Right-aligned actions, so the row's buttons line up down the table.
export function Actions({ children }: { children: ReactNode }) {
  return (
    <td className="py-3 align-middle">
      <div className="flex justify-end gap-2">{children}</div>
    </td>
  );
}
