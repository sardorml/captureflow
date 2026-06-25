"use client";

import { useActionState, useRef } from "react";
import { Upload } from "lucide-react";
import { Avatar, Button, Flex, Typography } from "antd";
import { initials } from "@/lib/format";
import {
  removeWorkspaceLogoAction,
  uploadWorkspaceLogoAction,
} from "./actions";

type FormState = { error: string | null; ok: string | null };
const INITIAL: FormState = { error: null, ok: null };

export function WorkspaceLogoForm({
  logoUrl,
  workspaceName,
}: {
  logoUrl: string | null;
  workspaceName: string;
}) {
  const [state, formAction, pending] = useActionState(
    uploadWorkspaceLogoAction,
    INITIAL,
  );
  const fileRef = useRef<HTMLInputElement>(null);

  const submitOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    (e.currentTarget.form as HTMLFormElement).requestSubmit();
  };

  return (
    <Flex gap={24} wrap align="flex-start" justify="space-between">
      <Flex vertical gap={4} flex={1} style={{ minWidth: 240 }}>
        <Typography.Text strong>Workspace logo</Typography.Text>
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          Shown next to your workspace name. PNG, JPEG, WebP, GIF, or SVG. Max 2
          MB.
        </Typography.Text>
      </Flex>
      <Flex align="center" gap={16} style={{ width: "100%", maxWidth: 384 }}>
        <Avatar shape="square" size={56} src={logoUrl ?? undefined}>
          {initials(workspaceName)}
        </Avatar>
        <Flex vertical gap={8} flex={1} align="stretch">
          <form action={formAction}>
            <input
              ref={fileRef}
              type="file"
              name="logo"
              accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
              style={{ display: "none" }}
              onChange={submitOnChange}
            />
            <Flex gap={8} align="center" justify="flex-end">
              <Button
                icon={<Upload size={14} />}
                loading={pending}
                onClick={() => fileRef.current?.click()}
              >
                {pending ? "Uploading…" : logoUrl ? "Replace" : "Upload logo"}
              </Button>
              {logoUrl && (
                <form action={removeWorkspaceLogoAction}>
                  <Button type="text" danger htmlType="submit" size="small">
                    Remove
                  </Button>
                </form>
              )}
            </Flex>
          </form>
          {state.error && (
            <Typography.Text
              type="danger"
              style={{ fontSize: 12, textAlign: "right" }}
            >
              {state.error}
            </Typography.Text>
          )}
        </Flex>
      </Flex>
    </Flex>
  );
}
