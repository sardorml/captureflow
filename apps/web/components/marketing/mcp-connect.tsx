"use client";

import { useState, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";
import { APP_WEB_SITE_URL } from "@/lib/site";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ClaudeLogo, CursorLogo, OpenAILogo } from "./platform-logos";
import { useMessages } from "./i18n-provider";

const MCP_URL = `${APP_WEB_SITE_URL}/mcp`;

const CURSOR_INSTALL = `cursor://anysphere.cursor-deeplink/mcp/install?name=captureflow&config=${btoa(
  JSON.stringify({ url: MCP_URL }),
)}`;

const AGENTS: { name: string; logo: ReactNode; command?: string }[] = [
  {
    name: "Claude Code",
    logo: <ClaudeLogo className="size-4" />,
    command: `claude mcp add --transport http captureflow ${MCP_URL}`,
  },
  {
    name: "Codex",
    logo: <OpenAILogo className="size-4" />,
    command: `codex mcp add captureflow --url ${MCP_URL}`,
  },
  { name: "Cursor", logo: <CursorLogo className="size-4" /> },
];

function CopyCommand({ command }: { command: string }) {
  const m = useMessages();
  const [copied, setCopied] = useState(false);
  const copy = () => {
    void navigator.clipboard.writeText(command).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <div className="flex w-full min-w-0 flex-1 items-center gap-2 rounded-lg bg-tint px-3 py-2">
      <code className="min-w-0 flex-1 overflow-x-auto text-left font-mono text-[13px] whitespace-nowrap text-fg [scrollbar-width:none]">
        {command}
      </code>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? m.hero.mcpCopied : m.hero.mcpCopy}
        className="shrink-0 text-fg-muted transition-colors hover:text-fg-strong"
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}
      </button>
    </div>
  );
}

// One agent at a time: its tab, then the one line that adds the server.
export function McpConnectDetails() {
  const m = useMessages();
  const [picked, setPicked] = useState(0);
  const agent = AGENTS[picked]!;
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-wrap gap-1.5">
        {AGENTS.map((a, i) => (
          <button
            key={a.name}
            type="button"
            onClick={() => setPicked(i)}
            aria-pressed={i === picked}
            className={cn(
              "flex h-8 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium transition-colors",
              i === picked
                ? "bg-fg-strong text-canvas"
                : "bg-tint text-fg-muted hover:text-fg-strong",
            )}
          >
            {a.logo}
            {a.name}
          </button>
        ))}
      </div>
      {agent.command ? (
        <CopyCommand command={agent.command} />
      ) : (
        <a
          href={CURSOR_INSTALL}
          className={cn(
            buttonVariants({ variant: "secondary", size: "sm" }),
            "w-fit rounded-lg",
          )}
        >
          {m.hero.mcpAddToCursor}
        </a>
      )}
    </div>
  );
}
