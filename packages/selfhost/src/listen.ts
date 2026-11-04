import {
  Server,
  request,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";

// Another app on a loopback port, answering for one path prefix.
export type Mount = { prefix: string; port: number };

/*
 * Next's standalone server builds every route handler's `req.url` from the
 * hostname and port it was told to listen on, so behind Docker a share link
 * would read http://0.0.0.0:3000/r/…. Next is told the public host and port
 * from APP_URL instead, and its one listen() call is redirected to the real
 * bind address; that server's address() keeps reporting the public port,
 * which Next re-reads once listening. The protocol comes from APP_URL too,
 * since a proxy in front may not send x-forwarded-proto.
 */
export function serveNextAt(
  appUrl: string,
  bindHost: string,
  bindPort: number,
  mount?: Mount,
): void {
  const url = new URL(appUrl);
  const publicPort = url.port || (url.protocol === "https:" ? "443" : "80");
  const protocol = url.protocol.slice(0, -1);
  const selfHost =
    bindHost === "0.0.0.0" || bindHost === "::"
      ? "127.0.0.1"
      : bindHost.includes(":")
        ? `[${bindHost}]`
        : bindHost;
  process.env.HOSTNAME = url.hostname;
  process.env.PORT = publicPort;

  const original = Server.prototype.listen;
  // listen() is overloaded; the arguments are passed through untouched.
  const listen = original as (this: Server, ...args: unknown[]) => Server;
  Server.prototype.listen = function (this: Server, ...args: unknown[]) {
    if (String(args[0]) !== publicPort || args[1] !== url.hostname) {
      return listen.apply(this, args);
    }
    Server.prototype.listen = original;
    const address = this.address.bind(this);
    this.address = () => {
      const bound = address();
      return bound && typeof bound === "object"
        ? { ...bound, port: Number(publicPort) }
        : bound;
    };
    if (mount) {
      const next = this.listeners("request") as RequestHandler[];
      this.removeAllListeners("request");
      this.on("request", (req: IncomingMessage, res: ServerResponse) => {
        if (underPrefix(req.url, mount.prefix)) forward(req, res, mount.port);
        else for (const handler of next) handler.call(this, req, res);
      });
    }
    this.prependListener("request", (req) => {
      req.headers["x-forwarded-proto"] = protocol;
    });
    // Next fetches its own pages from this origin after a server action
    // redirects, and would otherwise use the public port, where nothing listens
    // inside the container. Next's listener sets it first; this one runs after.
    this.once("listening", () => {
      process.env.__NEXT_PRIVATE_ORIGIN = `http://${selfHost}:${bindPort}`;
    });
    return listen.apply(this, [bindPort, bindHost, ...args.slice(2)]);
  } as Server["listen"];
}

type RequestHandler = (req: IncomingMessage, res: ServerResponse) => void;

function underPrefix(url: string | undefined, prefix: string): boolean {
  const path = url ?? "";
  return (
    path === prefix ||
    path.startsWith(`${prefix}/`) ||
    path.startsWith(`${prefix}?`)
  );
}

function forward(req: IncomingMessage, res: ServerResponse, port: number) {
  const upstream = request(
    {
      host: "127.0.0.1",
      port,
      method: req.method,
      path: req.url,
      headers: req.headers,
    },
    (reply) => {
      res.writeHead(reply.statusCode ?? 502, reply.headers);
      reply.pipe(res);
    },
  );
  upstream.on("error", () => {
    if (!res.headersSent) res.writeHead(502, { "content-type": "text/plain" });
    res.end("The admin app isn't running.");
  });
  req.pipe(upstream);
}
