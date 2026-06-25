"use client";

import { useState, useTransition } from "react";
import { UserPlus } from "lucide-react";
import { Alert, Button, Modal, Select, Typography } from "antd";
import { inviteMemberAction } from "./members/actions";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Result = { sent: string[]; failed: { email: string; error: string }[] };

type InviteModalProps = {
  trigger?: React.ReactNode;
};

export function InviteModal({ trigger }: InviteModalProps = {}) {
  const [open, setOpen] = useState(false);
  const [emails, setEmails] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [isPending, startTransition] = useTransition();

  const reset = () => {
    setEmails([]);
    setError(null);
    setResult(null);
  };

  const submit = () => {
    setError(null);
    setResult(null);
    if (emails.length === 0) {
      setError("Add at least one email");
      return;
    }
    const invalid = emails.filter((e) => !EMAIL_RE.test(e));
    if (invalid.length > 0) {
      setError(`Not a valid email: ${invalid.join(", ")}`);
      return;
    }
    startTransition(async () => {
      const sent: string[] = [];
      const failed: { email: string; error: string }[] = [];
      for (const email of emails) {
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
    <Button icon={<UserPlus size={16} />}>Invite teammates</Button>
  );

  return (
    <>
      <span onClick={() => setOpen(true)} style={{ display: "contents" }}>
        {triggerNode}
      </span>
      <Modal
        open={open}
        onCancel={() => {
          setOpen(false);
          reset();
        }}
        onOk={submit}
        okText={isPending ? "Sending…" : "Send invites"}
        confirmLoading={isPending}
        okButtonProps={{ disabled: emails.length === 0 }}
        title="Invite teammates to your workspace"
      >
        <Typography.Paragraph type="secondary">
          They&rsquo;ll get an email with a link that expires in 7 days. Make
          sure they sign in with the same address.
        </Typography.Paragraph>
        <Select
          mode="tags"
          open={false}
          suffixIcon={null}
          style={{ width: "100%" }}
          placeholder="Add emails"
          tokenSeparators={[",", " "]}
          value={emails}
          onChange={(value: string[]) => {
            setEmails(value);
            if (error) setError(null);
          }}
        />
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          Separate emails with a space, comma, or enter.
        </Typography.Text>

        {error && (
          <Alert
            type="error"
            showIcon
            message={error}
            style={{ marginTop: 12 }}
          />
        )}
        {result && (
          <div
            style={{
              marginTop: 12,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {result.sent.length > 0 && (
              <Alert
                type="success"
                showIcon
                message={`Sent ${result.sent.length} ${
                  result.sent.length === 1 ? "invite" : "invites"
                }.`}
              />
            )}
            {result.failed.length > 0 && (
              <Alert
                type="error"
                showIcon
                message={
                  <ul style={{ margin: 0, paddingInlineStart: 16 }}>
                    {result.failed.map((f) => (
                      <li key={f.email}>
                        {f.email}: {f.error}
                      </li>
                    ))}
                  </ul>
                }
              />
            )}
          </div>
        )}
      </Modal>
    </>
  );
}
