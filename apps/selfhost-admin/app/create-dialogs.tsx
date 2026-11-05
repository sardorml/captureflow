"use client";

import {
  useActionState,
  useEffect,
  useId,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { cn } from "@captureflow/ui/cn";
import { Alert, Button, EmailSetupLink, Input, Select } from "./_ui";
import { Dialog } from "./_dialog";
import { CopyableLink } from "./forms";
import {
  createUserAction,
  createWorkspaceAction,
  loadCreateOptionsAction,
  type CreateOptions,
} from "./actions";

function useCreateOptions(): CreateOptions | null {
  const [options, setOptions] = useState<CreateOptions | null>(null);
  useEffect(() => {
    let live = true;
    void loadCreateOptionsAction().then((loaded) => {
      if (live) setOptions(loaded);
    });
    return () => {
      live = false;
    };
  }, []);
  return options;
}

function Field({
  label,
  hint,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-fg-strong">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-fg-muted">{hint}</p>}
    </div>
  );
}

type Choice = { id: string; label: string; detail?: string };

// Rows are hidden, not removed, while filtering, so a ticked one still submits.
function Checklist({
  name,
  choices,
  empty,
}: {
  name: string;
  choices: Choice[];
  empty: string;
}) {
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  if (choices.length === 0) {
    return <p className="text-sm text-fg-muted">{empty}</p>;
  }
  return (
    <div className="flex flex-col gap-2">
      {choices.length > 8 && (
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter"
          aria-label="Filter"
        />
      )}
      <div className="max-h-44 overflow-y-auto rounded-lg border border-input">
        {choices.map((choice) => (
          <label
            key={choice.id}
            className={cn(
              "flex cursor-pointer items-center gap-3 px-3 py-2 text-sm hover:bg-tint",
              needle &&
                !`${choice.label} ${choice.detail ?? ""}`
                  .toLowerCase()
                  .includes(needle) &&
                "hidden",
            )}
          >
            <input type="checkbox" name={name} value={choice.id} />
            <span className="min-w-0 flex-1 truncate text-fg">
              {choice.label}
            </span>
            {choice.detail && (
              <span className="truncate text-xs text-fg-muted">
                {choice.detail}
              </span>
            )}
          </label>
        ))}
      </div>
    </div>
  );
}

function RoleSelect({ name }: { name: string }) {
  return (
    <Select name={name} defaultValue="member" aria-label="Role">
      <option value="member">As members, who record</option>
      <option value="viewer">As viewers, who watch and comment</option>
    </Select>
  );
}

function Footer({
  onClose,
  pending,
  label,
  pendingLabel,
}: {
  onClose: () => void;
  pending: boolean;
  label: string;
  pendingLabel: string;
}) {
  return (
    <div className="flex justify-end gap-2 pt-1">
      <Button variant="secondary" onClick={onClose}>
        Cancel
      </Button>
      <Button type="submit" disabled={pending}>
        {pending ? pendingLabel : label}
      </Button>
    </div>
  );
}

export function CreateUserDialog({ onClose }: { onClose: () => void }) {
  const [round, setRound] = useState(0);
  return (
    <Dialog
      title="Add user"
      description="Creates the account right away. They choose their own password from a link sent to their email."
      onClose={onClose}
    >
      <UserForm
        key={round}
        onClose={onClose}
        onAnother={() => setRound((r) => r + 1)}
      />
    </Dialog>
  );
}

