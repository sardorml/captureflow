import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { afterEach, describe, expect, it } from "vitest";
import { serveNextAt } from "./listen";

describe("serveNextAt", () => {
  let server: Server | undefined;
  afterEach(() => server?.close());

  it("binds the real address while Next sees the public host, port and protocol", async () => {
    const probe = createServer();
    await new Promise<void>((resolve) => probe.listen(0, "127.0.0.1", resolve));
    const port = (probe.address() as AddressInfo).port;
    await new Promise((resolve) => probe.close(resolve));

    serveNextAt("https://rec.example.com", "127.0.0.1", port);
    expect(process.env.HOSTNAME).toBe("rec.example.com");
    expect(process.env.PORT).toBe("443");

    let proto: string | undefined;
    server = createServer((req, res) => {
      proto = req.headers["x-forwarded-proto"] as string;
      res.end("ok");
    });
    await new Promise<void>((resolve) =>
      server!.listen(443, "rec.example.com", resolve),
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
});
