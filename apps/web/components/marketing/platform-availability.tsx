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
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
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
    <div className="mt-7 flex animate-fade-in flex-wrap items-center justify-center gap-x-7 gap-y-3 animation-delay-500">
      {PLATFORMS.map(({ name, status, live, Logo }) => (
        <div
          key={name}
          aria-label={`${name}: ${status}`}
          className={`flex items-center gap-2.5 ${live ? 'text-neutral-800' : 'text-neutral-400'}`}
        >
          <Logo className="h-7 w-7" />
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
