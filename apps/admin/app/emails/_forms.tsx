"use client";

import { type ReactNode, useActionState, useMemo, useState } from "react";
import {
  Button,
  Chip,
  Description,
  Input,
  Label,
  TextArea,
  TextField,
} from "@heroui/react";
import {
  type Audience,
  type AudienceMember,
  renderCampaign,
} from "@captureflow/mail";
import { cn } from "@captureflow/ui/cn";
import type { FormState } from "../actions";
import { ActionButton, ActionForm, EMPTY, TextRow, keepTyped } from "../_form";
import { Notice } from "../_ui";
import {
  deleteCampaignAction,
  sendCampaignAction,
  sendTestAction,
  type TestState,
} from "./actions";

const PREVIEW_UNSUBSCRIBE = "https://mail.captureflow.dev/unsubscribe";

function RecipientPicker({
  members,
  audience,
  onAudience,
  selected,
  onSelected,
}: {
  members: AudienceMember[];
  audience: Audience;
  onAudience: (next: Audience) => void;
  selected: Set<string>;
  onSelected: (next: Set<string>) => void;
}) {
  const [query, setQuery] = useState("");
  const reachable = members.filter((m) => !m.unsubscribed);
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? members.filter(
          (m) => m.email.includes(q) || m.name?.toLowerCase().includes(q),
        )
      : members;
  }, [members, query]);

  const toggle = (email: string, on: boolean) => {
    const next = new Set(selected);
    if (on) next.add(email);
    else next.delete(email);
    onSelected(next);
  };
  const selectVisible = (on: boolean) => {
    const next = new Set(selected);
    for (const m of visible) {
      if (m.unsubscribed) continue;
      if (on) next.add(m.email);
      else next.delete(m.email);
    }
    onSelected(next);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium">Recipients</span>
        <span className="text-fg-muted text-xs tabular-nums">
          {audience === "all"
            ? `${reachable.length} people`
            : `${selected.size} of ${reachable.length} selected`}
        </span>
      </div>
      <input type="hidden" name="audience" value={audience} />
      {audience === "selected" &&
        [...selected].map((email) => (
          <input key={email} type="hidden" name="recipient" value={email} />
        ))}

      <div
        role="radiogroup"
        aria-label="Recipients"
        className="bg-canvas grid grid-cols-2 gap-1 rounded-xl p-1"
      >
        {(
          [
            ["all", "Everyone", "Every account that hasn't unsubscribed"],
            ["selected", "Choose people", "Only the accounts you tick"],
          ] as const
        ).map(([value, label, hint]) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={audience === value}
            onClick={() => onAudience(value)}
            className={cn(
              "flex cursor-pointer flex-col items-start rounded-lg px-3 py-2 text-left transition-colors motion-reduce:transition-none",
              audience === value
                ? "bg-tint-strong text-fg-strong"
                : "text-fg-muted hover:text-fg",
            )}
          >
            <span className="text-sm font-medium">{label}</span>
            <span className="text-fg-subtle text-xs">{hint}</span>
          </button>
        ))}
      </div>

      {audience === "selected" && (
        <div className="border-line flex flex-col overflow-hidden rounded-xl border">
          <div className="border-line flex items-center gap-2 border-b p-2">
            <Input
              aria-label="Search people"
              placeholder="Search name or email"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="min-w-0 flex-1"
            />
            <Button
              size="sm"
              variant="ghost"
              onPress={() => selectVisible(true)}
            >
              Select all
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onPress={() => selectVisible(false)}
            >
              Clear
            </Button>
          </div>
          <ul className="max-h-80 overflow-y-auto">
            {visible.length === 0 && (
              <li className="text-fg-muted p-4 text-center text-sm">
                Nobody matches “{query}”.
              </li>
            )}
            {visible.map((m) => (
              <li
                key={m.email}
                className="border-line border-b last:border-b-0"
              >
                <label
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5",
                    m.unsubscribed
                      ? "cursor-not-allowed opacity-60"
                      : "hover:bg-tint cursor-pointer",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={!m.unsubscribed && selected.has(m.email)}
                    disabled={m.unsubscribed}
                    onChange={(e) => toggle(m.email, e.target.checked)}
                    className="accent-accent-bg size-4 shrink-0 cursor-[inherit]"
                  />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="text-fg truncate text-sm">
                      {m.name ?? m.email}
                    </span>
                    {m.name && (
                      <span className="text-fg-subtle truncate text-xs">
                        {m.email}
                      </span>
                    )}
                  </span>
                  {m.unsubscribed && <Chip size="sm">Unsubscribed</Chip>}
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/*
 * Write on the left, a live preview on the right. Everything in the form saves
 * together; `aside` holds the test and send controls, which act on what was
 * last saved.
 */
export function Composer({
  action,
  submit,
  members,
  id,
  initial,
  aside,
}: {
  action: (prev: FormState, data: FormData) => Promise<FormState>;
  submit: string;
  members: AudienceMember[];
  id?: string;
  initial: {
    subject: string;
    body: string;
    audience: Audience;
    emails: string[];
  };
  aside?: ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, EMPTY);
  const [subject, setSubject] = useState(initial.subject);
  const [body, setBody] = useState(initial.body);
  const [audience, setAudience] = useState<Audience>(initial.audience);
  const [selected, setSelected] = useState(() => new Set(initial.emails));
  const preview = useMemo(
    () =>
      renderCampaign({
        subject,
        body: body || "_Your message appears here._",
        unsubscribeUrl: PREVIEW_UNSUBSCRIBE,
      }).html,
    [subject, body],
  );
  const dirty =
    subject !== initial.subject ||
    body !== initial.body ||
    audience !== initial.audience ||
    selected.size !== initial.emails.length ||
    initial.emails.some((e) => !selected.has(e));

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <form
        action={formAction}
        ref={keepTyped}
        className="border-line bg-panel flex min-w-0 flex-col gap-5 rounded-xl border p-5"
      >
        {id && <input type="hidden" name="id" value={id} />}
        <TextRow
          name="subject"
          label="Subject"
          value={subject}
          onChange={setSubject}
          placeholder="What's new in CaptureFlow"
        />
        <TextField name="body" fullWidth value={body} onChange={setBody}>
          <Label>Message</Label>
          <TextArea rows={12} className="font-mono text-sm" />
          <Description>
            Markdown: **bold**, [link](https://captureflow.dev), # heading, -
            list. The unsubscribe footer is added for you.
          </Description>
        </TextField>
        <RecipientPicker
          members={members}
          audience={audience}
          onAudience={setAudience}
          selected={selected}
          onSelected={setSelected}
        />
        {state.error && <Notice tone="error">{state.error}</Notice>}
        <div className="flex items-center gap-3">
          <Button type="submit" variant="primary" isDisabled={pending}>
            {pending ? "Saving…" : submit}
          </Button>
          {id && dirty && (
            <span className="text-warning text-xs">Unsaved changes</span>
          )}
        </div>
      </form>

      <div className="flex min-w-0 flex-col gap-5 lg:sticky lg:top-6">
        <section className="border-line bg-panel flex flex-col gap-3 rounded-xl border p-5">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm font-semibold">Preview</span>
            <span className="text-fg-subtle truncate text-xs">
              {subject || "No subject"}
            </span>
          </div>
          <iframe
            title="Email preview"
            srcDoc={preview}
            sandbox=""
            className="h-[420px] w-full rounded-lg border-0 bg-white"
          />
        </section>
        {id && dirty && aside && (
          <Notice>
            Save the draft first: test and send use the saved version.
          </Notice>
        )}
        {aside}
      </div>
    </div>
  );
}

const NO_TEST: TestState = { error: null, sentTo: null };

export function SendTestForm({ id }: { id: string }) {
  const [state, action, pending] = useActionState(sendTestAction, NO_TEST);
  return (
    <form action={action} ref={keepTyped} className="flex flex-col gap-3">
      <input type="hidden" name="id" value={id} />
      {state.error && <Notice tone="error">{state.error}</Notice>}
      {state.sentTo && (
        <Notice>
          Test on its way to {state.sentTo}. It takes a few seconds.
        </Notice>
      )}
      <Button
        type="submit"
        variant="secondary"
        isDisabled={pending}
        className="w-fit"
      >
        {pending ? "Sending…" : "Send me a test"}
      </Button>
    </form>
  );
}

export function SendCampaignForm({
  id,
  recipients,
}: {
  id: string;
  recipients: number;
}) {
  return (
    <ActionForm
      action={sendCampaignAction}
      submit={`Send to ${recipients} ${recipients === 1 ? "person" : "people"}`}
      busy="Starting…"
    >
      <input type="hidden" name="id" value={id} />
      <TextRow
        name="confirm"
        label="Type SEND to confirm"
        hint="Sending can't be undone or stopped once it starts."
        autoComplete="off"
      />
    </ActionForm>
  );
}

export function DeleteDraftButton({ id }: { id: string }) {
  return (
    <ActionButton
      action={deleteCampaignAction}
      label="Delete draft"
      busyLabel="Deleting…"
      variant="danger-soft"
    >
      <input type="hidden" name="id" value={id} />
    </ActionButton>
  );
}
