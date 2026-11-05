"use client";

import { useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { Alert, Button, Input, Select, Textarea } from "../_ui";
import {
  createWorkspaceAction,
  inviteManyAction,
  type InviteManyState,
} from "../actions";
import { SignupPolicyForm } from "../signup-policy";

const STEPS = [
  "Welcome",
  "Administrator",
  "Workspace",
  "Members",
  "Sign-up",
  "Done",
];

type Props = { appUrl: string; mailConfigured: boolean; initialStep: number };

export function SetupWizard({ appUrl, mailConfigured, initialStep }: Props) {
  const [step, setStep] = useState(initialStep);
  const [workspace, setWorkspace] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [invited, setInvited] = useState<InviteManyState["links"]>([]);
  const next = () => setStep((s) => s + 1);

  return (
    <div className="mx-auto w-full max-w-xl">
      <p className="text-sm font-medium text-fg-muted">
        {step === 0 || step === STEPS.length - 1
          ? "Setup"
          : `Step ${step} of ${STEPS.length - 2}`}
      </p>
      <div className="mt-3 rounded-2xl bg-panel p-6 ring-1 ring-line sm:p-8">
        {step === 0 && (
          <Screen
            title="Set up your CaptureFlow"
            description="This is a fresh install. In the next few steps you'll create the administrator account, name a workspace and invite its first members. It takes about a minute."
          >
            <Button onClick={next}>Get started</Button>
          </Screen>
        )}
        {step === 1 && <AccountStep onDone={next} />}
        {step === 2 && (
          <WorkspaceStep
            onDone={(created) => {
              setWorkspace(created);
              next();
            }}
          />
        )}
        {step === 3 && (
          <InviteStep
            workspaceId={workspace?.id ?? null}
            mailConfigured={mailConfigured}
            onDone={(links) => {
              setInvited(links);
              next();
            }}
          />
        )}
        {step === 4 && (
          <Screen
            title="Who can create an account?"
            description="You can change this any time from the Admin page."
          >
            <SignupPolicyForm
              domains={[]}
              finish
              submitLabel="Continue"
              onSaved={next}
            />
          </Screen>
        )}
        {step === 5 && (
          <Screen
            title="You're set up"
            description={[
              "Your administrator account is ready.",
              workspace ? `${workspace.name} is waiting for recordings.` : "",
              invited.length > 0
                ? `${invited.length} ${invited.length === 1 ? "person has" : "people have"} an invite.`
                : "",
              "Users, workspaces and sign-up stay under Admin in the sidebar.",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => window.location.assign(`${appUrl}/dashboard`)}
              >
                Open the dashboard
              </Button>
              <Link href="/">
                <Button variant="secondary">Go to Admin</Button>
              </Link>
            </div>
          </Screen>
        )}
      </div>
    </div>
  );
}

function Screen({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-fg-strong">
          {title}
        </h1>
        <p className="mt-2 text-base text-fg-muted">{description}</p>
      </div>
      {children}
    </div>
  );
}

function Label({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium text-fg">
      {children}
    </label>
  );
}

// The web app owns accounts, so this posts to its sign-up endpoint; the first
// account becomes the admin on the way in, and its cookie carries the steps
// that follow.
function AccountStep({ onDone }: { onDone: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/auth/sign-up/email", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: String(data.get("name") ?? "").trim(),
          email: String(data.get("email") ?? "").trim(),
          password: String(data.get("password") ?? ""),
          callbackURL: "/admin/setup",
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          message?: string;
        } | null;
        setError(body?.message ?? "Something went wrong. Please try again.");
        setBusy(false);
        return;
      }
      onDone();
    } catch {
      setError("Network error. Please try again.");
      setBusy(false);
    }
  }

  return (
    <Screen
      title="Create the administrator account"
      description="This account runs this CaptureFlow. You can make other users administrators later."
    >
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="setup-name">Your name</Label>
          <Input id="setup-name" name="name" required autoComplete="name" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="setup-email">Email</Label>
          <Input
            id="setup-email"
            name="email"
            type="email"
            required
            autoComplete="email"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="setup-password">Password</Label>
          <Input
            id="setup-password"
            name="password"
            type="password"
            required
            minLength={12}
            autoComplete="new-password"
            placeholder="At least 12 characters"
          />
        </div>
        {error && <Alert tone="error">{error}</Alert>}
        <div>
          <Button type="submit" disabled={busy}>
            {busy ? "Creating…" : "Create account"}
          </Button>
        </div>
      </form>
    </Screen>
  );
}

