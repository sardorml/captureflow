"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Plus } from "lucide-react";
import { Button } from "./_ui";

// The dialogs and what they pick from load on the first click, not with the page.
const CreateUserDialog = dynamic(
  () => import("./create-dialogs").then((m) => m.CreateUserDialog),
  { ssr: false },
);
const CreateWorkspaceDialog = dynamic(
  () => import("./create-dialogs").then((m) => m.CreateWorkspaceDialog),
  { ssr: false },
);

export function NewUserButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="size-4" aria-hidden />
        Add user
      </Button>
      {open && <CreateUserDialog onClose={() => setOpen(false)} />}
    </>
  );
}

export function NewWorkspaceButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="size-4" aria-hidden />
        New workspace
      </Button>
      {open && <CreateWorkspaceDialog onClose={() => setOpen(false)} />}
    </>
  );
}
