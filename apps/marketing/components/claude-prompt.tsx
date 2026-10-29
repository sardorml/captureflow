"use client";

import { Button } from "@heroui/react";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { KIND_DIR, type MediaKind } from "@/lib/media";

const NOUN = { image: "image", gif: "GIF", video: "video scene" } as const;

function buildPrompt(kind: MediaKind, idea: string): string {
  const where =
    kind === "video"
      ? "add it as a scene in hyperframes/compositions/ mounted from hyperframes/index.html"
      : `save it as hyperframes/${KIND_DIR[kind]}/<short-name>.html`;
  return [
    `In apps/marketing, make a new ${NOUN[kind]} with HyperFrames: ${idea.trim() || "<describe it>"}.`,
    `Follow apps/marketing/hyperframes/CLAUDE.md, ${where}, run pnpm check, look at the frames,`,
    `then render it into the library with pnpm make.`,
  ].join(" ");
}

export function ClaudePrompt({ kind }: { kind: MediaKind }) {
  const [idea, setIdea] = useState("");
  const [copied, setCopied] = useState(false);
  const prompt = buildPrompt(kind, idea);

  const onCopy = async () => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-line bg-panel p-5">
      <div>
        <p className="font-medium text-fg">Create with Claude Code</p>
        <p className="text-sm text-fg-muted">
          Describe the {NOUN[kind]}, copy the prompt into Claude Code, and the
          result shows up here.
        </p>
      </div>
      <textarea
        value={idea}
        onChange={(e) => setIdea(e.target.value)}
        rows={2}
        placeholder={`What should the ${NOUN[kind]} show?`}
        className="w-full resize-none rounded-xl border border-line bg-canvas px-3 py-2 text-sm text-fg outline-none placeholder:text-fg-muted focus:border-accent"
      />
      <div className="flex items-start gap-3">
        <p className="min-w-0 flex-1 rounded-xl bg-canvas px-3 py-2 font-mono text-xs leading-5 text-fg-muted">
          {prompt}
        </p>
        <Button size="sm" variant="secondary" onPress={onCopy}>
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
    </section>
  );
}
