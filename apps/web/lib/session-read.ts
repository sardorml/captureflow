import { describeAuthIo, type AuthInstance } from "./auth";
import { getAppWebEnv } from "./cf-env";
import { lookupSession, probeDatabase } from "./session-lookup";

// Every server-side session read goes through here, so none can hang a page.
export function getSessionWithin(
  auth: AuthInstance,
  headers: Headers,
  label: string,
) {
  return lookupSession(() => auth.api.getSession({ headers }), label, {
    probe: async () =>
      `${await probeDatabase((await getAppWebEnv())?.DB)}; ${describeAuthIo(auth)}`,
  });
}
