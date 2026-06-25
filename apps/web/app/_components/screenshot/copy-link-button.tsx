"use client";

import { useState, type ReactElement } from "react";
import { Check, Link2 } from "lucide-react";
import { Button } from "antd";

export type CopyLinkButtonProps = {
  url: string;
  className?: string;
  label?: string;
};

export function CopyLinkButton({
  url,
  className,
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
    <Button
      type="primary"
      onClick={handleClick}
      icon={copied ? <Check size={16} /> : <Link2 size={16} />}
      className={className}
    >
      {copied ? "Copied" : label}
    </Button>
  );
}
