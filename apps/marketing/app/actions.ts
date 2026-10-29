"use server";

import { revalidatePath } from "next/cache";
import { deleteLibraryFile, findComposition } from "@/lib/library";
import { isMediaKind } from "@/lib/media";
import { renderComposition, startStudio } from "@/lib/render";

export async function renderAction(
  kind: unknown,
  slug: unknown,
): Promise<{ error: string | null; file: string | null }> {
  if (!isMediaKind(kind) || typeof slug !== "string") {
    return { error: "Unknown composition", file: null };
  }
  const composition = await findComposition(kind, slug);
  if (!composition) return { error: "Unknown composition", file: null };
  try {
    const result = await renderComposition(composition);
    if (!result.ok) return { error: result.error, file: null };
    revalidatePath("/", "layout");
    return { error: null, file: result.file };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Render failed",
      file: null,
    };
  }
}

export async function deleteAction(
  file: unknown,
): Promise<{ error: string | null }> {
  if (typeof file !== "string") return { error: "Unknown file" };
  try {
    const deleted = await deleteLibraryFile(file);
    if (!deleted) return { error: "Unknown file" };
    revalidatePath("/", "layout");
    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Delete failed" };
  }
}

export async function startStudioAction(): Promise<{
  error: string | null;
  url: string | null;
}> {
  const result = await startStudio();
  return result.ok
    ? { error: null, url: result.url }
    : { error: result.error, url: null };
}
