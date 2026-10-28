import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createR2 } from "./r2";

function bucket(): R2Bucket {
  return createR2(mkdtempSync(join(tmpdir(), "cf-r2-")));
}

async function text(obj: R2Object | R2ObjectBody | null): Promise<string> {
  if (!obj || !("body" in obj)) throw new Error("no body");
  return new Response(obj.body).text();
}

describe("createR2", () => {
  it("round-trips an object with its http metadata", async () => {
    const b = bucket();
    const put = await b.put("videos/a/b.mp4", "hello", {
      httpMetadata: { contentType: "video/mp4", cacheControl: "no-cache" },
    });
    expect(put?.size).toBe(5);

    const head = await b.head("videos/a/b.mp4");
    expect(head?.httpMetadata?.contentType).toBe("video/mp4");
    expect(head?.httpEtag).toBe(`"${head?.etag}"`);

    const obj = await b.get("videos/a/b.mp4");
    expect(await text(obj)).toBe("hello");
    expect(await (await b.get("videos/a/b.mp4"))?.text()).toBe("hello");
    expect(await b.get("missing")).toBeNull();
  });

  it("serves byte ranges and throws past the end", async () => {
    const b = bucket();
    await b.put("k", new TextEncoder().encode("0123456789"));
    expect(
      await text(await b.get("k", { range: { offset: 2, length: 3 } })),
    ).toBe("234");
    expect(await text(await b.get("k", { range: { offset: 7 } }))).toBe("789");
    expect(await text(await b.get("k", { range: { suffix: 4 } }))).toBe("6789");
    const ranged = await b.get("k", { range: { offset: 2, length: 3 } });
    expect(ranged?.size).toBe(10);
    await expect(b.get("k", { range: { offset: 10 } })).rejects.toThrow();
  });

  it("returns a bodiless object when the etag still matches", async () => {
    const b = bucket();
    const put = await b.put("k", "x");
    const hit = await b.get("k", { onlyIf: { etagDoesNotMatch: put!.etag } });
    expect(hit && "body" in hit).toBe(false);
    const miss = await b.get("k", { onlyIf: { etagDoesNotMatch: "other" } });
    expect(miss && "body" in miss).toBe(true);
  });

  it("accepts a ReadableStream body", async () => {
    const b = bucket();
    await b.put("s", new Response("streamed").body!);
    expect(await (await b.get("s"))?.text()).toBe("streamed");
  });

  it("lists by prefix in pages and deletes many keys", async () => {
    const b = bucket();
    for (let i = 0; i < 1005; i++)
      await b.put(`audio/x/${String(i).padStart(4, "0")}`, "");
    await b.put("other/y", "");

    const first = await b.list({ prefix: "audio/x/" });
    expect(first.objects).toHaveLength(1000);
    expect(first.truncated).toBe(true);
    const second = await b.list({
      prefix: "audio/x/",
      cursor: first.truncated ? first.cursor : undefined,
    });
    expect(second.objects).toHaveLength(5);
    expect(second.truncated).toBe(false);

    await b.delete(first.objects.map((o) => o.key));
    expect((await b.list({ prefix: "audio/" })).objects).toHaveLength(5);
    expect(await b.head("other/y")).not.toBeNull();
  }, 30_000);

  it("assembles a multipart upload in part order", async () => {
    const b = bucket();
    const upload = await b.createMultipartUpload("videos/m.webm", {
      httpMetadata: { contentType: "video/webm" },
    });
    const resumed = b.resumeMultipartUpload("videos/m.webm", upload.uploadId);
    const p2 = await resumed.uploadPart(2, "world");
    const p1 = await resumed.uploadPart(1, "hello ");
    const done = await resumed.complete([p2, p1]);
    expect(done.size).toBe(11);
    expect(done.etag).toMatch(/-2$/);
    const obj = await b.get("videos/m.webm");
    expect(await obj?.text()).toBe("hello world");
    expect(obj?.httpMetadata?.contentType).toBe("video/webm");
    await expect(resumed.abort()).rejects.toThrow(/NoSuchUpload/);
  });

  it("aborts an upload and refuses unknown ids", async () => {
    const b = bucket();
    const upload = await b.createMultipartUpload("k");
    await upload.uploadPart(1, "x");
    await upload.abort();
    expect(await b.head("k")).toBeNull();
    expect(() => b.resumeMultipartUpload("k", "../../etc")).toThrow(
      /NoSuchUpload/,
    );
  });

  it("refuses keys that escape the bucket", async () => {
    const b = bucket();
    await expect(b.put("../escape", "x")).rejects.toThrow(/invalid object key/);
    await expect(b.put("a//b", "x")).rejects.toThrow(/invalid object key/);
    await expect(b.get("/etc/passwd")).rejects.toThrow(/invalid object key/);
  });
});
