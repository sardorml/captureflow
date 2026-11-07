"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUp, Globe } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FadeInImage } from "@/components/ui/fade-in-image";
import { Spinner } from "@/components/ui/spinner";
import {
  checkSwarmDemoAction,
  startSwarmDemoAction,
  type SwarmDemoErrorCode,
} from "@/app/swarm-demo/actions";
import type { SitePreview } from "@/lib/swarm-demo";
import { track } from "@/lib/marketing/track";
import { MarketingSection, SectionHeading } from "./_shared";
import { useLocalizedHref, useMessages } from "./i18n-provider";

type HowKey = "type" | "build" | "share";

const SWARM = {
  blue: "#2f7df6",
  green: "#22c55e",
  orange: "#f97316",
  purple: "#a855f7",
};

// The arrow the agents use in the video, tip at (x, y).
function SwarmCursor({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <path
      transform={`translate(${x} ${y})`}
      d="M0 0v17l4.5-4 3 6.5 3-1.5-3-6.5H13z"
      fill={color}
      stroke="#fff"
      strokeWidth={1.4}
      strokeLinejoin="round"
    />
  );
}

function AddressArt() {
  return (
    <svg viewBox="0 0 96 56" aria-hidden="true" className="h-full w-full">
      <rect
        x="8"
        y="16"
        width="80"
        height="20"
        rx="10"
        className="fill-panel stroke-line-strong"
      />
      <circle
        cx="19"
        cy="26"
        r="4.5"
        fill="none"
        className="stroke-fg-muted"
        strokeWidth="1.4"
      />
      <rect x="28" y="24" width="34" height="4" rx="2" className="fill-fg/40" />
      <rect x="64" y="20" width="1.6" height="12" rx="0.8" fill={SWARM.blue} />
      <SwarmCursor x={66} y={30} color={SWARM.blue} />
    </svg>
  );
}

function BuildArt() {
  return (
    <svg viewBox="0 0 96 56" aria-hidden="true" className="h-full w-full">
      <rect x="10" y="9" width="40" height="6" rx="3" className="fill-fg/40" />
      <rect x="10" y="20" width="26" height="4" rx="2" className="fill-fg/25" />
      <rect
        x="10"
        y="30"
        width="34"
        height="17"
        rx="4"
        className="fill-panel stroke-line-strong"
      />
      <rect
        x="58"
        y="9"
        width="28"
        height="38"
        rx="4"
        fill="none"
        className="stroke-line-strong"
        strokeDasharray="3 3"
      />
      <SwarmCursor x={44} y={8} color={SWARM.blue} />
      <SwarmCursor x={30} y={36} color={SWARM.green} />
      <SwarmCursor x={70} y={20} color={SWARM.orange} />
      <SwarmCursor x={60} y={34} color={SWARM.purple} />
    </svg>
  );
}

function LinkArt() {
  return (
    <svg viewBox="0 0 96 56" aria-hidden="true" className="h-full w-full">
      <rect
        x="12"
        y="16"
        width="62"
        height="20"
        rx="10"
        className="fill-panel stroke-line-strong"
      />
      <g
        fill="none"
        className="stroke-fg-muted"
        strokeWidth="1.6"
        strokeLinecap="round"
      >
        <path d="M24.5 28.5l-1.3 1.3a3 3 0 0 1-4.2-4.2l2.6-2.6a3 3 0 0 1 4.2 0" />
        <path d="M25.5 23.5l1.3-1.3a3 3 0 0 1 4.2 4.2l-2.6 2.6a3 3 0 0 1-4.2 0" />
      </g>
      <rect x="36" y="24" width="28" height="4" rx="2" className="fill-fg/40" />
      <SwarmCursor x={62} y={28} color={SWARM.green} />
    </svg>
  );
}

const HOW: { key: HowKey; art: ReactNode }[] = [
  { key: "type", art: <AddressArt /> },
  { key: "build", art: <BuildArt /> },
  { key: "share", art: <LinkArt /> },
];

export function SwarmDemoSection() {
  const copy = useMessages().swarmDemo;

  return (
    <MarketingSection id="swarm-demo">
      <SectionHeading
        level={1}
        title={`${copy.title} ${copy.titleHighlight}`}
        subtitle={copy.subtitle}
      />

      <DemoForm />

      <p className="mt-16 mb-4 text-center text-sm font-medium text-fg-muted">
        {copy.howHeading}
      </p>
      <ul className="mx-auto grid max-w-215 gap-3 md:grid-cols-3">
        {HOW.map(({ key, art }) => (
          <li key={key} className="rounded-xl border border-line bg-panel p-5">
            <span className="block h-20 rounded-xl bg-panel-2 p-2">{art}</span>
            <p className="mt-4 font-semibold text-fg">{copy.how[key].title}</p>
            <p className="mt-1 text-sm leading-relaxed text-fg/75">
              {copy.how[key].body}
            </p>
          </li>
        ))}
      </ul>
    </MarketingSection>
  );
}

/*
 * The address is checked and shown as a preview first; the demo starts on
 * a second click. A signed-out visitor is sent to sign in and comes back
 * here with the address in the query, to the preview again.
 */
