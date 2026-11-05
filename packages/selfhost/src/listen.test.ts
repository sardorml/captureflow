import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { afterEach, describe, expect, it } from "vitest";
import { serveNextAt } from "./listen";

async function freePort(): Promise<number> {
  const probe = createServer();
  await new Promise<void>((resolve) => probe.listen(0, "127.0.0.1", resolve));
  const port = (probe.address() as AddressInfo).port;
  await new Promise((resolve) => probe.close(resolve));
  return port;
}

describe("serveNextAt", () => {
  const servers: Server[] = [];
  afterEach(() => {
    for (const server of servers.splice(0)) server.close();
    delete process.env.__NEXT_PRIVATE_ORIGIN;
  });

  it("binds the real address while Next sees the public host, port and protocol", async () => {
    const port = await freePort();
    serveNextAt("https://rec.example.com", "127.0.0.1", port);
    expect(process.env.HOSTNAME).toBe("rec.example.com");
    expect(process.env.PORT).toBe("443");

    let proto: string | undefined;
    const server = createServer((req, res) => {
      proto = req.headers["x-forwarded-proto"] as string;
      res.end("ok");
    });
    servers.push(server);
    await new Promise<void>((resolve) =>
      server.listen(443, "rec.example.com", resolve),
    );
    const reported = server.address() as AddressInfo;
    expect(reported.address).toBe("127.0.0.1");
    expect(reported.port).toBe(443);

    const res = await fetch(`http://127.0.0.1:${port}/`, {
      headers: { "x-forwarded-proto": "http" },
    });
    expect(await res.text()).toBe("ok");
    expect(proto).toBe("https");
  });

  it("points Next's self-fetch at the bound port, not the public one", async () => {
    const port = await freePort();
    serveNextAt("https://rec.example.com", "0.0.0.0", port);

    const server = createServer();
    servers.push(server);
    server.on("listening", () => {
      process.env.__NEXT_PRIVATE_ORIGIN = "http://localhost:443";
    });
    await new Promise<void>((resolve) =>
      server.listen(443, "rec.example.com", resolve),
    );

    expect(process.env.__NEXT_PRIVATE_ORIGIN).toBe(`http://127.0.0.1:${port}`);
  });

  it("hands one path prefix to the mounted app and the rest to Next", async () => {
    const admin = createServer((req, res) => {
      res.setHeader("x-served-by", "admin");
      res.end(`admin saw ${req.url} over ${req.headers["x-forwarded-proto"]}`);
    });
    servers.push(admin);
    await new Promise<void>((resolve) => admin.listen(0, "127.0.0.1", resolve));
    const adminPort = (admin.address() as AddressInfo).port;

    const port = await freePort();
    serveNextAt("https://rec.example.com", "127.0.0.1", port, {
      prefix: "/admin",
      port: adminPort,
    });
    const web = createServer((req, res) => res.end(`next saw ${req.url}`));
    servers.push(web);
    await new Promise<void>((resolve) =>
      web.listen(443, "rec.example.com", resolve),
    );

    const base = `http://127.0.0.1:${port}`;
    const mounted = await fetch(`${base}/admin/workspaces/1?x=1`);
    expect(mounted.headers.get("x-served-by")).toBe("admin");
    expect(await mounted.text()).toBe(
      "admin saw /admin/workspaces/1?x=1 over https",
    );
    expect(await (await fetch(`${base}/admin`)).text()).toMatch(/^admin saw/);
    expect(await (await fetch(`${base}/administer`)).text()).toBe(
      "next saw /administer",
    );
    expect(await (await fetch(`${base}/recordings`)).text()).toBe(
      "next saw /recordings",
    );

    admin.close();
    const down = await fetch(`${base}/admin`);
    expect(down.status).toBe(502);
  });

  it("keeps every response out of search indexes", async () => {
    const admin = createServer((_req, res) => res.end("admin"));
    servers.push(admin);
    await new Promise<void>((resolve) => admin.listen(0, "127.0.0.1", resolve));

    const port = await freePort();
    serveNextAt("https://rec.example.com", "127.0.0.1", port, {
      prefix: "/admin",
      port: (admin.address() as AddressInfo).port,
    });
    const web = createServer((req, res) => res.end(`next saw ${req.url}`));
    servers.push(web);
    await new Promise<void>((resolve) =>
      web.listen(443, "rec.example.com", resolve),
    );

    const base = `http://127.0.0.1:${port}`;
    for (const path of ["/r/abc", "/media/abc.mp4", "/privacy", "/admin"]) {
      const res = await fetch(`${base}${path}`);
      expect(res.headers.get("x-robots-tag")).toBe("noindex, nofollow");
    }

    const robots = await fetch(`${base}/robots.txt`);
    const rules = (await robots.text())
      .split("\n")
      .filter((line) => line && !line.startsWith("#"));
    expect(rules).toEqual(["User-agent: *", "Disallow: /api/"]);

    for (const path of ["/sitemap.xml", "/llms.txt?x=1"]) {
      const res = await fetch(`${base}${path}`);
      expect(res.status).toBe(404);
      expect(await res.text()).toBe("Not found");
    }
  });
});
