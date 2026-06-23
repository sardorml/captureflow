import { getWorkspaceById } from "@captureflow/quota";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session-guard";
import { getAppWebEnv } from "@/lib/cf-env";
import { resolveCurrentWorkspace } from "@/lib/current-workspace";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@captureflow/ui";
import { Separator } from "@captureflow/ui";
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
  if (current.role !== "owner") redirect("/shares");

  const env = await getAppWebEnv();
  const workspace = env?.DB
    ? await getWorkspaceById(env.DB, current.workspace.id)
    : null;
  if (!workspace) redirect("/shares");

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
      <div className="mt-6 space-y-8">
        <Section
          title="General"
          description="Settings applied to every new recording and snap in this workspace."
        >
          <WorkspaceNameForm initialName={workspace.name} />
          <Divider />
          <WorkspaceLogoForm logoUrl={logoUrl} workspaceName={workspace.name} />
        </Section>

        <Section
          title="Access & viewing"
          description="Control whether content from this workspace can leave the team."
        >
          <AccessPolicy allowPublicLinks={workspace.allow_public_links} />
        </Section>

        <Section
          title="Recording access"
          description="Decide whether teammates can post recordings + snaps into this workspace."
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
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-line bg-neutral-900 p-6">
      <div className="mb-5">
        <h2 className="text-base font-semibold tracking-tight text-neutral-100">
          {title}
        </h2>
        <p className="mt-1 text-sm text-neutral-500">{description}</p>
      </div>
      {children}
    </section>
  );
}

function Divider() {
  return <div className="my-5 h-px bg-overlay" />;
}
