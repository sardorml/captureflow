import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  Building2,
  ChevronDown,
  ExternalLink,
  LogIn,
  User,
} from "lucide-react";
import AnimatedTooltip from "@/components/ui/animated-tooltip";
import logoRound from "@/assets/logo-round.png";
import type {
  RecordingAuthState,
  RecordingUsageState,
  WorkspacesState,
} from "../../../../shared/types";

type NudgeAction = "signin" | "upgrade" | "dashboard";

type NudgeTone = "info" | "warn" | "alert";

type Nudge = {
  text: string;
  tone: NudgeTone;
  action: NudgeAction;
};

const WARN_THRESHOLD = 0.8;

function formatStorage(b: number): string {
  const mb = b / (1024 * 1024);
  if (mb >= 1024) {
    const gb = mb / 1024;
    if (gb >= 10) return `${Math.round(gb)} GB`;
    return `${Math.round(gb * 10) / 10} GB`;
  }
  if (mb >= 10) return `${Math.round(mb)} MB`;
  return `${Math.round(mb * 10) / 10} MB`;
}

function computeNudge(
  auth: RecordingAuthState,
  usage: RecordingUsageState,
): Nudge | null {
  if (auth.kind === "signed_out") {
    return {
      text: "Sign in to get a public recording link",
      tone: "info",
      action: "signin",
    };
  }
  if (usage.kind === "known" && !usage.isDev) {
    if (usage.capReached) {
      return {
        text: "Storage full — upgrade to share more",
        tone: "alert",
        action: "upgrade",
      };
    }
    if (usage.limitBytes > 0) {
      const ratio = usage.usedBytes / usage.limitBytes;
      const tone: NudgeTone = ratio >= WARN_THRESHOLD ? "warn" : "info";
      return {
        text: `${formatStorage(usage.usedBytes)} of ${formatStorage(usage.limitBytes)} cloud used`,
        tone,
        action: "dashboard",
      };
    }
  }
  // Neutral fallback (boot probe, dev build, or no quota yet) so the toolbar
  // never goes blank in Recording mode.
  return {
    text: "Recording mode · instant link",
    tone: "info",
    action: "dashboard",
  };
}

function actionDetails(action: NudgeAction): {
  tooltip: string;
  ariaLabel: string;
  icon: React.ReactNode;
  onClick: () => void;
} {
  if (action === "signin") {
    return {
      tooltip: "Sign in",
      ariaLabel: "Sign in to CaptureFlow",
      icon: <LogIn className="h-3.5 w-3.5" strokeWidth={2} />,
      onClick: () => {
        window.electronAPI.signInRecordingAuth().catch(() => {});
      },
    };
  }
  if (action === "upgrade") {
    // Dashboard rather than the checkout: it offers both upgrade and the
    // "free up space" path, the more common fix here.
    return {
      tooltip: "Manage storage",
      ariaLabel: "Manage storage on CaptureFlow dashboard",
      icon: <ExternalLink className="h-3.5 w-3.5" strokeWidth={2} />,
      onClick: () => {
        window.electronAPI.openRecordingDashboard().catch(() => {});
      },
    };
  }
  return {
    tooltip: "Open dashboard",
    ariaLabel: "Open CaptureFlow dashboard",
    icon: <ExternalLink className="h-3.5 w-3.5" strokeWidth={2} />,
    onClick: () => {
      window.electronAPI.openRecordingDashboard().catch(() => {});
    },
  };
}

function toneColor(tone: NudgeTone): string {
  if (tone === "alert") return "rgba(251, 191, 36, 0.95)"; // amber-400
  if (tone === "warn") return "rgba(252, 211, 77, 0.9)"; // amber-300
  return "rgb(255, 255, 255)";
}

