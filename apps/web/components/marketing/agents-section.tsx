"use client";

import type { SectionProps } from "./_shared";
import { fill } from "@/lib/i18n/fill";
import { DOCS_URL } from "@/lib/site";
import { cn } from "@/lib/utils";
import { AskScene, RecordScene, ShareScene, VoiceScene } from "./agent-scenes";
import {
  CARD_GRAY,
  CARD_ZOOM,
  FRAME_CARD,
  FRAME_CELL,
  FRAME_CELLS,
  FrameHeader,
  FrameSection,
  PillLink,
} from "./frame";
import { ClaudeLogo, CursorLogo, OpenAILogo } from "./platform-logos";
import { useMessages } from "./i18n-provider";
import { McpConnectDetails } from "./mcp-connect";

const AGENT_LOGO = "mr-1 inline-block size-[19px] align-middle";
const SCENES = [AskScene, RecordScene, VoiceScene, ShareScene];

export function AgentsSection({
  headingLevel = 2,
  hideHeading = false,
}: SectionProps & { hideHeading?: boolean } = {}) {
  const m = useMessages();
  const steps = m.agents.steps;
  return (
    <FrameSection id="agents">
      {!hideHeading && (
        <FrameHeader
          title={m.agents.heading}
          subtitle={
            <>
              <span className="font-medium text-fg">
                {fill(m.agents.worksWith, {
                  claude: (
                    <>
                      <ClaudeLogo className={AGENT_LOGO} />
                      Claude Code, Claude
                    </>
                  ),
                  openai: (
                    <>
                      <OpenAILogo className={AGENT_LOGO} />
                      Codex, ChatGPT
                    </>
                  ),
                  cursor: (
                    <>
                      <CursorLogo className={AGENT_LOGO} />
                      Cursor
                    </>
                  ),
                })}
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
      )}
      <ol
        className={cn(FRAME_CELLS, "list-none md:grid-cols-2 lg:grid-cols-4")}
      >
        {steps.map((step, i) => {
          const Scene = SCENES[i - 1];
          return Scene ? (
            <li
              key={step.title}
              className={cn(FRAME_CELL, FRAME_CARD, "flex flex-col")}
            >
              <div className="flex flex-col gap-1.5 p-5">
                <h3 className="flex items-center gap-2 text-base font-medium text-fg-strong">
                  <StepNumber number={i + 1} />
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-fg-muted">
                  {step.body}
                </p>
              </div>
              <div
                className={cn(CARD_ZOOM, CARD_GRAY, "mt-auto origin-bottom")}
              >
                <Scene />
              </div>
            </li>
          ) : (
            <li
              key={step.title}
              className={cn(
                FRAME_CELL,
                "col-span-full grid gap-6 p-6 md:grid-cols-[2fr_3fr] md:gap-12 md:px-12 md:py-10",
              )}
            >
              <div>
                <h3 className="flex items-center gap-3 text-2xl font-medium tracking-[-0.03em] text-fg-strong">
                  <StepNumber number={i + 1} />
                  {step.title}
                </h3>
                <p className="mt-3 text-[15px] leading-relaxed text-fg-muted">
                  {step.body}
                </p>
              </div>
              <div className="min-w-0">
                <McpConnectDetails />
              </div>
            </li>
          );
        })}
      </ol>
    </FrameSection>
  );
}

function StepNumber({ number }: { number: number }) {
  return (
    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-bg font-mono text-xs font-semibold tracking-normal text-white tabular-nums">
      {number}
    </span>
  );
}
