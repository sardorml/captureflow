"use client";

import { useActionState, useState } from "react";
import { Button } from "@heroui/react";
import { MIN_PASSWORD_LENGTH } from "@captureflow/admin";
import { mintSetupTokenAction, setupAction } from "../actions";
import type { FormState, MintState } from "../actions";
import { TextRow, keepTyped } from "../_form";
import { Notice, SectionHeading } from "../_ui";

const NO_ERROR: FormState = { error: null };
const NO_MINT: MintState = { error: null, token: null, logged: false };

export function SetupForm({ configured }: { configured: boolean }) {
  const [state, formAction, pending] = useActionState(setupAction, NO_ERROR);
  const [mint, mintAction, minting] = useActionState(
    mintSetupTokenAction,
    NO_MINT,
  );
  // Controlled so the generated token can be dropped straight into the field.
  const [token, setToken] = useState("");

  return (
    <>
      <form action={formAction} ref={keepTyped} className="flex flex-col gap-3">
        <TextRow
          name="token"
          label="Setup token"
          type="password"
          hint="The ADMIN_SETUP_TOKEN secret, or one generated below."
          value={token}
          onChange={setToken}
          /* autoComplete off: a password manager will otherwise autofill a
             saved credential over the token and the claim just fails. */
          autoComplete="off"
          autoFocus
        />
        <TextRow
          name="email"
          label="Your email"
          type="email"
          autoComplete="username"
        />
        <TextRow
          name="password"
          label="Password"
          type="password"
          hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
          autoComplete="new-password"
        />
        {state.error && <Notice tone="error">{state.error}</Notice>}
        <Button type="submit" variant="primary" isDisabled={pending}>
          {pending ? "Working…" : "Create owner account"}
        </Button>
      </form>

      <div className="border-line bg-panel flex flex-col gap-3 rounded-xl border p-4">
        <SectionHeading title="No token to hand?">
          {configured
            ? "This deployment already expects ADMIN_SETUP_TOKEN. Generating one here adds a second token that also works, without touching that secret."
            : "ADMIN_SETUP_TOKEN is not set on this deployment, so generate a claim token instead."}
        </SectionHeading>
        <form action={mintAction}>
          <Button
            type="submit"
            variant="outline"
            size="sm"
            isDisabled={minting}
          >
            {minting ? "Generating…" : "Generate a setup token"}
          </Button>
        </form>
        {mint.error && <Notice tone="error">{mint.error}</Notice>}
        {mint.logged &&
          (mint.token ? (
            <Notice>
              Valid for 30 minutes, once.{" "}
              <Button
                variant="ghost"
                size="sm"
                onPress={() => setToken(mint.token ?? "")}
              >
                Use it
              </Button>
              <br />
              <code className="text-fg mt-2 inline-block font-mono text-xs break-all select-all">
                {mint.token}
              </code>
            </Notice>
          ) : (
            <Notice>
              Written to the server log — <code>wrangler tail</code> to read it.
              Valid for 30 minutes, once. It is not shown here on purpose:
              anyone who could see it could claim this deployment.
            </Notice>
          ))}
      </div>
    </>
  );
}
