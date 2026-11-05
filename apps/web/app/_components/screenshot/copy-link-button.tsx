"use client";

import { useState, type ReactElement } from "react";
import { Check, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppMessages } from "@/components/app-i18n-provider";

export type CopyLinkButtonProps = {
  url: string;
  className?: string;
  label?: string;
};

export function CopyLinkButton({
  url,
  className,
  label,
}: CopyLinkButtonProps): ReactElement {
  const m = useAppMessages();
  const [copied, setCopied] = useState(false);

  const handlePress = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard may be unavailable (insecure context / denied); ignore.
    }
  };

  return (
    <Button onClick={handlePress} className={className}>
      {copied ? <Check size={16} /> : <Link2 size={16} />}
      {copied ? m.common.copied : (label ?? m.library.share.copyLink)}
    </Button>
  );
}
