import { Play } from 'lucide-react';

// Stand-in for a real screen recording inside the landing mockups. The
// marketing demo clip isn't bundled, so the share/collaboration mockups paint
// this dark "stage" — a soft blue under-glow, a breathing REC dot, and a play
// affordance — instead of an empty <video>. Mirrors the hero RecorderMockup so
// the whole page reads as one product.
export function DemoStage() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#0b1020]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_120%,rgba(59,130,246,0.25),transparent_70%)]"
      />
      <div className="absolute left-2 top-2 inline-flex items-center gap-1 font-mono text-[9px] text-white/80">
        <span className="size-1.5 animate-rec-breathe rounded-full bg-red-500" /> REC
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="flex size-10 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-950/40 ring-[5px] ring-blue-600/30">
          <Play className="size-4 translate-x-px fill-current" />
        </span>
      </div>
    </div>
  );
}
