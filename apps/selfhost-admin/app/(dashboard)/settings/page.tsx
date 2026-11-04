import { getInstanceSignupState } from "@captureflow/selfhost/instance";
import { requireAdmin } from "@/lib/session";
import { Badge, Card, PageHeader } from "@/app/_ui";
import { SignupPolicyForm } from "@/app/signup-policy";

export default async function SettingsPage() {
  const env = await requireAdmin();
  const setup = await getInstanceSignupState(env.DB);

  return (
    <>
      <PageHeader
        title="Settings"
        description="How people get in, and how this CaptureFlow reaches them."
      />

      <Card
        title="Sign-up"
        description={
          setup.domains.length > 0
            ? `Anyone with an address on ${setup.domains.map((d) => `@${d}`).join(" or ")} can create an account.`
            : "Only people you invite can create an account."
        }
      >
        <SignupPolicyForm domains={setup.domains} submitLabel="Save" />
      </Card>

      <Card
        title="Email"
        description="Invites and sign-in emails go out through the mail setup in the container's environment."
        action={
          env.MAIL_CONFIGURED ? (
            <Badge>Sending</Badge>
          ) : (
            <Badge tone="warn">Not set up</Badge>
          )
        }
      >
        <dl className="grid gap-3 text-sm sm:grid-cols-[10rem_1fr]">
          <dt className="text-fg-muted">From</dt>
          <dd className="text-fg-strong">{env.MAIL_FROM}</dd>
          <dt className="text-fg-muted">Delivery</dt>
          <dd className="text-fg-strong">
            {env.MAIL_CONFIGURED
              ? env.RESEND_API_KEY
                ? "Resend"
                : "SMTP"
              : "Printed to the container log. Set SMTP_URL or RESEND_API_KEY in .env and restart to send real mail; invite links on this admin work either way."}
          </dd>
        </dl>
      </Card>

      <Card title="This instance">
        <dl className="grid gap-3 text-sm sm:grid-cols-[10rem_1fr]">
          <dt className="text-fg-muted">Address</dt>
          <dd className="text-fg-strong">{env.APP_URL}</dd>
          <dt className="text-fg-muted">Data directory</dt>
          <dd className="text-fg-strong">{env.DATA_DIR}</dd>
          <dt className="text-fg-muted">Database</dt>
          <dd className="text-fg-strong">{env.DATA_DIR}/captureflow.sqlite</dd>
          <dt className="text-fg-muted">Media</dt>
          <dd className="text-fg-strong">{env.DATA_DIR}/storage</dd>
        </dl>
      </Card>
    </>
  );
}