function UserForm({
  onClose,
  onAnother,
}: {
  onClose: () => void;
  onAnother: () => void;
}) {
  const id = useId();
  const options = useCreateOptions();
  const [state, action, pending] = useActionState(createUserAction, {
    error: null,
    email: null,
    link: null,
  });

  if (state.email) {
    return (
      <div className="flex flex-col gap-4">
        {state.link ? (
          <>
            <Alert tone="warn">
              The account is ready, but no email was sent: email isn&rsquo;t set
              up on this CaptureFlow. <EmailSetupLink /> so new users are
              emailed automatically.
            </Alert>
            <CopyableLink link={state.link} label="Password link">
              Until then, send {state.email} this link yourself to set their
              password. It works once, for 7 days.
            </CopyableLink>
          </>
        ) : (
          <Alert>
            The account is ready. We emailed {state.email} a link to set their
            password. It works once, for 7 days.
          </Alert>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onAnother}>
            Add another
          </Button>
          <Button onClick={onClose}>Done</Button>
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      {options && !options.mailConfigured && (
        <Alert tone="warn">
          Email isn&rsquo;t set up on this CaptureFlow, so new users can&rsquo;t
          be emailed. <EmailSetupLink /> first, or create the user and send them
          their link yourself.
        </Alert>
      )}
      <Field label="Full name" htmlFor={`${id}-name`}>
        <Input id={`${id}-name`} name="name" required maxLength={80} />
      </Field>
      <Field label="Email" htmlFor={`${id}-email`}>
        <Input
          id={`${id}-email`}
          name="email"
          type="email"
          required
          placeholder="name@example.com"
        />
      </Field>
      <label className="flex cursor-pointer items-start gap-3 rounded-lg bg-tint p-3 text-sm">
        <input type="checkbox" name="admin" className="mt-0.5" />
        <span>
          <span className="font-medium text-fg-strong">Administrator</span>
          <span className="block text-fg-muted">
            Can open the admin area and manage every user and workspace.
          </span>
        </span>
      </label>
      <Field
        label="Workspaces"
        hint="They also get a personal workspace of their own."
      >
        {options ? (
          <Checklist
            name="workspaceId"
            choices={options.workspaces.map((w) => ({
              id: w.id,
              label: w.name,
            }))}
            empty="No team workspaces yet. You can add them to one later."
          />
        ) : (
          <p className="text-sm text-fg-muted">Loading workspaces…</p>
        )}
        {options && options.workspaces.length > 0 && (
          <RoleSelect name="workspaceRole" />
        )}
      </Field>
      {state.error && <Alert tone="error">{state.error}</Alert>}
      <Footer
        onClose={onClose}
        pending={pending}
        label="Create user"
        pendingLabel="Creating…"
      />
    </form>
  );
}

export function CreateWorkspaceDialog({ onClose }: { onClose: () => void }) {
  const id = useId();
  const router = useRouter();
  const options = useCreateOptions();
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [state, action, pending] = useActionState(createWorkspaceAction, {
    error: null,
    id: null,
  });
  useEffect(() => {
    if (state.id) router.push(`/workspaces/${state.id}`);
  }, [state.id, router]);

  const owner = ownerId ?? options?.currentUserId ?? "";
  return (
    <Dialog
      title="New workspace"
      description="A workspace is where a team keeps its recordings."
      onClose={onClose}
    >
      <form action={action} className="flex flex-col gap-4">
        <Field label="Name" htmlFor={`${id}-name`}>
          <Input
            id={`${id}-name`}
            name="name"
            required
            maxLength={80}
            placeholder="For example Design, Support or the company name"
          />
        </Field>
        <Field
          label="Owner"
          htmlFor={`${id}-owner`}
          hint="The owner manages the workspace's members. You can change this later."
        >
          {options ? (
            <Select
              id={`${id}-owner`}
              name="ownerUserId"
              value={owner}
              onChange={(e) => setOwnerId(e.target.value)}
            >
              {options.users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.id === options.currentUserId
                    ? `${u.name || u.email} (you)`
                    : `${u.name || u.email}, ${u.email}`}
                </option>
              ))}
            </Select>
          ) : (
            <p className="text-sm text-fg-muted">Loading users…</p>
          )}
        </Field>
        <Field
          label="Members"
          hint="Users with an account join straight away. Invite new addresses from the workspace's page."
        >
          {options ? (
            <Checklist
              name="memberId"
              choices={options.users
                .filter((u) => u.id !== owner)
                .map((u) => ({
                  id: u.id,
                  label: u.name || u.email,
                  detail: u.email,
                }))}
              empty="No other users yet. Add users first, or invite people later."
            />
          ) : (
            <p className="text-sm text-fg-muted">Loading users…</p>
          )}
          {options && options.users.length > 1 && (
            <RoleSelect name="memberRole" />
          )}
        </Field>
        {state.error && <Alert tone="error">{state.error}</Alert>}
        <Footer
          onClose={onClose}
          pending={pending || !!state.id}
          label="Create workspace"
          pendingLabel="Creating…"
        />
      </form>
    </Dialog>
  );
}
