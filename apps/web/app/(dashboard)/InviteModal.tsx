"use client";

import {
  useState,
  useTransition,
  type KeyboardEvent,
  type ReactElement,
} from "react";
import { UserPlus, X } from "lucide-react";
import { Alert, Button, Chip, Modal, Typography } from "@heroui/react";
import { inviteMemberAction } from "./members/actions";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SEPARATORS = [",", " ", "Enter"];

type Result = { sent: string[]; failed: { email: string; error: string }[] };

type InviteModalProps = {
  // Rendered as a child, never cloned — see the wrapper below.
  trigger?: ReactElement;
};

export function InviteModal({ trigger }: InviteModalProps = {}) {
  const [open, setOpen] = useState(false);
  const [emails, setEmails] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [isPending, startTransition] = useTransition();

  const reset = () => {
    setEmails([]);
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
      setError("Add at least one email");
      return;
    }
    const invalid = all.filter((e) => !EMAIL_RE.test(e));
    if (invalid.length > 0) {
      setError(`Not a valid email: ${invalid.join(", ")}`);
      return;
    }
    setDraft("");
    startTransition(async () => {
      const sent: string[] = [];
      const failed: { email: string; error: string }[] = [];
      for (const email of all) {
        const fd = new FormData();
        fd.set("email", email);
        const res = await inviteMemberAction({ error: null, ok: null }, fd);
        if (res.ok) sent.push(email);
        else failed.push({ email, error: res.error ?? "Failed" });
      }
      setResult({ sent, failed });
      setEmails(failed.map((f) => f.email));
    });
  };

  const triggerNode = trigger ?? (
    <Button variant="secondary">
      <UserPlus size={16} />
      Invite teammates
    </Button>
  );

  return (
    <>
      {/*
       * The trigger is rendered, never cloned. Server components pass this
       * prop, and React can deliver a server-created element to a client
       * component as a lazy reference — cloneElement reads `.type` off that
       * wrapper, gets undefined, and the whole page dies with "Element type is
       * invalid". Capture phase, because React Aria's usePress calls
       * stopPropagation() on click, so a bubbling handler here never fires.
       */}
      <span className="contents" onClickCapture={() => setOpen(true)}>
        {triggerNode}
      </span>
      <Modal
        isOpen={open}
        onOpenChange={(next) => {
          if (!next) {
            setOpen(false);
            reset();
          }
        }}
      >
        <Modal.Backdrop>
          <Modal.Container>
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Heading>
                  Invite teammates to your workspace
                </Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                <Typography.Paragraph color="muted">
                  They&rsquo;ll get an email with a link that expires in 7 days.
                  Make sure they sign in with the same address.
                </Typography.Paragraph>

                {/* The container is the field: it owns the fill and the focus
                    ring, so the inner control is a bare <input>. A HeroUI Input
                    here nests its own background/shadow inside this one — its
                    chrome can't be fully stripped from the wrapper. */}
                <div className="flex flex-wrap items-center gap-1.5 rounded-md bg-field p-2 transition-shadow focus-within:ring-2 focus-within:ring-focus motion-reduce:transition-none">
                  {emails.map((email) => (
                    <Chip key={email} size="sm">
                      {email}
                      <button
                        type="button"
                        aria-label={`Remove ${email}`}
                        onClick={() =>
                          setEmails(emails.filter((e) => e !== email))
                        }
                        className="ml-1 cursor-pointer"
                      >
                        <X size={12} />
                      </button>
                    </Chip>
                  ))}
                  <input
                    type="text"
                    className="min-w-40 flex-1 bg-transparent px-1 py-0.5 text-sm text-fg outline-none placeholder:text-fg-muted"
                    placeholder="Add emails"
                    aria-label="Add emails"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={onKeyDown}
                    onBlur={commitDraft}
                  />
                </div>
                <Typography type="body-xs" color="muted">
                  Separate emails with a space, comma, or enter.
                </Typography>

                {error && (
                  <Alert status="danger" className="mt-3">
                    <Alert.Content>
                      <Alert.Title>{error}</Alert.Title>
                    </Alert.Content>
                  </Alert>
                )}
                {result && (
                  <div className="mt-3 flex flex-col gap-2">
                    {result.sent.length > 0 && (
                      <Alert status="success">
                        <Alert.Content>
                          <Alert.Title>
                            {`Sent ${result.sent.length} ${
                              result.sent.length === 1 ? "invite" : "invites"
                            }.`}
                          </Alert.Title>
                        </Alert.Content>
                      </Alert>
                    )}
                    {result.failed.length > 0 && (
                      <Alert status="danger">
                        <Alert.Content>
                          <Alert.Description>
                            <ul className="m-0 list-disc ps-4">
                              {result.failed.map((f) => (
                                <li key={f.email}>
                                  {f.email}: {f.error}
                                </li>
                              ))}
                            </ul>
                          </Alert.Description>
                        </Alert.Content>
                      </Alert>
                    )}
                  </div>
                )}
              </Modal.Body>
              <Modal.Footer className="flex justify-end gap-2">
                <Button
                  variant="secondary"
                  onPress={() => {
                    setOpen(false);
                    reset();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onPress={submit}
                  isDisabled={
                    isPending || (emails.length === 0 && !draft.trim())
                  }
                >
                  {isPending ? "Sending…" : "Send invites"}
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </>
  );
}
