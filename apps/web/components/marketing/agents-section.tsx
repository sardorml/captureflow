"use client";

import type { SectionProps } from "./_shared";
import { DOCS_URL } from "@/lib/site";
import { FrameHeader, FrameSection, PillLink } from "./frame";
import { ClaudeLogo, CursorLogo, OpenAILogo } from "./platform-logos";
import { useMessages } from "./i18n-provider";
import { McpConnectDetails } from "./mcp-connect";

const AGENT_LOGO = "mr-1 inline-block size-[19px] align-middle";

export function AgentsSection({ headingLevel = 2 }: SectionProps = {}) {
  const m = useMessages();
  const steps = m.agents.steps;
  return (
    <FrameSection id="agents">
      <FrameHeader
        title={m.agents.heading}
        subtitle={
          <>
            <span className="font-medium text-fg">
              Works with <ClaudeLogo className={AGENT_LOGO} />
              Claude Code, Claude, <OpenAILogo className={AGENT_LOGO} />
              Codex, ChatGPT and <CursorLogo className={AGENT_LOGO} />
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