export function ToolbarStatusNudge({
  visible,
}: {
  visible: boolean;
}): React.JSX.Element | null {
  const [auth, setAuth] = useState<RecordingAuthState>({ kind: "signed_out" });
  const [usage, setUsage] = useState<RecordingUsageState>({ kind: "unknown" });
  const [workspaces, setWorkspaces] = useState<WorkspacesState>({
    kind: "unknown",
  });

  useEffect(() => {
    void window.electronAPI.getRecordingAuth().then(setAuth);
    return window.electronAPI.onRecordingAuthChanged(setAuth);
  }, []);

  useEffect(() => {
    void window.electronAPI.getRecordingUsage().then(setUsage);
    return window.electronAPI.onRecordingUsageChanged(setUsage);
  }, []);

  useEffect(() => {
    void window.electronAPI.getWorkspaces().then(setWorkspaces);
    return window.electronAPI.onWorkspacesChanged(setWorkspaces);
  }, []);

  if (!visible) return null;
  const nudge = computeNudge(auth, usage);
  if (!nudge) return null;

  // Hidden during the boot probe so a stale paint doesn't flash the wrong name.
  const showWorkspaceChip =
    auth.kind === "signed_in" &&
    workspaces.kind === "known" &&
    workspaces.workspaces.length > 0;

  const { tooltip, ariaLabel, icon, onClick } = actionDetails(nudge.action);

  return (
    <motion.div
      className="select-none flex items-center gap-1.5"
      initial={false}
      animate={{ opacity: 1, pointerEvents: "auto" }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
    >
      <img
        src={logoRound}
        alt=""
        draggable={false}
        className="h-7 w-7 shrink-0 rounded-full select-none"
      />
      {/* data-toolbar-hit is required: without it the cursor poll keeps
          ignore-mouse on over the pill and the icon button never sees clicks. */}
      <span
        data-toolbar-hit
        className="flex h-7 items-center gap-1.5 rounded-full bg-neutral-700 pl-2.5 pr-1 text-[13px] font-normal tracking-tight whitespace-nowrap ring-1 ring-white/10"
        style={{ color: toneColor(nudge.tone) }}
      >
        <span aria-hidden className="toolbar-nudge-twinkle">
          ✦
        </span>
        <span>{nudge.text}</span>
        <AnimatedTooltip content={tooltip} placement="top">
          <button
            type="button"
            onClick={onClick}
            className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full text-white/55 transition-colors hover:bg-white/10 hover:text-white"
            aria-label={ariaLabel}
          >
            {icon}
          </button>
        </AnimatedTooltip>
      </span>
      {showWorkspaceChip && workspaces.kind === "known" && (
        <WorkspaceChip state={workspaces} />
      )}
    </motion.div>
  );
}

// Uses a native <select> overlay: the custom motion dropdown got clipped and
// lost click-through inside the toolbar BrowserWindow.
function WorkspaceChip({
  state,
}: {
  state: Extract<WorkspacesState, { kind: "known" }>;
}): React.JSX.Element {
  const active =
    state.workspaces.find((w) => w.id === state.activeId) ??
    state.workspaces[0];
  const onlyOne = state.workspaces.length === 1;
  const Icon = active.kind === "team" ? Building2 : User;

  const labelText =
    active.name.length > 22 ? `${active.name.slice(0, 21)}…` : active.name;

  return (
    <div
      data-toolbar-hit
      className="relative flex h-7 items-center gap-1.5 rounded-full bg-neutral-700 pl-2.5 pr-3 text-[13px] font-normal tracking-tight whitespace-nowrap text-white ring-1 ring-white/10"
    >
      <Icon className="h-4 w-4 shrink-0 text-white/55" strokeWidth={2} />
      <span className="pointer-events-none">{labelText}</span>
      {!onlyOne && (
        <ChevronDown
          className="h-3.5 w-3.5 shrink-0 text-white/45"
          strokeWidth={2.25}
        />
      )}
      {/* Transparent native <select> over the styled chip: takes the clicks
          and lets the OS draw the picker. */}
      <select
        aria-label="Active workspace"
        value={active.id}
        disabled={onlyOne}
        onChange={(e) => {
          const id = e.target.value;
          if (id !== active.id) {
            window.electronAPI.selectWorkspace(id).catch(() => {});
          }
        }}
        className="absolute inset-0 cursor-pointer rounded-full opacity-0 disabled:cursor-default"
      >
        {state.workspaces.map((w) => (
          <option key={w.id} value={w.id}>
            {w.name}
          </option>
        ))}
      </select>
    </div>
  );
}
