import type { ReactNode } from "react";
import { getWorkspaceById } from "@captureflow/quota";
import { redirect } from "next/navigation";
import { Card, Separator, Typography } from "@heroui/react";
import { requireSession } from "@/lib/session-guard";
import { getAppWebEnv } from "@/lib/cf-env";
import { resolveCurrentWorkspace } from "@/lib/current-workspace";
import { PageHeader } from "../PageHeader";
import { WorkspaceNameForm } from "./WorkspaceNameForm";
import { WorkspaceLogoForm } from "./WorkspaceLogoForm";
import { AccessPolicy } from "./AccessPolicy";
import { MemberUploadsPolicy } from "./MemberUploadsPolicy";

export const dynamic = "force-dynamic";

const CDN_BASE =
  process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL ?? "https://cdn.captureflow.xyz";

export default async function WorkspaceSettingsPage() {
  const session = await requireSession();
  const current = await resolveCurrentWorkspace(
    session.user.id,
    session.user.name ?? null,
  );
  if (current.role !== "owner") redirect("/recordings");

  const env = await getAppWebEnv();
  const workspace = env?.DB
    ? await getWorkspaceById(env.DB, current.workspace.id)
    : null;
  if (!workspace) redirect("/recordings");

  const logoUrl = workspace.logo_key
    ? `${CDN_BASE}/${workspace.logo_key}?v=${workspace.updated_at}`
    : null;

  return (
    <>
      <PageHeader
        eyebrow={workspace.name}
        title="Workspace settings"
        subtitle="Branding, sharing policies, and content access."
        showRecord={false}
      />
      {/* Section labels sit above their cards, not inside them, so the page
          reads as labelled groups rather than a stack of titled boxes. */}
      <div className="mt-6 flex flex-col gap-8">
        <Section
          label="General"
          hint="Applied to every new recording and screenshot in this workspace."
        >
          <WorkspaceNameForm initialName={workspace.name} />
          <Separator className="my-6" />
          <WorkspaceLogoForm logoUrl={logoUrl} workspaceName={workspace.name} />
        </Section>

        <Section
          label="Access & viewing"
          hint="Control whether content from this workspace can leave the team."
        >
          <AccessPolicy allowPublicLinks={workspace.allow_public_links} />
        </Section>

        <Section
          label="Recording access"
          hint="Decide whether teammates can post recordings and screenshots into this workspace."
        >
          <MemberUploadsPolicy
            allowMemberUploads={workspace.allow_member_uploads}
          />
        </Section>
      </div>
    </>
  );
}

function Section({
  label,
  hint,
  children,
}: {
  label: string;
  hint: string;
  children: ReactNode;
}) {
  return (
    <section>
      <Typography type="body-sm" weight="medium" className="block">
        {label}
      </Typography>
      <Typography type="body-xs" color="muted" className="mt-0.5 mb-2 block">
        {hint}
      </Typography>
      <Card className="p-6">{children}</Card>
    </section>
  );
}
