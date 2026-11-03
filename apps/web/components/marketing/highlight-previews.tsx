import type { ReactNode } from "react";

const DUMMY_BOARD = [
  { name: "To do", tasks: ["#f59e0b", "#f59e0b"] },
  { name: "Doing", tasks: ["#1184f7"] },
  { name: "Done", tasks: ["#22c55e", "#22c55e"] },
];

function DummyApp({ className = "" }: { className?: string }) {
  return (
    <div
      className={`absolute inset-0 flex flex-col bg-white text-[#181818] ${className}`}
    >
      <div className="flex h-4 shrink-0 items-center gap-1 bg-[#eaeaea] px-2">
        <span className="size-1.5 rounded-full bg-[#ff5f57]" />
        <span className="size-1.5 rounded-full bg-[#febc2e]" />
        <span className="size-1.5 rounded-full bg-[#28c840]" />
        <span className="ml-1 h-2 flex-1 rounded-full bg-white" />
      </div>
      <div className="flex min-h-0 flex-1">
        <div className="flex w-9 shrink-0 flex-col gap-1.5 bg-[#f5f5f5] p-1.5">
          <span className="h-1 rounded-full bg-[#1184f7]" />
          <span className="h-1 rounded-full bg-[#d4d4d4]" />
          <span className="h-1 rounded-full bg-[#d4d4d4]" />
        </div>
        <div className="min-w-0 flex-1 p-2">
          <p className="text-[8px] leading-none font-bold">Launch plan</p>
          <div className="mt-1.5 grid grid-cols-3 gap-1">
            {DUMMY_BOARD.map((column) => (
              <div
                key={column.name}
                className="flex flex-col gap-1 rounded-sm bg-[#f5f5f5] p-1"
              >
                <span className="text-[6px] leading-none text-black/55">
                  {column.name}
                </span>
                {column.tasks.map((color, i) => (
                  <span
                    key={i}
                    className="flex flex-col gap-0.5 rounded-sm bg-white p-1"
                  >
                    <span className="h-0.5 rounded-full bg-[#d4d4d4]" />
                    <span
                      className="h-0.5 w-2/3 rounded-full"
                      style={{ background: color }}
                    />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Photo({ src, className }: { src: string; className: string }) {
  return (
    <img
      src={src}
      alt=""
      width={160}
      height={160}
      loading="lazy"
      className={`absolute rounded-full object-cover ring-2 ring-white ${className}`}
    />
  );
}

function Line({ time, children }: { time: string; children: ReactNode }) {
  return (
    <div className="flex gap-1.5">
      <span className="font-mono text-[#9a9a9a]">{time}</span>
      <span>{children}</span>
    </div>
  );
}

export function RecordingPreview() {
  return (
    <div className="relative size-full">
      <DummyApp />
      <span className="absolute bottom-[38px] left-2 flex items-center gap-1 rounded-full bg-[#181818] px-1.5 py-0.5 font-mono text-[8px] leading-none font-semibold text-white">
        <span className="size-1.5 rounded-full bg-[#ef4444]" />
        0:42
      </span>
      <Photo
        src="/presenter-recorder.webp"
        className="right-[30px] bottom-[38px] size-11"
      />
    </div>
  );
}

export function TranscriptsPreview() {
  return (
    <div className="flex size-full flex-col gap-2 bg-white p-2.5 text-[8px] leading-tight font-medium text-[#181818]">
      <div className="flex gap-1">
        <span className="rounded-full bg-[#1184f7] px-1.5 py-0.5 text-white">
          English
        </span>
        <span className="rounded-full bg-[#eeeeee] px-1.5 py-0.5">Español</span>
        <span className="rounded-full bg-[#eeeeee] px-1.5 py-0.5">日本語</span>
      </div>
      <Line time="0:02">Here is the new flow.</Line>
      <Line time="0:06">First, pick a workspace.</Line>
      <Line time="0:11">Then share the link.</Line>
    </div>
  );
}

export function EditingPreview() {
  return (
    <div className="flex size-full flex-col gap-1.5 bg-[#1b2233] p-2.5 text-[8px] leading-tight font-medium text-[#dbe3f7]">
      <Line time="0:02">Here is the new flow.</Line>
      <Line time="0:05">
        <span className="rounded-sm bg-[rgb(239_68_68/0.25)] px-0.5 text-[#fca5a5] line-through">
          Um, let me start again.
        </span>
      </Line>
      <Line time="0:09">First, pick a workspace.</Line>
      <div className="mt-1 flex h-4 w-[148px] gap-0.5">
        <span className="flex-[3] rounded-sm bg-[#60a5fa]" />
        <span className="flex-1 rounded-sm bg-[rgb(239_68_68/0.5)]" />
        <span className="flex-[4] rounded-sm bg-[#60a5fa]" />
      </div>
    </div>
  );
}

function Filler({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-sm bg-[rgb(239_68_68/0.25)] px-0.5 text-[#fca5a5] line-through">
      {children}
    </span>
  );
}

export function FillerPreview() {
  return (
    <div className="flex size-full flex-col gap-1.5 bg-[#1b2233] p-2.5 text-[8px] leading-tight font-medium text-[#dbe3f7]">
      <Line time="0:02">
        <Filler>Um,</Filler> here is the new flow.
      </Line>
      <Line time="0:05">
        First, <Filler>uh,</Filler> pick a workspace.
      </Line>
      <Line time="0:09">
        Then, <Filler>um,</Filler> share the link.
      </Line>
      <div className="mt-1 flex h-4 w-[148px] gap-0.5">
        <span className="w-1.5 rounded-sm bg-[rgb(239_68_68/0.5)]" />
        <span className="flex-[3] rounded-sm bg-[#60a5fa]" />
        <span className="w-1.5 rounded-sm bg-[rgb(239_68_68/0.5)]" />
        <span className="flex-[3] rounded-sm bg-[#60a5fa]" />
        <span className="w-1.5 rounded-sm bg-[rgb(239_68_68/0.5)]" />
        <span className="flex-[2] rounded-sm bg-[#60a5fa]" />
      </div>
    </div>
  );
}

export function CameraPreview() {
  return (
    <div className="relative size-full bg-[linear-gradient(135deg,#6d4fb3,#2f80ff)]">
      <Photo
        src="/presenter-updates.webp"
        className="top-3 left-3 size-[68px]"
      />
      <div className="absolute top-3 left-[92px] grid grid-cols-2 gap-1.5">
        <span className="size-6 rounded-md bg-[linear-gradient(135deg,#f97316,#ef4444)] ring-1 ring-white" />
        <span className="size-6 rounded-md bg-[linear-gradient(135deg,#10b981,#0ea5e9)]" />
        <span className="size-6 rounded-md bg-[#e5e5e5]" />
        <span className="size-6 rounded-md bg-[#181818]" />
      </div>
    </div>
  );
}

export function CanvasPreview() {
  return (
    <div className="relative size-full bg-[#fafafa] [background-image:radial-gradient(#d4d4d4_1px,transparent_1px)] [background-size:10px_10px]">
      <svg
        viewBox="0 0 192 120"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="absolute inset-0 size-full"
      >
        <path
          d="M12 58c10-22 20-22 28-6s16 16 26-4 18-16 26 2"
          stroke="#1184f7"
          strokeWidth="2.5"
        />
        <path
          d="M100 44l26-16m-10 0l10 0-3 10"
          stroke="#ef4444"
          strokeWidth="2"
        />
      </svg>
      <span className="absolute top-2.5 left-2.5 rounded-sm bg-[#fde68a] px-1.5 py-1 text-[8px] leading-none font-semibold text-[#181818]">
        Step 1
      </span>
      <Photo
        src="/presenter-design.webp"
        className="right-[30px] bottom-[38px] size-10"
      />
    </div>
  );
}

export function ScreenshotsPreview() {
  return (
    <div className="relative size-full bg-white p-2.5">
      <div className="h-1.5 w-20 rounded-full bg-[#d4d4d4]" />
      <div className="mt-1.5 h-1.5 w-28 rounded-full bg-[#e5e5e5]" />
      <div className="mt-2.5 text-[8px] leading-none font-medium text-[#555555] blur-[2.5px]">
        jane@example.com
      </div>
      <div className="relative mt-2.5 h-4 w-16 rounded-full bg-[#1184f7]">
        <span className="absolute -inset-1 rounded-full ring-[1.5px] ring-[#ef4444]" />
      </div>
      <svg
        viewBox="0 0 192 120"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="absolute inset-0 size-full"
      >
        <path
          d="M122 46L84 62m8-8l-8 8 11 2"
          stroke="#ef4444"
          strokeWidth="2"
        />
      </svg>
      <span className="absolute top-8 left-[110px] text-[8px] leading-none font-semibold text-[#ef4444]">
        Move this
      </span>
    </div>
  );
}

export function FeedbackPreview() {
  return (
    <div className="relative size-full bg-[#3b2a4f]">
      <DummyApp className="opacity-40" />
      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 rounded-[10px_10px_10px_3px] bg-white py-1 pr-2 pl-1 text-[8px] leading-none font-semibold text-[#181818]">
        <span className="flex size-4 items-center justify-center rounded-full bg-[#f59e0b] text-[6px] font-bold text-white">
          MR
        </span>
        Love this flow
      </div>
      <div className="absolute top-10 left-2.5 flex gap-1">
        {["🔥", "👏", "❤️"].map((emoji) => (
          <span
            key={emoji}
            className="flex size-[22px] items-center justify-center rounded-full bg-white text-xs leading-none"
          >
            {emoji}
          </span>
        ))}
      </div>
    </div>
  );
}

const DEMO_CHAPTERS = [
  ["0:00", "Intro"],
  ["0:24", "Pick a workspace"],
];

export function SummaryPreview() {
  return (
    <div className="flex size-full flex-col gap-1 bg-white p-2.5 text-[8px] leading-tight font-medium text-[#181818]">
      <p className="text-[10px] font-bold">How to invite your team</p>
      <p className="mb-1 text-black/55">
        Pick a workspace, then share the link.
      </p>
      {DEMO_CHAPTERS.map(([time, name]) => (
        <Line key={time} time={time!}>
          {name}
        </Line>
      ))}
    </div>
  );
}
