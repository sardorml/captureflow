import { describe, expect, it } from "vitest";
import { isAllowedUrl, isPrivateAddress } from "./guard";

describe("isPrivateAddress", () => {
  it("flags private, loopback, link-local and metadata ranges", () => {
    for (const ip of [
      "10.0.0.1",
      "127.0.0.1",
      "169.254.169.254",
      "172.20.1.1",
      "192.168.1.1",
      "100.64.0.1",
      "0.0.0.0",
      "::1",
      "fd00::1",
      "fe80::1",
      "::ffff:10.0.0.1",
    ]) {
      expect(isPrivateAddress(ip), ip).toBe(true);
    }
  });

  it("lets public addresses through", () => {
    for (const ip of [
      "104.16.1.1",
      "8.8.8.8",
      "172.32.0.1",
      "2606:4700::1111",
    ]) {
      expect(isPrivateAddress(ip), ip).toBe(false);
    }
  });
});

describe("isAllowedUrl", () => {
  const resolve = (map: Record<string, string[]>) => async (host: string) =>
    map[host] ?? [];

  it("allows public web pages", async () => {
    expect(
      await isAllowedUrl(
        "https://captureflow.dev/",
        resolve({ "captureflow.dev": ["104.21.0.1"] }),
      ),
    ).toBe(true);
  });

  it("refuses other schemes, localhost and names that resolve inside", async () => {
    const r = resolve({
      "internal.example": ["10.1.2.3"],
      "mixed.example": ["104.21.0.1", "127.0.0.1"],
    });
    for (const url of [
      "file:///etc/passwd",
      "chrome://settings",
      "http://localhost:3000",
      "http://169.254.169.254/latest",
      "http://internal.example",
      "http://mixed.example",
      "http://[::1]/",
      "not a url",
    ]) {
      expect(await isAllowedUrl(url, r), url).toBe(false);
    }
  });
});
