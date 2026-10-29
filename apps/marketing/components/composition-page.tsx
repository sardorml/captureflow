import { listCompositions, listLibrary } from "@/lib/library";
import type { MediaKind } from "@/lib/media";
import { ClaudePrompt } from "./claude-prompt";
import { CompositionCard } from "./composition-card";

export async function CompositionPage({
  kind,
  title,
  description,
}: {
  kind: MediaKind;
  title: string;
  description: string;
}) {
  const [compositions, renders] = await Promise.all([
    listCompositions(kind),
    listLibrary(kind),
  ]);
  return (
    <div className="flex max-w-6xl flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold text-fg">{title}</h1>
        <p className="text-sm text-fg-muted">{description}</p>
      </header>
      <ClaudePrompt kind={kind} />
      <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4">
        {compositions.map((c) => (
          <CompositionCard
            key={c.source}
            composition={c}
            latest={renders.find((r) => r.slug === c.slug) ?? null}
          />
        ))}
      </div>
    </div>
  );
}
