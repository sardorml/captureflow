'use client';

// Violet primary "Copy link" button shared between the snap viewer
// and (anywhere else that wants the same CTA — e.g. the editor's
// share menu). Caller supplies the URL it should write; we own the
// clipboard call + the 1.5s "Copied" affordance so consumers don't
// reimplement the same state machine twice.
import { useState, type ReactElement } from 'react';
import { Check, Link2 } from 'lucide-react';

export type CopyLinkButtonProps = {
  url: string;
  className?: string;
  // Optional label override — defaults to "Copy link". The
  // post-copy "Copied" label is intentionally fixed so the visual
  // feedback is recognisable regardless of caller.
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
      // Clipboard may be unavailable (insecure context, denied). The
      // URL is still in the address bar, so silently swallow.
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
