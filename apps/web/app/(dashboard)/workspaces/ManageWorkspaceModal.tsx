"use client";

import { useRef, useState, useTransition } from "react";
import { Check, Upload, UserPlus } from "lucide-react";
import {
  Alert,
  Avatar,
  Button,
  Input,
  Modal,
  Spinner,
  Typography,
} from "@heroui/react";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  WORKSPACE_CARD_PRESETS,
  WORKSPACE_CARD_PRESET_KEYS,
  parseWorkspaceCard,
  workspaceCardGradient,
  workspaceCardStyle,
} from "@/lib/workspace-card";
import { WORKSPACE_IMAGE_ACCEPT } from "@/lib/workspace-images";
import { WORKSPACE_NAME_MAX } from "@/lib/workspace-name";
import type { WorkspaceCardData } from "./WorkspacesList";
import {
  removeWorkspaceLogoForAction,
  renameWorkspaceAction,
  setWorkspaceCardPresetAction,
  uploadWorkspaceCardAction,
  uploadWorkspaceLogoForAction,
} from "./actions";

type FormState = { error: string | null; ok: string | null };
const IDLE: FormState = { error: null, ok: null };

type Props = {
  workspace: WorkspaceCardData;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onInvite: () => void;
};

// Each section runs its own action with the workspace id in the form and
// shows its own outcome; the page behind refreshes as each one lands.
export function ManageWorkspaceModal({
  workspace,
  isOpen,
  onOpenChange,
  onInvite,
}: Props) {
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <Modal.Header>
              <Modal.Heading>Manage {workspace.name}</Modal.Heading>
            </Modal.Header>
            <Modal.Body className="flex flex-col gap-6">
              <NameSection workspace={workspace} />
              <LogoSection workspace={workspace} />
              <CardSection workspace={workspace} />
              <section className="flex flex-col gap-2">
                <SectionTitle
                  title="Members"
                  hint="Invites arrive by email and expire in 7 days."
                />
                <div>
                  <Button variant="secondary" onPress={onInvite}>
                    <UserPlus size={16} />
                    Invite teammates
                  </Button>
                </div>
              </section>
            </Modal.Body>
            <Modal.Footer className="flex justify-end">
              <Button variant="secondary" onPress={() => onOpenChange(false)}>
                Done
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}

function SectionTitle({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <Typography weight="semibold">{title}</Typography>
      <Typography type="body-xs" color="muted">
        {hint}
      </Typography>
    </div>
  );
}

function Outcome({ state }: { state: FormState }) {
  if (state.error) {
    return (
      <Alert status="danger">
        <Alert.Content>
          <Alert.Title>{state.error}</Alert.Title>
        </Alert.Content>
      </Alert>
    );
  }
  if (state.ok) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-success">
        <Check size={14} /> {state.ok}
      </span>
    );
  }
  return null;
}

function NameSection({ workspace }: { workspace: WorkspaceCardData }) {
  const [name, setName] = useState(workspace.name);
  const [state, setState] = useState<FormState>(IDLE);
  const [pending, start] = useTransition();
  const dirty = name.trim() !== workspace.name;
  const save = () =>
    start(async () => {
      const form = new FormData();
      form.set("workspaceId", workspace.id);
      form.set("name", name);
      setState(await renameWorkspaceAction(IDLE, form));
    });
  return (
    <section className="flex flex-col gap-2">
      <SectionTitle
        title="Name"
        hint="Shown in the switcher, on cards and in share previews."
      />
      <form
        className="flex items-start gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (dirty && !pending) save();
        }}
      >
        <Input
          aria-label="Workspace name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={WORKSPACE_NAME_MAX}
          className="flex-1"
        />
        <Button variant="primary" type="submit" isDisabled={!dirty || pending}>
          {pending && <Spinner size="sm" color="current" />}
          Save
        </Button>
      </form>
      <Outcome state={state} />
    </section>
  );
}

