"use client";

import { useState, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { MARKETING_SITE_URL } from "@/lib/site";
import { cn } from "@/lib/utils";
import { ClaudeLogo, CursorLogo, OpenAILogo } from "./platform-logos";
import { useMessages } from "./i18n-provider";

const NPX_ARGS = ["-y", "@captureflow/mcp"];
const NPX_COMMAND = `npx ${NPX_ARGS.join(" ")}`;
const HOSTED_MCP_URL = `${MARKETING_SITE_URL}/mcp`;

const CURSOR_INSTALL = `cursor://anysphere.cursor-deeplink/mcp/install?name=captureflow&config=${btoa(
  JSON.stringify({ command: "npx", args: NPX_ARGS }),
)}`;

const AGENTS: {
  name: string;
  logo: ReactNode;
  command?: string;
  chat?: "claude" | "chatgpt";
}[] = [
  {
    name: "Claude Code",
    logo: <ClaudeLogo className="size-4" />,
    command: `claude mcp add captureflow -- ${NPX_COMMAND}`,
  },
  {
    name: "Codex",
    logo: <OpenAILogo className="size-4" />,
    command: `codex mcp add captureflow -- ${NPX_COMMAND}`,
  },
  { name: "Cursor", logo: <CursorLogo className="size-4" /> },
  {
    name: "Claude",
    logo: <ClaudeLogo className="size-4" />,
    command: HOSTED_MCP_URL,
    chat: "claude",
  },
  {
    name: "ChatGPT",
    logo: <OpenAILogo className="size-4" />,
    command: HOSTED_MCP_URL,
    chat: "chatgpt",
  },
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
    <div className="flex w-full min-w-0 items-center gap-2 rounded-lg bg-tint px-3 py-2">
      <code className="min-w-0 flex-1 text-left font-mono text-[13px] [overflow-wrap:anywhere] text-fg">
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

// One agent at a time: its tab, then what adds the server. Chat apps can't run
// npx, so they connect to the hosted server by URL.
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
      {/* Every panel shares one grid cell, so the tallest sets the height and
          switching tabs doesn't move the page. */}
      <div className="grid">
        {AGENTS.map((a) => (
          <div
            key={a.name}
            className={cn(
              "col-start-1 row-start-1 flex min-w-0 flex-col items-start gap-2.5",
              a !== agent && "invisible",
            )}
          >
            {a.chat && (
              <p className="text-[13px] leading-relaxed text-fg-muted">
                {m.agents.chats[a.chat]}
              </p>
            )}
            {a.command ? (
              <CopyCommand command={a.command} />
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
            {a.chat && (
              <p className="text-[13px] leading-relaxed text-fg-muted">
                {m.agents.chats.limits}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
