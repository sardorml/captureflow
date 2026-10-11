"use client";

import type { ReactNode } from "react";
import NextLink from "next/link";
import { buttonVariants } from "@heroui/react";
import { track } from "@/lib/marketing/track";
import { ArrowRight, BookOpen, Database, HardDrive, Zap } from "lucide-react";
import { DOCS_URL, SOURCE_REPO_URL } from "@/lib/site";
import { MarketingSection, SectionHeading } from "./_shared";
import { useLocalizedHref, useMessages } from "./i18n-provider";
import { CloudflareLogo, GitHubIcon } from "./platform-logos";

const LINK_PILL =
  "inline-flex h-10 items-center gap-2 rounded-full border border-line px-4 text-sm font-medium text-fg-muted transition-colors hover:bg-panel hover:text-fg motion-reduce:transition-none";

const DEPLOY_STEPS = [
  "wrangler d1 create captureflow",
  "wrangler r2 bucket create captureflow-recordings",
  "pnpm cf:deploy",
];

export function SelfHostSection() {
  const copy = useMessages().selfHosting;
  const lh = useLocalizedHref();

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
              kind={copy.pieces.workers.kind}
              name={copy.pieces.workers.title}
              body={copy.pieces.workers.body}
            />
            <div className="grid grid-cols-2 gap-3">
              <Connector />
              <Connector />
              <Resource
                icon={<HardDrive size={18} />}
                kind={copy.pieces.r2.kind}
                name={copy.pieces.r2.title}
                body={copy.pieces.r2.body}
              />
              <Resource
                icon={<Database size={18} />}
                kind={copy.pieces.d1.kind}
                name={copy.pieces.d1.title}
                body={copy.pieces.d1.body}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-3 flex max-w-215 flex-col gap-5 rounded-3xl bg-panel p-5 sm:flex-row sm:items-center sm:p-6">
        <span
          aria-hidden
          className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-panel-2 text-2xl"
        >
          🚀
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-lg font-semibold tracking-[-0.01em] text-fg">
            {copy.setup.title}
          </p>
          <p className="mt-1 text-base leading-relaxed text-balance text-fg/80">
            {copy.setup.body}
          </p>
        </div>
        <NextLink
          href={lh("/self-host-setup")}
          onClick={() =>
            track("marketing_cta_clicked", { location: "self_host_setup" })
          }
          className={buttonVariants({
            variant: "tertiary",
            size: "lg",
            className:
              "group h-12 shrink-0 gap-2 rounded-full px-6 font-medium [--button-bg:var(--cf-inverse)] [--button-bg-hover:#e5e5e5] [--button-bg-pressed:#d4d4d4] [--button-fg:var(--cf-on-inverse)]",
          })}
        >
          {copy.setup.cta}
          <ArrowRight
            size={17}
            className="transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
          />
        </NextLink>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <a
          href={`${DOCS_URL}/self-hosting/overview`}
          target="_blank"
          rel="noopener noreferrer"
          className={LINK_PILL}
        >
          <BookOpen size={16} />
          {copy.guide}
        </a>
        <a
          href={SOURCE_REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={LINK_PILL}
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
        <p className="whitespace-nowrap text-[#4aa3ff]">✓ {done}</p>
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
      <div className="flex items-center gap-2">
        <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent">
          {icon}
        </span>
        <p className="text-xs whitespace-nowrap text-fg-muted">{kind}</p>
      </div>
      <p className="mt-2 font-semibold text-fg">{name}</p>
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
