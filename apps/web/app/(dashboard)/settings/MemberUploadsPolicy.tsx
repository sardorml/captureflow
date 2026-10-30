"use client";

import { useId, useOptimistic, useTransition } from "react";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { setMemberUploadsPolicyAction } from "./actions";

const OPTIONS = [
  {
    value: "1",
    title: "Allow teammates to post here",
    body: "Members can record into this workspace.",
  },
  {
    value: "0",
    title: "Only the workspace owner",
    body: "Teammate uploads go to their personal workspace.",
  },
];

export function MemberUploadsPolicy({
  allowMemberUploads,
}: {
  allowMemberUploads: boolean;
}) {
  const id = useId();
  const [pending, startTransition] = useTransition();
  const [allow, setAllow] = useOptimistic(allowMemberUploads);

  const onValueChange = (value: string) => {
    if (pending) return;
    startTransition(async () => {
      setAllow(value === "1");
      const form = new FormData();
      form.set("allow_member_uploads", value);
      await setMemberUploadsPolicyAction(form);
    });
  };

  return (
    <RadioGroup
      value={allow ? "1" : "0"}
      onValueChange={onValueChange}
      aria-label="Recording access"
      aria-busy={pending}
      className="grid-cols-1 sm:grid-cols-2"
    >
      {OPTIONS.map((option) => (
        <FieldLabel key={option.value} htmlFor={`${id}-${option.value}`}>
          <Field orientation="horizontal">
            <FieldContent>
              <FieldTitle>{option.title}</FieldTitle>
              <FieldDescription>{option.body}</FieldDescription>
            </FieldContent>
            <RadioGroupItem value={option.value} id={`${id}-${option.value}`} />
          </Field>
        </FieldLabel>
      ))}
    </RadioGroup>
  );
}
