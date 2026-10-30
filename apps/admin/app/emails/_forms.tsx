"use client";

import { type ReactNode, useActionState, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Search, X } from "lucide-react";
import {
  type Audience,
  type AudienceMember,
  renderCampaign,
} from "@captureflow/mail";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldDescription } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { FormState } from "../actions";
import { ActionButton, ActionForm, EMPTY, TextRow, keepTyped } from "../_form";
import { Notice, Tone } from "../_ui";
import {
  deleteCampaignAction,
  duplicateCampaignAction,
  sendCampaignAction,
  sendTestAction,
  type TestState,
} from "./actions";

// Lexical builds its DOM in the browser, so a server render could never match.
const EmailEditor = dynamic(
  () => import("./_editor").then((m) => m.EmailEditor),
  {
    ssr: false,
    loading: () => (
      <div className="border-line bg-transparent dark:bg-input/30 min-h-[344px] rounded-xl border" />
    ),
  },
);

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
        <Label>Recipients</Label>
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

      <ButtonGroup aria-label="Recipients" className="w-full">
        {(
          [
            ["all", "Everyone"],
            ["selected", "Choose people"],
          ] as const
        ).map(([value, label]) => (
          <Button
            key={value}
            type="button"
            variant={audience === value ? "secondary" : "outline"}
            aria-pressed={audience === value}
            onClick={() => onAudience(value)}
            className="flex-1"
          >
            {label}
          </Button>
        ))}
      </ButtonGroup>

      {audience === "selected" && (
        <Card className="gap-0 py-0">
          <div className="flex items-center gap-2 border-b p-2">
            <InputGroup className="min-w-0 flex-1">
              <InputGroupAddon>
                <Search aria-hidden />
              </InputGroupAddon>
              <InputGroupInput
                type="search"
                aria-label="Search people"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name or email"
              />
              {query && (
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    size="icon-xs"
                    aria-label="Clear search"
                    onClick={() => setQuery("")}
                  >
                    <X />
                  </InputGroupButton>
                </InputGroupAddon>
              )}
            </InputGroup>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => selectVisible(true)}
            >
              Select all
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => selectVisible(false)}
            >
              Clear
            </Button>
          </div>
          {visible.length === 0 ? (
            <p className="text-fg-muted p-4 text-center text-sm">
              Nobody matches “{query}”.
            </p>
          ) : (
            <div
              role="group"
              aria-label="People"
              className="flex max-h-80 flex-col overflow-y-auto p-1"
            >
              {visible.map((m) => (
                <label
                  key={m.email}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-2 py-1.5",
                    !m.unsubscribed && "cursor-pointer hover:bg-accent",
                  )}
                >
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium">
                      {m.name ?? m.email}
                    </span>
                    {m.name && (
                      <span className="truncate text-xs text-muted-foreground">
                        {m.email}
                      </span>
                    )}
                  </span>
                  {m.unsubscribed ? (
                    <Tone color="default">Unsubscribed</Tone>
                  ) : (
                    <Checkbox
                      checked={selected.has(m.email)}
                      onCheckedChange={(v) => {
                        const next = new Set(selected);
                        if (v === true) next.add(m.email);
                        else next.delete(m.email);
                        onSelected(next);
                      }}
                    />
                  )}
                </label>
              ))}
            </div>
          )}
        </Card>
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
      <Card className="min-w-0">
        <CardContent>
          <form
            action={formAction}
            ref={keepTyped}
            className="flex flex-col gap-5"
          >
            {id && <input type="hidden" name="id" value={id} />}
            <TextRow
              name="subject"
              label="Subject"
              value={subject}
              onChange={setSubject}
              placeholder="What's new in CaptureFlow"
            />
            <div className="flex flex-col gap-2">
              <Label>Message</Label>
              <input type="hidden" name="body" value={body} />
              <EmailEditor initialMarkdown={initial.body} onChange={setBody} />
              <FieldDescription>
                The unsubscribe footer is added for you.
              </FieldDescription>
            </div>
            <RecipientPicker
              members={members}
              audience={audience}
              onAudience={setAudience}
              selected={selected}
              onSelected={setSelected}
            />
            {state.error && <Notice tone="error">{state.error}</Notice>}
            <div className="flex items-center gap-3">
              <Button type="submit" disabled={pending}>
                {pending ? "Saving…" : submit}
              </Button>
              {id && dirty && (
                <span className="text-xs text-amber-700 dark:text-amber-400">
                  Unsaved changes
                </span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="flex min-w-0 flex-col gap-5 lg:sticky lg:top-6">
        <Card>
          <CardContent className="flex flex-col gap-3">
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
          </CardContent>
        </Card>
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
        disabled={pending}
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

export function DuplicateButton({ id }: { id: string }) {
  return (
    <ActionButton
      action={duplicateCampaignAction}
      label="Duplicate"
      busyLabel="Duplicating…"
    >
      <input type="hidden" name="id" value={id} />
    </ActionButton>
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
