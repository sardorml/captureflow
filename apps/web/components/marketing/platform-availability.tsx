// Hero sub-line: where CaptureFlow runs today and what's next.
//
// Logos are inline monochrome SVGs (currentColor) so colour + opacity come from
// the row's text classes. We don't use the Material Symbols <Icon> here: it's a
// ligature subset with no brand glyphs, so Apple/Windows/Chrome would leak as
// literal text.

import { AnimatedTooltip } from '@/components/ui/smooth-tooltip';

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
      <path d="M0 3.449 9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-13.051-1.351" />
    </svg>
  );
}

function ChromeLogo({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M12 0C8.21 0 4.831 1.757 2.632 4.501l3.953 6.848A5.454 5.454 0 0 1 12 6.545h10.691A12 12 0 0 0 12 0zM1.931 5.47A11.943 11.943 0 0 0 0 12c0 6.012 4.42 10.991 10.189 11.864l3.953-6.847a5.45 5.45 0 0 1-6.865-2.29zm13.342 2.166a5.446 5.446 0 0 1 1.45 7.09l.002.001h-.002l-5.344 9.257c.206.01.413.016.621.016 6.627 0 12-5.373 12-12 0-1.54-.29-3.011-.818-4.364zM12 16.364a4.364 4.364 0 1 1 0-8.728 4.364 4.364 0 0 1 0 8.728Z" />
    </svg>
  );
}

type PlatformState = 'live' | 'progress' | 'soon';

const TEXT_TONE: Record<PlatformState, string> = {
  live: 'text-neutral-800',
  progress: 'text-neutral-800',
  soon: 'text-neutral-400',
};

const BADGE_TONE: Record<PlatformState, string> = {
  live: 'bg-violet-100 text-violet-700',
  progress: 'bg-blue-100 text-blue-700',
  soon: 'bg-neutral-100 text-neutral-400',
};

const PLATFORMS = [
  { name: 'macOS', status: 'Beta', state: 'live', Logo: AppleLogo, tip: 'Available now — download the macOS beta' },
  { name: 'Chrome', status: 'In progress', state: 'progress', Logo: ChromeLogo, tip: 'Chrome extension — in active development' },
  { name: 'Windows', status: 'Soon', state: 'soon', Logo: WindowsLogo, tip: 'Windows app in the works' },
] as const;

export function PlatformAvailability() {
  return (
    <div className="mt-7 flex animate-fade-in flex-wrap items-center justify-center gap-x-6 gap-y-3 animation-delay-500">
      {PLATFORMS.map(({ name, status, state, Logo, tip }) => (
        <AnimatedTooltip key={name} content={tip} placement="bottom">
          <span
            className={`flex cursor-default items-center gap-2 ${TEXT_TONE[state]}`}
          >
            <Logo className="h-4 w-4" />
            <span className="text-xs font-medium">{name}</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${BADGE_TONE[state]}`}
            >
              {status}
            </span>
          </span>
        </AnimatedTooltip>
      ))}
    </div>
  );
}