function LogoSection({ workspace }: { workspace: WorkspaceCardData }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<FormState>(IDLE);
  const [pending, start] = useTransition();
  const upload = (file: File) =>
    start(async () => {
      const form = new FormData();
      form.set("workspaceId", workspace.id);
      form.set("logo", file);
      setState(await uploadWorkspaceLogoForAction(IDLE, form));
    });
  const remove = () =>
    start(async () => {
      const form = new FormData();
      form.set("workspaceId", workspace.id);
      setState(await removeWorkspaceLogoForAction(form));
    });
  return (
    <section className="flex flex-col gap-2">
      <SectionTitle
        title="Logo"
        hint="PNG, JPEG, WebP, GIF or SVG, up to 2 MB."
      />
      <div className="flex items-center gap-3">
        <Avatar className="size-14 rounded-full">
          {workspace.logoUrl && (
            <Avatar.Image src={workspace.logoUrl} alt={workspace.name} />
          )}
          <Avatar.Fallback>{initials(workspace.name)}</Avatar.Fallback>
        </Avatar>
        <input
          ref={fileRef}
          type="file"
          accept={WORKSPACE_IMAGE_ACCEPT}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) upload(file);
          }}
        />
        <Button
          variant="secondary"
          isDisabled={pending}
          onPress={() => fileRef.current?.click()}
        >
          {pending ? (
            <Spinner size="sm" color="current" />
          ) : (
            <Upload size={14} />
          )}
          {workspace.logoUrl ? "Replace" : "Upload logo"}
        </Button>
        {workspace.logoUrl && (
          <Button
            variant="ghost"
            size="sm"
            isDisabled={pending}
            onPress={remove}
          >
            Remove
          </Button>
        )}
      </div>
      <Outcome state={state} />
    </section>
  );
}

function CardSection({ workspace }: { workspace: WorkspaceCardData }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<FormState>(IDLE);
  const [pending, start] = useTransition();
  const current = parseWorkspaceCard(workspace.cardBg);
  const pick = (preset: string) =>
    start(async () => {
      const form = new FormData();
      form.set("workspaceId", workspace.id);
      form.set("preset", preset);
      setState(await setWorkspaceCardPresetAction(form));
    });
  const upload = (file: File) =>
    start(async () => {
      const form = new FormData();
      form.set("workspaceId", workspace.id);
      form.set("image", file);
      setState(await uploadWorkspaceCardAction(IDLE, form));
    });
  const swatch =
    "size-9 rounded-lg ring-offset-2 ring-offset-panel transition-shadow hover:ring-2 hover:ring-line-strong";
  return (
    <section className="flex flex-col gap-2">
      <SectionTitle
        title="Card background"
        hint="A colour or a picture across the top of this workspace's card."
      />
      <div
        className="h-16 rounded-xl bg-tint"
        style={workspaceCardStyle(current, workspace.updatedAt)}
        aria-hidden="true"
      />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          aria-label="No background"
          aria-pressed={current === null}
          disabled={pending}
          onClick={() => pick("none")}
          className={cn(
            swatch,
            "flex items-center justify-center bg-tint text-[10px] font-medium text-fg-muted",
            current === null && "ring-2 ring-accent",
          )}
        >
          None
        </button>
        {WORKSPACE_CARD_PRESET_KEYS.map((key) => {
          const selected = current?.kind === "preset" && current.key === key;
          return (
            <button
              key={key}
              type="button"
              aria-label={WORKSPACE_CARD_PRESETS[key].label}
              aria-pressed={selected}
              disabled={pending}
              onClick={() => pick(key)}
              className={cn(swatch, selected && "ring-2 ring-accent")}
              style={{ background: workspaceCardGradient(key) }}
            />
          );
        })}
      </div>
      <div className="flex items-center gap-2">
        <input
          ref={fileRef}
          type="file"
          accept={WORKSPACE_IMAGE_ACCEPT}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) upload(file);
          }}
        />
        <Button
          variant="secondary"
          size="sm"
          isDisabled={pending}
          onPress={() => fileRef.current?.click()}
        >
          {pending ? (
            <Spinner size="sm" color="current" />
          ) : (
            <Upload size={14} />
          )}
          {current?.kind === "image" ? "Replace image" : "Upload image"}
        </Button>
      </div>
      <Outcome state={state} />
    </section>
  );
}
