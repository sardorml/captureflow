import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
} from "react";
import { cn } from "@captureflow/ui/cn";

export function Card({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-panel ring-1 ring-line">
      <div className="px-6 pt-6 pb-5">
        <h2 className="text-2xl font-semibold tracking-tight text-fg-strong">
          {title}
        </h2>
        <p className="mt-1 text-base text-fg-muted">{description}</p>
      </div>
      <div className="border-t border-line px-6 py-6">{children}</div>
    </section>
  );
}

const BUTTON_VARIANT = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/80",
  secondary:
    "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)]",
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

export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
      {children}
    </span>
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
