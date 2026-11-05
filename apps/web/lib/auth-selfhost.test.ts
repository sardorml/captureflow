import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  applyMigrations,
  claimFirstInstanceAdmin,
  createD1,
  createInstanceUser,
  createSelfHostHooks,
  issuePasswordLink,
  setInjectedEnv,
  suspendInstanceUser,
  unsuspendInstanceUser,
} from "@captureflow/selfhost";
import { beforeEach, describe, expect, it } from "vitest";
import { getAuth } from "./auth";

const MIGRATIONS = new URL("../migrations/", import.meta.url).pathname;
const PASSWORD = "a long enough password";

let db: D1Database;

// The sign-in library on the Docker server's own database and hooks, so a
// library upgrade that stops honouring them fails here.
beforeEach(() => {
  const path = join(mkdtempSync(join(tmpdir(), "cf-auth-")), "app.sqlite");
  applyMigrations(path, MIGRATIONS);
  db = createD1(path);
  setInjectedEnv({
    DB: db,
    BETTER_AUTH_SECRET: "test-secret-test-secret-test-secret",
    BETTER_AUTH_URL: "http://localhost:3000",
    SELFHOST: createSelfHostHooks(db),
  });
});

async function addUser(email: string): Promise<string> {
  const result = await createInstanceUser(db, { name: "Pat", email });
  if (!result.ok) throw new Error("user exists");
  return result.userId;
}

async function signIn(email: string) {
  const auth = await getAuth();
  return auth.api.signInEmail({ body: { email, password: PASSWORD } });
}

describe("self-hosted accounts", () => {
  it("lets an added user set a password with the link, once", async () => {
    const userId = await addUser("pat@example.com");
    const token = await issuePasswordLink(db, userId, "new");
    const auth = await getAuth();

    await auth.api.resetPassword({ body: { newPassword: PASSWORD, token } });
    expect((await signIn("pat@example.com")).user.id).toBe(userId);
    await expect(
      auth.api.resetPassword({ body: { newPassword: PASSWORD, token } }),
    ).rejects.toThrow();
  });

  it("refuses a suspended account until it is restored", async () => {
    const admin = await addUser("admin@example.com");
    await claimFirstInstanceAdmin(db, admin);
    const userId = await addUser("pat@example.com");
    const token = await issuePasswordLink(db, userId, "new");
    const auth = await getAuth();
    await auth.api.resetPassword({ body: { newPassword: PASSWORD, token } });

    await suspendInstanceUser(db, { userId, byUserId: admin });
    await expect(signIn("pat@example.com")).rejects.toThrow(/suspended/);

    await unsuspendInstanceUser(db, userId);
    expect((await signIn("pat@example.com")).user.id).toBe(userId);
  });
});
