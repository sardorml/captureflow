// Hero sub-line: where CaptureFlow runs today and what's next. Replaces the
// old "No credit card required" line. macOS ships now (beta); the Windows app
// and Chrome extension are in the pipeline, shown dimmed with a "Soon" badge.
//
// Logos are inline monochrome SVGs (currentColor) so colour + opacity come from
// the row's text classes — the live platform reads dark, the upcoming ones grey.
// We don't use the Material Symbols <Icon> here: it's a ligature subset with no
// brand glyphs, so Apple/Windows/Chrome would leak as literal text.

type LogoProps = { className?: string };

function AppleLogo({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.05.28.05.43zm4.565 15.71c-.03.07-.463 1.58-1.518 3.12-.945 1.34-1.94 2.71-3.43 2.71-1.517 0-1.9-.88-3.63-.88-1.698 0-2.302.91-3.67.91-1.377 0-2.332-1.26-3.428-2.8C1.94 18.18.904 15.37.904 12.72c0-4.28 2.797-6.55 5.552-6.55 1.448 0 2.675.95 3.6.95.865 0 2.222-1.01 3.902-1.01.613 0 2.886.06 4.374 2.19-.13.09-2.383 1.37-2.383 4.19 0 3.26 2.854 4.42 2.955 4.46z" />
    </svg>
  );
}

function WindowsLogo({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M3 3h8.2v8.2H3V3zm9.8 0H21v8.2h-8.2V3zM3 12.8h8.2V21H3v-8.2zm9.8 0H21V21h-8.2v-8.2z" />
    </svg>
  );
}

function ChromeLogo({ className }: LogoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="3.6" fill="currentColor" stroke="none" />
      <line x1="21.17" x2="12" y1="8" y2="8" />
      <line x1="3.95" x2="8.54" y1="6.06" y2="14" />
      <line x1="10.88" x2="15.46" y1="21.94" y2="14" />
    </svg>
  );
}

const PLATFORMS = [
  { name: 'macOS', status: 'Beta', live: true, Logo: AppleLogo },
  { name: 'Windows', status: 'Soon', live: false, Logo: WindowsLogo },
  { name: 'Chrome', status: 'Soon', live: false, Logo: ChromeLogo },
] as const;

export function PlatformAvailability() {
  return (
    <div className="mt-7 flex animate-fade-in flex-wrap items-center justify-center gap-x-6 gap-y-3 animation-delay-500">
      {PLATFORMS.map(({ name, status, live, Logo }) => (
        <div
          key={name}
          className={`flex items-center gap-2 ${live ? 'text-neutral-800' : 'text-neutral-400'}`}
        >
          <Logo className="h-[18px] w-[18px]" />
          <span className="text-sm font-medium">{name}</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
              live ? 'bg-blue-100 text-blue-700' : 'bg-neutral-100 text-neutral-400'
            }`}
          >
            {status}
          </span>
        </div>
      ))}
    </div>
  );
}