function WorkspaceStep({
  onDone,
}: {
  onDone: (workspace: { id: string; name: string } | null) => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    startTransition(async () => {
      const result = await createWorkspaceAction(
        { error: null, id: null },
        formData,
      );
      if (result.id) onDone({ id: result.id, name });
      else setError(result.error);
    });
  }

  return (
    <Screen
      title="Name your first workspace"
      description="A workspace is where a team keeps its recordings. You can create more later from the Admin page."
    >
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="setup-workspace">Workspace name</Label>
          <Input
            id="setup-workspace"
            name="name"
            required
            maxLength={80}
            placeholder="For example Design, Support or the company name"
          />
        </div>
        {error && <Alert tone="error">{error}</Alert>}
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={pending}>
            {pending ? "Creating…" : "Continue"}
          </Button>
          <Button
            variant="secondary"
            disabled={pending}
            onClick={() => onDone(null)}
          >
            Skip for now
          </Button>
        </div>
      </form>
    </Screen>
  );
}

function InviteStep({
  workspaceId,
  mailConfigured,
  onDone,
}: {
  workspaceId: string | null;
  mailConfigured: boolean;
  onDone: (links: InviteManyState["links"]) => void;
}) {
  const [state, setState] = useState<InviteManyState | null>(null);
  const [pending, startTransition] = useTransition();
  const [copied, setCopied] = useState<string | null>(null);

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      setState(await inviteManyAction({ error: null, links: [] }, formData));
    });
  }

  if (state && state.links.length > 0) {
    return (
      <Screen
        title="Invites are ready"
        description={
          mailConfigured
            ? "Each person has been emailed a link. You can also send these yourself."
            : "No mail is set up, so send each person their link yourself. A link works for 7 days."
        }
      >
        <ul className="flex flex-col gap-3">
          {state.links.map((item) => (
            <li key={item.email} className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-fg">{item.email}</span>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={item.link}
                  aria-label={`Invite link for ${item.email}`}
                  className="flex-1"
                />
                <Button
                  variant="secondary"
                  onClick={async () => {
                    await navigator.clipboard.writeText(item.link);
                    setCopied(item.email);
                  }}
                >
                  {copied === item.email ? "Copied" : "Copy"}
                </Button>
              </div>
            </li>
          ))}
        </ul>
        {state.error && <Alert tone="error">{state.error}</Alert>}
        <div>
          <Button onClick={() => onDone(state.links)}>Continue</Button>
        </div>
      </Screen>
    );
  }

  return (
    <Screen
      title="Invite your first members"
      description={
        workspaceId
          ? "They'll join the workspace you just created. Members record; viewers watch and comment."
          : "They'll join your personal workspace for now. Members record; viewers watch and comment."
      }
    >
      <form onSubmit={submit} className="flex flex-col gap-4">
        {workspaceId && (
          <input type="hidden" name="workspaceId" value={workspaceId} />
        )}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="setup-emails">Email addresses</Label>
          <Textarea
            id="setup-emails"
            name="emails"
            rows={4}
            placeholder={"one@example.com\ntwo@example.com"}
          />
          <p className="text-xs text-fg-muted">
            One per line, or separated by commas.
          </p>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="setup-role">Role</Label>
          <Select
            id="setup-role"
            name="role"
            defaultValue="member"
            className="w-40"
          >
            <option value="member">Member</option>
            <option value="viewer">Viewer</option>
          </Select>
        </div>
        {state?.error && <Alert tone="error">{state.error}</Alert>}
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={pending}>
            {pending ? "Inviting…" : "Send invites"}
          </Button>
          <Button
            variant="secondary"
            disabled={pending}
            onClick={() => onDone([])}
          >
            Skip for now
          </Button>
        </div>
      </form>
    </Screen>
  );
}
