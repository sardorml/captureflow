'use client';

// Shared "Copy link" button. Caller supplies the URL; this component
// owns the clipboard write and the 1.5s "Copied" affordance so
// consumers don't reimplement that state machine.
import { useState, type ReactElement } from 'react';
import { Check, Link2 } from 'lucide-react';

export type CopyLinkButtonProps = {
  url: string;
  className?: string;
  // Defaults to "Copy link". The post-copy "Copied" label is fixed so
  // the feedback stays recognizable regardless of caller.
  label?: string;
};

export function CopyLinkButton({
  url,
  className = '',
  label = 'Copy link',
}: CopyLinkButtonProps): ReactElement {
  const [copied, setCopied] = useState(false);

  const handleClick = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard may be unavailable (insecure context, permission
      // denied). The URL is still in the address bar, so swallow.
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex shrink-0 items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 ${className}`}
    >
      {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
      {copied ? 'Copied' : label}
    </button>
  );
}
