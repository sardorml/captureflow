import { CompositionPage } from "@/components/composition-page";

export const dynamic = "force-dynamic";
export const metadata = { title: "Images" };

export default function ImagesPage() {
  return (
    <CompositionPage
      kind="image"
      title="Images"
      description="Posters, social cards and stills from hyperframes/images, rendered to PNG."
    />
  );
}
