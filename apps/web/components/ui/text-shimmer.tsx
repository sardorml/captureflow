import { cn } from "@/lib/utils";

type Props = {
  text: string;
  as?: "span" | "p" | "h2";
  className?: string;
};

// Muted text with a bright band sweeping across it, for something being made.
export function TextShimmer({ text, as: Tag = "span", className }: Props) {
  return (
    <Tag
      className={cn(
        "inline-block animate-text-shimmer bg-[length:200%_100%] bg-clip-text text-transparent motion-reduce:animate-none motion-reduce:text-fg",
        className,
      )}
      style={{
        backgroundImage:
          "linear-gradient(90deg, var(--cf-fg-muted) 35%, var(--cf-fg-strong) 50%, var(--cf-fg-muted) 65%)",
      }}
    >
      {text}
    </Tag>
  );
}
