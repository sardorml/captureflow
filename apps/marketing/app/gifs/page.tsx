import { CompositionPage } from "@/components/composition-page";

export const dynamic = "force-dynamic";
export const metadata = { title: "GIFs" };

export default function GifsPage() {
  return (
    <CompositionPage
      kind="gif"
      title="GIFs"
      description="Looping animations from hyperframes/gifs, rendered to GIF."
    />
  );
}
