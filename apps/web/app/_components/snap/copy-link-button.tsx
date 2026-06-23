"use client";

import { useState, type ReactElement } from "react";
import { Check, Link2 } from "lucide-react";

export type CopyLinkButtonProps = {
  url: string;
  className?: string;
  label?: string;
};

export function CopyLinkButton({
  url,
  className = "",
  label = "Copy link",
}: CopyLinkButtonProps): ReactElement {
  const [copied, setCopied] = useState(false);

  const handleClick = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard may be unavailable (insecure context / denied); ignore.
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex shrink-0 items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 ${className}`}
    >
      {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
      {copied ? "Copied" : label}
    </button>
  );
}
