import { Server } from "node:http";

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
): void {
  const url = new URL(appUrl);
  const publicPort = url.port || (url.protocol === "https:" ? "443" : "80");
  const protocol = url.protocol.slice(0, -1);
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
    this.prependListener("request", (req) => {
      req.headers["x-forwarded-proto"] = protocol;
    });
    return listen.apply(this, [bindPort, bindHost, ...args.slice(2)]);
  } as Server["listen"];
}