function DemoForm() {
  const copy = useMessages().swarmDemo;
  const lh = useLocalizedHref();
  const router = useRouter();
  const params = useSearchParams();
  const id = useId();
  const [url, setUrl] = useState(() => params.get("url") ?? "");
  const [phase, setPhase] = useState<"idle" | "checking" | "starting">("idle");
  const [site, setSite] = useState<SitePreview | null>(null);
  const [error, setError] = useState<SwarmDemoErrorCode | null>(null);
  const resumed = useRef(false);
  const busy = phase !== "idle";

  async function check(address: string) {
    setPhase("checking");
    setError(null);
    setSite(null);
    const result = await checkSwarmDemoAction(address);
    if (result.kind === "ok") {
      track("swarm_demo_checked");
      setSite(result.site);
    } else {
      setError(result.code);
    }
    setPhase("idle");
  }

  async function start(address: string) {
    setPhase("starting");
    setError(null);
    track("swarm_demo_requested");
    const result = await startSwarmDemoAction(address);
    if (result.kind === "login") {
      const next = `${lh("/swarm-demo")}?url=${encodeURIComponent(address)}&go=1`;
      router.push(`/login?next=${encodeURIComponent(next)}`);
      return;
    }
    if (result.kind === "started") {
      track("swarm_demo_started");
      router.push(result.url);
      return;
    }
    setError(result.code);
    setPhase("idle");
  }

  useEffect(() => {
    if (resumed.current || params.get("go") !== "1") return;
    resumed.current = true;
    const address = params.get("url") ?? "";
    router.replace(lh("/swarm-demo"));
    if (address) void check(address);
    // Runs once, for the address carried back from sign-in.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    void check(url);
  }

  const note =
    phase === "checking"
      ? copy.checking
      : phase === "starting"
        ? copy.generating
        : site
          ? copy.previewNote
          : copy.note;

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-160">
      <div className="flex h-16 items-center gap-3 rounded-full border border-line bg-panel py-2 pr-2 pl-6 shadow-[0_16px_40px_-20px_rgba(0,0,0,0.35)] transition-colors focus-within:border-fg/40">
        <label htmlFor={`${id}-url`} className="sr-only">
          {copy.url}
        </label>
        <input
          id={`${id}-url`}
          name="url"
          required
          inputMode="url"
          autoComplete="url"
          spellCheck={false}
          placeholder={copy.urlPlaceholder}
          value={url}
          onChange={(event) => {
            setUrl(event.target.value);
            setSite(null);
            setError(null);
          }}
          className="h-full min-w-0 flex-1 bg-transparent text-lg text-fg outline-none placeholder:text-fg-subtle"
        />
        <button
          type="submit"
          disabled={busy}
          aria-label={phase === "checking" ? copy.checking : copy.check}
          className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors outline-none hover:bg-primary/80 focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-60"
        >
          {phase === "checking" ? (
            <Spinner className="size-5" />
          ) : (
            <ArrowUp size={22} strokeWidth={2.5} />
          )}
        </button>
      </div>
      <p className="mt-4 text-center text-sm text-fg-muted">{note}</p>
      {site && (
        <SitePreviewCard
          site={site}
          starting={phase === "starting"}
          onStart={() => void start(site.url)}
          onChange={() => {
            setSite(null);
            document.getElementById(`${id}-url`)?.focus();
          }}
        />
      )}
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>{copy.errors[error]}</AlertDescription>
        </Alert>
      )}
    </form>
  );
}

function SitePreviewCard({
  site,
  starting,
  onStart,
  onChange,
}: {
  site: SitePreview;
  starting: boolean;
  onStart: () => void;
  onChange: () => void;
}) {
  const copy = useMessages().swarmDemo;
  const [imageFailed, setImageFailed] = useState(false);
  const [iconFailed, setIconFailed] = useState(false);

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-panel text-left shadow-[0_16px_40px_-20px_rgba(0,0,0,0.35)]">
      {site.image && !imageFailed && (
        <div className="aspect-video max-h-64 w-full bg-panel-2">
          <FadeInImage
            src={site.image}
            alt=""
            onError={() => setImageFailed(true)}
            className="size-full object-cover"
          />
        </div>
      )}
      <div className="flex items-start gap-3 p-4">
        <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-panel-2">
          {site.icon && !iconFailed ? (
            <FadeInImage
              src={site.icon}
              alt=""
              onError={() => setIconFailed(true)}
              className="size-5"
            />
          ) : (
            <Globe size={18} className="text-fg-muted" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-fg">
            {site.title ?? site.host}
          </p>
          <p className="truncate text-sm text-fg-muted">{site.url}</p>
          {site.description && (
            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-fg/75">
              {site.description}
            </p>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-2 border-t border-line p-3">
        <Button type="button" disabled={starting} onClick={onStart}>
          {starting && <Spinner className="size-4" />}
          {copy.generate}
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={starting}
          onClick={onChange}
        >
          {copy.change}
        </Button>
      </div>
    </div>
  );
}
