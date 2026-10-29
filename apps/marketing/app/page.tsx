import { Clapperboard, Film, Image } from "lucide-react";
import Link from "next/link";
import { MediaPreview } from "@/components/media-preview";
import { listCompositions, listLibrary } from "@/lib/library";
import { KIND_LABEL, type MediaKind } from "@/lib/media";

export const dynamic = "force-dynamic";

function renderCount(n: number): string {
  return `${n} ${n === 1 ? "render" : "renders"}`;
}

const SECTIONS = [
  {
    kind: "image",
    href: "/images",
    title: "Images",
    blurb: "Posters and social cards",
    icon: Image,
  },
  {
    kind: "gif",
    href: "/gifs",
    title: "GIFs",
    blurb: "Looping product moments",
    icon: Film,
  },
  {
    kind: "video",
    href: "/video",
    title: "Video",
    blurb: "HyperFrames Studio and the promo",
    icon: Clapperboard,
  },
] as const satisfies readonly { kind: MediaKind; [key: string]: unknown }[];

export default async function OverviewPage() {
  const [library, counts] = await Promise.all([
    listLibrary(),
    Promise.all(
      SECTIONS.map((s) => listCompositions(s.kind).then((c) => c.length)),
    ),
  ]);
  return (
    <div className="flex max-w-6xl flex-col gap-8">
      <header>
        <h1 className="text-2xl font-semibold text-fg">Marketing studio</h1>
        <p className="text-sm text-fg-muted">
          Images and GIFs written with Claude Code, video in HyperFrames, every
          result in one library.
        </p>
      </header>
      <div className="grid gap-4 md:grid-cols-3">
        {SECTIONS.map(({ kind, href, title, blurb, icon: Icon }, i) => (
          <Link
            key={kind}
            href={href}
            className="flex flex-col gap-3 rounded-2xl border border-line bg-panel p-5 transition-colors hover:bg-tint-strong"
          >
            <Icon size={22} className="text-accent" />
            <div>
              <p className="font-medium text-fg">{title}</p>
              <p className="text-sm text-fg-muted">{blurb}</p>
            </div>
            <p className="text-xs text-fg-muted">
              {counts[i]} {counts[i] === 1 ? "composition" : "compositions"} ·{" "}
              {renderCount(library.filter((item) => item.kind === kind).length)}
            </p>
          </Link>
        ))}
      </div>
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-medium text-fg">Recent renders</h2>
          <Link href="/library" className="text-sm text-fg-muted hover:text-fg">
            Open library
          </Link>
        </div>
        {library.length === 0 ? (
          <p className="text-sm text-fg-muted">Nothing rendered yet.</p>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
            {library.slice(0, 6).map((item) => (
              <div key={item.file} className="flex flex-col gap-2">
                <MediaPreview kind={item.kind} file={item.file} />
                <p className="truncate text-xs text-fg-muted">
                  {KIND_LABEL[item.kind]} · {item.slug}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
