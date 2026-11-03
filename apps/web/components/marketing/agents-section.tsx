"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { SectionProps } from "./_shared";
import { DOCS_URL } from "@/lib/site";
import { FrameHeader, FrameSection, PillLink } from "./frame";
import { ClaudeLogo, CursorLogo, OpenAILogo } from "./platform-logos";
import { useMessages } from "./i18n-provider";
import { McpConnectDetails } from "./mcp-connect";
import { useReducedMotion } from "./modes-intro";

const AGENT_LOGO = "mr-1 inline-block size-[19px] align-middle";
const WORD_MS = 2200;
const WORD_COLORS = ["#2f80ff", "#10b981", "#f97316", "#8b5cf6"];

function RotatingWord({ words }: { words: readonly string[] }) {
  const reducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (reducedMotion) return;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % words.length),
      WORD_MS,
    );
    return () => clearInterval(id);
  }, [reducedMotion, words.length]);
  return (
    <span className="inline-grid justify-items-start">
      <AnimatePresence initial={false}>
        <motion.span
          key={words[index]}
          className="[grid-area:1/1]"
          style={{ color: WORD_COLORS[index % WORD_COLORS.length] }}
          initial={{ y: "0.25em", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-0.25em", opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function AgentsSection({ headingLevel = 2 }: SectionProps = {}) {
  const m = useMessages();
  const steps = m.agents.steps;
  return (
    <FrameSection id="agents">
      <FrameHeader
        title={
          <>
            {m.agents.heading} <RotatingWord words={m.agents.headingWords} />
          </>
        }
        subtitle={
          <>
            <span className="font-medium text-fg">
              <ClaudeLogo className={AGENT_LOGO} />
              Claude Code, <OpenAILogo className={AGENT_LOGO} />
              Codex and <CursorLogo className={AGENT_LOGO} />
              Cursor.
            </span>{" "}
            <span className="text-fg-muted">{m.agents.subtitle}</span>
          </>
        }
        action={
          <PillLink href={`${DOCS_URL}/guide/local-agent`}>
            {m.agents.cta}
          </PillLink>
        }
        level={headingLevel}
      />
      <ol className="flex list-none flex-col gap-8 px-6 pb-16 md:gap-10 md:px-12">
        {steps.map((step, i) => (
          <li
            key={step.title}
            className="grid gap-3 md:grid-cols-[1fr_3fr] md:gap-8"
          >
            <div className="flex items-baseline gap-4">
              <span className="font-mono text-xs text-fg-subtle tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="text-base font-medium text-fg-strong">
                {step.title}
              </h3>
            </div>
            <div className="flex min-w-0 flex-col gap-4">
              <p className="text-[15px] leading-relaxed text-fg-muted">
                {step.body}
              </p>
              {i === 0 && <McpConnectDetails />}
            </div>
          </li>
        ))}
      </ol>
    </FrameSection>
  );
}
