// Stylised CaptureFlow brand mark (a "C") used as the app icon in the
// viewer header. Stroke-currentColor so the caller picks the colour via
// a Tailwind text-* utility; the chip-style ring is added by the parent.
import type { ReactElement } from 'react';

export type CaptureFlowMarkProps = {
  className?: string;
};

export function CaptureFlowMark({
  className = 'h-5 w-5',
}: CaptureFlowMarkProps): ReactElement {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none">
      <path
        d="M11.3 5.2A4.5 4.5 0 1 0 11.3 10.8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
