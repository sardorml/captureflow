import { logAccess } from "./access-log";
import { describeAuthIo, type AuthInstance } from "./auth";
import { getAppWebEnv } from "./cf-env";
import { lookupSession, probeDatabase } from "./session-lookup";

// Every server-side session read goes through here, so none can hang a page.
export async function getSessionWithin(
  auth: AuthInstance,
  headers: Headers,
  label: string,
) {
  const result = await lookupSession(
    () => auth.api.getSession({ headers }),
    label,
    {
      probe: async () =>
        `${await probeDatabase((await getAppWebEnv())?.DB)}; ${describeAuthIo(auth)}`,
    },
  );
  if (result) {
    logAccess({
      userId: result.user.id,
      via: "session",
      credentialId: result.session.id,
      fallbackRoute: label,
    });
  }
  return result;
}
