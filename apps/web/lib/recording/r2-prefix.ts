/// <reference types="@cloudflare/workers-types" />

// Binding-free so lib/recording/cron.ts (bundled into worker.ts) can share it.
export async function deleteObjectsWithPrefix(
  bucket: R2Bucket,
  prefix: string,
): Promise<void> {
  let cursor: string | undefined;
  do {
    const page = await bucket.list({ prefix, cursor });
    if (page.objects.length > 0) {
      await bucket.delete(page.objects.map((object) => object.key));
    }
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);
}
