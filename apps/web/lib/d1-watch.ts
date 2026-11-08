/// <reference types="@cloudflare/workers-types" />

export type D1Watch = {
  db: D1Database;
  describe: (now?: number) => string;
};

type Pending = { sql: string; at: number };

const RUNS = new Set(["first", "all", "run", "raw"]);

function short(sql: string): string {
  const flat = sql.replace(/\s+/g, " ").trim();
  return flat.length > 90 ? `${flat.slice(0, 90)}…` : flat;
}

/*
 * Records which statements are still waiting, for the session stall log: a
 * stall with a statement pending is the binding, one with none is the auth
 * library's own code. The native batch() only accepts real statements, so the
 * wrappers are unwrapped before it.
 */
export function watchD1(db: D1Database): D1Watch {
  const pending = new Set<Pending>();
  const originals = new WeakMap<object, D1PreparedStatement>();
  let done = 0;
  let last: Pending | null = null;

  const track = <T>(sql: string, run: () => Promise<T>): Promise<T> => {
    const entry = { sql, at: Date.now() };
    pending.add(entry);
    return run().finally(() => {
      pending.delete(entry);
      done++;
      last = { sql, at: Date.now() };
    });
  };

  const wrap = (
    stmt: D1PreparedStatement,
    sql: string,
  ): D1PreparedStatement => {
    const proxy = new Proxy(stmt, {
      get(target, key) {
        if (key === "bind") {
          return (...values: unknown[]) => wrap(target.bind(...values), sql);
        }
        if (typeof key === "string" && RUNS.has(key)) {
          const method = Reflect.get(target, key, target) as (
            ...args: unknown[]
          ) => Promise<unknown>;
          return (...args: unknown[]) =>
            track(sql, () => method.apply(target, args));
        }
        const value = Reflect.get(target, key, target);
        return typeof value === "function" ? value.bind(target) : value;
      },
    });
    originals.set(proxy, stmt);
    return proxy;
  };

  const watched = new Proxy(db, {
    get(target, key) {
      if (key === "prepare") {
        return (sql: string) => wrap(target.prepare(sql), sql);
      }
      if (key === "batch") {
        return (stmts: D1PreparedStatement[]) =>
          track(`batch of ${stmts.length}`, () =>
            target.batch(stmts.map((s) => originals.get(s) ?? s)),
          );
      }
      const value = Reflect.get(target, key, target);
      return typeof value === "function" ? value.bind(target) : value;
    },
  });

  return {
    db: watched,
    describe(now = Date.now()) {
      const oldest = [...pending].sort((a, b) => a.at - b.at)[0];
      if (oldest) {
        return `auth d1: ${pending.size} pending, oldest ${now - oldest.at}ms on ${short(oldest.sql)}`;
      }
      const tail = last as Pending | null;
      return tail
        ? `auth d1: none pending, ${done} done, last ${now - tail.at}ms ago (${short(tail.sql)})`
        : "auth d1: no statement sent";
    },
  };
}
