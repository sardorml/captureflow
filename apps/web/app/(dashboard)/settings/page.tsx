import type { ReactNode } from "react";
import { getWorkspaceById } from "@captureflow/quota";
import { Card, Separator, Typography } from "@heroui/react";
import { requireSession } from "@/lib/session-guard";
import { getAppWebEnv } from "@/lib/cf-env";
import { resolveCurrentWorkspace } from "@/lib/current-workspace";
import { PageHeader } from "../PageHeader";
import { AccountForm } from "./AccountForm";
import { WorkspaceNameForm } from "./WorkspaceNameForm";
import { WorkspaceLogoForm } from "./WorkspaceLogoForm";
import { AccessPolicy } from "./AccessPolicy";
import { MemberUploadsPolicy } from "./MemberUploadsPolicy";

export const dynamic = "force-dynamic";

const CDN_BASE =
  process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL ?? "https://cdn.captureflow.xyz";

export default async function SettingsPage() {
  const session = await requireSession();
  const user = session.user;
  const current = await resolveCurrentWorkspace(user.id, user.name ?? null);
  const env = await getAppWebEnv();

  /*
   * Every member gets the account section, so the page is no longer owner-only
   * — the role now gates the workspace sections below rather than the route.
   */
  const workspace =
    current.role === "owner" && env?.DB
      ? await getWorkspaceById(env.DB, current.workspace.id)
      : null;

  // Read the image column directly: the better-auth session payload doesn't
  // always carry it.
  let imageUrl: string | null = null;
  if (env?.DB) {
    const row = await env.DB.prepare(
      `SELECT image FROM users WHERE id = ?1 LIMIT 1`,
    )
      .bind(user.id)
      .first<{ image: string | null }>();
    imageUrl = row?.image ?? null;
  }

  const logoUrl = workspace?.logo_key
    ? `${CDN_BASE}/${workspace.logo_key}?v=${workspace.updated_at}`
    : null;

  return (
    /* Narrower than the shell's grid pages: a column of forms reads badly at
       full width, where a label and its field end up an inch apart. */
    <div className="mx-auto max-w-[880px]">
      <PageHeader
        title="Settings"
        subtitle="Manage your account and preferences."
        showRecord={false}
      />

      {/* Section labels sit above their cards, not inside them, so the page
          reads as labelled groups rather than a stack of titled boxes. */}
      <div className="mt-6 flex flex-col gap-8">
        <Section label="Account">
          <AccountForm
            userId={user.id}
            initialName={user.name ?? ""}
            email={user.email}
            imageUrl={imageUrl}
          />
        </Section>

        {workspace && (
          <>
            <Section label="Workspace">
              <WorkspaceNameForm initialName={workspace.name} />
              <Separator className="my-6" />
              <WorkspaceLogoForm
                logoUrl={logoUrl}
                workspaceName={workspace.name}
              />
            </Section>

            <Section label="Access & viewing">
              <p className="text-fg-muted mb-4 text-sm">
                Control whether content from this workspace can leave the team.
              </p>
              <AccessPolicy allowPublicLinks={workspace.allow_public_links} />
            </Section>

            <Section label="Recording access">
              <p className="text-fg-muted mb-4 text-sm">
                Decide whether teammates can post recordings and screenshots
                into this workspace.
              </p>
              <MemberUploadsPolicy
                allowMemberUploads={workspace.allow_member_uploads}
              />
            </Section>
          </>
        )}
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section>
      <Typography type="body-sm" weight="semibold" className="mb-2 block">
        {label}
      </Typography>
      <Card className="p-5">{children}</Card>
    </section>
  );
}
