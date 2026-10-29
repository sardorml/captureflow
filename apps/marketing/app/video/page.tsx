import { ClaudePrompt } from "@/components/claude-prompt";
import { CompositionCard } from "@/components/composition-card";
import { StudioPanel } from "@/components/studio-panel";
import { listCompositions, listLibrary } from "@/lib/library";

export const dynamic = "force-dynamic";
export const metadata = { title: "Video" };

export default async function VideoPage() {
  const [compositions, renders] = await Promise.all([
    listCompositions("video"),
    listLibrary("video"),
  ]);
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold text-fg">Video</h1>
        <p className="text-sm text-fg-muted">
          The promo in hyperframes/index.html. Edit it in the Studio or with
          Claude Code, then render it to MP4.
        </p>
      </header>
      <StudioPanel />
      <div className="grid max-w-6xl gap-6 lg:grid-cols-2">
        {compositions.map((c) => (
          <CompositionCard
            key={c.source}
            composition={c}
            latest={renders.find((r) => r.slug === c.slug) ?? null}
          />
        ))}
        <ClaudePrompt kind="video" />
      </div>
    </div>
  );
}
