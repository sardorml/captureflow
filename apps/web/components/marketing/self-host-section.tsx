"use client";

import type { ReactNode } from "react";
import { ArrowRight, Database, HardDrive, Zap } from "lucide-react";
import { DOCS_URL, SOURCE_REPO_URL } from "@/lib/site";
import { MarketingSection, SectionHeading } from "./_shared";
import { useMessages } from "./i18n-provider";
import { CloudflareLogo, GitHubIcon } from "./platform-logos";

const CLOUDFLARE_ORANGE = "#F38020";

const DEPLOY_STEPS = [
  "wrangler d1 create captureflow",
  "wrangler r2 bucket create captureflow-recordings",
  "pnpm cf:deploy",
];

export function SelfHostSection() {
  const copy = useMessages().selfHosting;

  return (
    <MarketingSection id="self-host">
      <SectionHeading
        title={
          <>
            {copy.heading}{" "}
            <span className="inline-flex -rotate-1 items-center gap-2 rounded-2xl bg-fg px-3 pb-1 text-canvas">
              <CloudflareLogo className="size-[0.9em] translate-y-[0.06em]" />
              Cloudflare
            </span>
          </>
        }
        subtitle={copy.subheading}
      />

      <div className="mx-auto grid max-w-215 gap-3 rounded-3xl bg-panel p-3 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <Terminal done={copy.deployed} />

        <div className="rounded-2xl border border-dashed border-line-strong p-4 sm:p-5">
          <p className="flex items-center gap-2 text-sm font-medium text-fg">
            <CloudflareLogo className="size-5" />
            {copy.account}
          </p>
          <div className="mt-4 flex flex-col">
            <Resource
              icon={<Zap size={18} />}
              kind={copy.pieces.workers.title}
              name="captureflow-web"
              body={copy.pieces.workers.body}
            />
            <div className="grid grid-cols-2 gap-3">
              <Connector />
              <Connector />
              <Resource
                icon={<HardDrive size={18} />}
                kind={copy.pieces.r2.title}
                name="captureflow-recordings"
                body={copy.pieces.r2.body}
              />
              <Resource
                icon={<Database size={18} />}
                kind={copy.pieces.d1.title}
                name="captureflow"
                body={copy.pieces.d1.body}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm font-medium text-fg">
        <a
          href={`${DOCS_URL}/self-hosting`}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-1.5"
        >
          {copy.guide}
          <ArrowRight
            size={15}
            className="transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
          />
        </a>
        <a
          href={SOURCE_REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-fg-muted transition-colors hover:text-fg"
        >
          <GitHubIcon size={16} />
          {copy.source}
        </a>
      </div>
    </MarketingSection>
  );
}

function Terminal({ done }: { done: string }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-[#0d0d0c] font-mono text-[13px] leading-relaxed [[data-theme=light]_&]:bg-[#1c1b19]">
      <div className="flex items-center gap-1.5 px-4 pt-3.5 pb-2">
        <span className="size-2.5 rounded-full bg-[#ff5f57]" />
        <span className="size-2.5 rounded-full bg-[#febc2e]" />
        <span className="size-2.5 rounded-full bg-[#28c840]" />
      </div>
      <div className="flex flex-1 flex-col gap-2.5 overflow-x-auto px-4 pt-2 pb-5 text-[#d6d3cb]">
        {DEPLOY_STEPS.map((step) => (
          <p key={step} className="whitespace-nowrap">
            <span className="text-[#7d786d] select-none">$ </span>
            {step}
          </p>
        ))}
        <p className="whitespace-nowrap" style={{ color: CLOUDFLARE_ORANGE }}>
          ✓ {done}
        </p>
      </div>
    </div>
  );
}

function Resource({
  icon,
  kind,
  name,
  body,
}: {
  icon: ReactNode;
  kind: string;
  name: string;
  body: string;
}) {
  return (
    <div className="rounded-xl bg-panel-2 p-3.5">
      <div className="flex items-center gap-2.5">
        <span
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#F38020]/15"
          style={{ color: CLOUDFLARE_ORANGE }}
        >
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-xs text-fg-muted">{kind}</p>
          <p className="font-mono text-[13px] break-all text-fg">{name}</p>
        </div>
      </div>
      <p className="mt-2.5 text-sm leading-snug text-fg/80">{body}</p>
    </div>
  );
}

function Connector() {
  return (
    <span
      aria-hidden
      className="mx-auto h-4 w-px border-l border-dashed border-line-strong"
    />
  );
}
