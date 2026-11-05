"use client";

import {
  useState,
  useTransition,
  type KeyboardEvent,
  type ReactElement,
} from "react";
import { UserPlus, X } from "lucide-react";
import { useAppLocale, useAppMessages } from "@/components/app-i18n-provider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getSeatPlan, type AssignableRole } from "@captureflow/quota";
import type { PaidSeats } from "@/lib/billing/seat-checkout";
import { fmt, plural } from "@/lib/i18n/format";
import { assignableRoles } from "@/lib/workspace/labels";
import { inviteMemberAction } from "./members/actions";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SEPARATORS = [",", " ", "Enter"];

type Result = { sent: string[]; failed: { email: string; error: string }[] };

type InviteModalProps = {
  // Rendered as a child, never cloned — see the wrapper below.
  trigger?: ReactElement;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  workspaceName?: string;
  paidSeats?: PaidSeats | null;
  selfHosted?: boolean;
};

export function InviteModal({
  trigger,
  isOpen,
  onOpenChange,
  workspaceName,
  paidSeats = null,
  selfHosted = false,
}: InviteModalProps = {}) {
  const m = useAppMessages();
  const { lang } = useAppLocale();
  const copy = m.members.invite;
  // In a paid workspace a member costs a seat, so the owner opts into it.
  const defaultRole: AssignableRole = paidSeats ? "viewer" : "member";
  const [ownOpen, setOwnOpen] = useState(false);
  // Controlled when a caller passes isOpen — the workspace switcher opens this
  // from inside a popover it has to close first, so the trigger can't live here.
  const controlled = isOpen !== undefined;
  const open = isOpen ?? ownOpen;
  const setOpen = onOpenChange ?? setOwnOpen;
  const [emails, setEmails] = useState<string[]>([]);
  const [role, setRole] = useState<AssignableRole>(defaultRole);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [isPending, startTransition] = useTransition();

  const reset = () => {
    setEmails([]);
    setRole(defaultRole);
    setDraft("");
    setError(null);
    setResult(null);
  };

  const commitDraft = () => {
    const value = draft.trim().replace(/,$/, "");
    if (!value) return;
    if (!emails.includes(value)) setEmails([...emails, value]);
    setDraft("");
    if (error) setError(null);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (SEPARATORS.includes(e.key)) {
      e.preventDefault();
      commitDraft();
      return;
    }
    if (e.key === "Backspace" && !draft && emails.length > 0) {
      setEmails(emails.slice(0, -1));
    }
  };

  const submit = () => {
    setError(null);
    setResult(null);
    const all = draft.trim() ? [...emails, draft.trim()] : emails;
    if (all.length === 0) {
      setError(copy.noEmails);
      return;
    }
    const invalid = all.filter((e) => !EMAIL_RE.test(e));
    if (invalid.length > 0) {
      setError(fmt(copy.invalidEmails, { emails: invalid.join(", ") }));
      return;
    }
    setDraft("");
    startTransition(async () => {
      const sent: string[] = [];
      const failed: { email: string; error: string }[] = [];
      for (const email of all) {
        const fd = new FormData();
        fd.set("email", email);
        fd.set("role", role);
        const res = await inviteMemberAction({ error: null, ok: null }, fd);
        if (res.ok) sent.push(email);
        else failed.push({ email, error: res.error ?? copy.failed });
      }
      setResult({ sent, failed });
      setEmails(failed.map((f) => f.email));
    });
  };

  return (
    <>
      {/*
       * The trigger is rendered, never cloned. Server components pass this
       * prop, and React can deliver a server-created element to a client
       * component as a lazy reference — cloneElement reads `.type` off that
       * wrapper, gets undefined, and the whole page dies with "Element type is
       * invalid".
       */}
      {!controlled && (
        <span className="contents" onClickCapture={() => setOpen(true)}>
          {trigger ?? (
            <Button variant="secondary">
              <UserPlus size={16} />
              {copy.trigger}
            </Button>
          )}
        </span>
      )}
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next) {
            setOpen(false);
            reset();
          }
        }}
      >
        <DialogContent
          data-split="invite-modal"
          showCloseButton={false}
          className="sm:max-w-xl"
        >
          <DialogHeader>
            <DialogTitle>
              {workspaceName
                ? fmt(copy.title, { workspace: workspaceName })
                : copy.titleOwnWorkspace}
            </DialogTitle>
          </DialogHeader>
          <div>
            <DialogDescription className="mb-3">
              {copy.description}
            </DialogDescription>

            {/* The container is the field: it owns the border and the focus
                ring, so the inner control is a bare <input>. */}
            <div className="flex max-h-48 min-h-9 flex-wrap items-center gap-1.5 overflow-y-auto rounded-xl border border-input bg-input/30 px-2 py-1.5 transition-[color,box-shadow] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 motion-reduce:transition-none">
              {emails.map((email) => (
                <Badge key={email} variant="secondary">
                  {email}
                  <button
                    type="button"
                    aria-label={fmt(copy.removeEmail, { email })}
                    onClick={() => setEmails(emails.filter((e) => e !== email))}
                    className="ml-1 cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </Badge>
              ))}
              <input
                type="text"
                className="min-w-40 flex-1 bg-transparent px-1 py-0.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                placeholder={copy.addEmails}
                aria-label={copy.addEmails}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={onKeyDown}
                onBlur={commitDraft}
              />
            </div>
            <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
              {copy.separatorHint}
            </p>

            <RadioGroup
              value={role}
              onValueChange={(value) => setRole(value as AssignableRole)}
              aria-label={m.members.role}
              className="mt-4 grid-cols-1 sm:grid-cols-2"
            >
              {assignableRoles(selfHosted, m.members).map((option) => (
                <FieldLabel
                  key={option.id}
                  htmlFor={`invite-role-${option.id}`}
                >
                  <Field orientation="horizontal">
                    <FieldContent>
                      <FieldTitle>{option.label}</FieldTitle>
                      <FieldDescription>{option.hint}</FieldDescription>
                    </FieldContent>
                    <RadioGroupItem
                      value={option.id}
                      id={`invite-role-${option.id}`}
                    />
                  </Field>
                </FieldLabel>
              ))}
            </RadioGroup>

            {paidSeats && role === "member" && (
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                {fmt(copy.paidSeatNote, {
                  plan: getSeatPlan(paidSeats.plan).name,
                  price:
                    paidSeats.cycle === "annual"
                      ? getSeatPlan(paidSeats.plan).priceAnnualUsdPerMonth
                      : getSeatPlan(paidSeats.plan).priceMonthlyUsd,
                })}
              </p>
            )}

            {error && (
              <Alert variant="destructive" className="mt-3">
                <AlertTitle>{error}</AlertTitle>
              </Alert>
            )}
            {result && (
              <div className="mt-3 flex flex-col gap-2">
                {result.sent.length > 0 && (
                  <Alert>
                    <AlertTitle>
                      {plural(copy.sent, result.sent.length, lang)}
                    </AlertTitle>
                  </Alert>
                )}
                {result.failed.length > 0 && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      <ul className="m-0 list-disc ps-4">
                        {result.failed.map((f) => (
                          <li key={f.email}>
                            {f.email}: {f.error}
                          </li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => {
                setOpen(false);
                reset();
              }}
            >
              {m.common.cancel}
            </Button>
            <Button
              onClick={submit}
              disabled={isPending || (emails.length === 0 && !draft.trim())}
            >
              {isPending ? copy.sending : copy.submit}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
