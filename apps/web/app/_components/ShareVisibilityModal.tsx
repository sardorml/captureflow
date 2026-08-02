"use client";

import { useEffect, useState } from "react";
import { Check, Globe, Link2, Lock, Users } from "lucide-react";
import { Alert, Button, Modal, Radio, RadioGroup } from "@heroui/react";

export type Visibility = "public" | "workspace" | "private";

const VISIBILITY_LABELS: Record<Visibility, string> = {
  public: "Public",
  workspace: "Workspace",
  private: "Private",
};

const VISIBILITY_DESCRIPTIONS: Record<Visibility, string> = {
  public: "Anyone with the link can view",
  workspace: "Only signed-in workspace members can view",
  private: "Only you can view",
};

function VisibilityIcon({ value }: { value: Visibility }) {
  const Icon =
    value === "public" ? Globe : value === "workspace" ? Users : Lock;
  return <Icon className="h-4 w-4" />;
}

function VisibilityTile({
  value,
  workspaceName,
}: {
  value: Visibility;
  workspaceName?: string | null;
}) {
  return (
    <div className="flex items-start gap-3 py-1">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-tint text-fg-muted">
        <VisibilityIcon value={value} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-fg">
          {value === "workspace" && workspaceName
            ? `Workspace · ${workspaceName}`
            : VISIBILITY_LABELS[value]}
        </span>
        <span className="block text-xs text-fg-muted">
          {VISIBILITY_DESCRIPTIONS[value]}
        </span>
      </span>
    </div>
  );
}

export type ShareVisibilityModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  visibility: Visibility;
  onChange: (next: Visibility) => void;
  canEdit?: boolean;
  // Null when the resource has no workspace (legacy anonymous uploads); the
  // Workspace option is then hidden unless it is already the current value.
  workspaceName?: string | null;
  allowPublic?: boolean;
  pending?: boolean;
  error?: string | null;
  shareUrl?: string;
};

export function ShareVisibilityModal({
  open,
  onClose,
  title,
  visibility,
  onChange,
  canEdit = true,
  workspaceName,
  allowPublic = true,
  pending = false,
  error,
  shareUrl,
}: ShareVisibilityModalProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);

  const copyLink = () => {
    if (typeof window === "undefined" || !shareUrl) return;
    void navigator.clipboard
      .writeText(shareUrl)
      .then(() => setCopied(true))
      .catch(() => setCopied(false));
  };

  const renderPublic = allowPublic || visibility === "public";
  const renderWorkspace = !!workspaceName || visibility === "workspace";
  const options = [
    renderPublic ? "public" : null,
    renderWorkspace ? "workspace" : null,
    "private",
  ].filter(Boolean) as Visibility[];

  return (
    <Modal isOpen={open} onOpenChange={(next) => !next && onClose()}>
      <Modal.Backdrop>
        <Modal.Container size="sm">
          <Modal.Dialog>
            <Modal.Header>
              <Modal.Heading>{title}</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <p className="text-xs font-semibold uppercase tracking-wider text-fg-muted">
                General access
              </p>
              <div className="mt-2">
                {canEdit ? (
                  <RadioGroup
                    value={visibility}
                    onChange={(next) => onChange(next as Visibility)}
                    isDisabled={pending}
                    className="flex flex-col gap-1"
                  >
                    {/* Radio.Content is the clickable control; plain children
                        skip it, so the row renders no selected state at all.
                        The tiles carry their own icon, so selection shows as a
                        wash + trailing check rather than a radio dot. */}
                    {options.map((value) => (
                      <Radio key={value} value={value}>
                        {({ isSelected }) => (
                          <Radio.Content
                            className={[
                              "flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-colors motion-reduce:transition-none",
                              isSelected
                                ? "bg-tint ring-1 ring-inset ring-accent"
                                : "hover:bg-tint",
                            ].join(" ")}
                          >
                            <span className="min-w-0 flex-1">
                              <VisibilityTile
                                value={value}
                                workspaceName={workspaceName}
                              />
                            </span>
                            {isSelected ? (
                              <Check
                                size={16}
                                className="shrink-0 text-accent"
                              />
                            ) : null}
                          </Radio.Content>
                        )}
                      </Radio>
                    ))}
                  </RadioGroup>
                ) : (
                  <div className="rounded-lg border border-line-strong bg-canvas-2 px-3 py-2">
                    <VisibilityTile
                      value={visibility}
                      workspaceName={workspaceName}
                    />
                  </div>
                )}
              </div>
              {error && (
                <Alert status="danger" className="mt-3">
                  <Alert.Content>
                    <Alert.Title>{error}</Alert.Title>
                  </Alert.Content>
                </Alert>
              )}
            </Modal.Body>
            <Modal.Footer className="flex items-center justify-between">
              {shareUrl ? (
                <Button variant="ghost" onPress={copyLink}>
                  {copied ? <Check size={16} /> : <Link2 size={16} />}
                  {copied ? "Link copied" : "Copy link"}
                </Button>
              ) : (
                <span />
              )}
              <Button variant="secondary" onPress={onClose}>
                Done
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
