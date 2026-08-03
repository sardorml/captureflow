"use client";

import { useFormStatus } from "react-dom";
import { type ReactNode } from "react";
import { CheckCircle2 } from "lucide-react";
import { Card, Chip, Spinner, Typography } from "@heroui/react";

type Props = {
  active: boolean;
  icon: ReactNode;
  title: string;
  body: string;
};

export function PolicyCardButton({ active, icon, title, body }: Props) {
  const { pending } = useFormStatus();
  const showActive = active && !pending;

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={`block w-full text-left ${pending ? "cursor-progress" : "cursor-pointer"}`}
    >
      <Card
        className={
          showActive
            ? "border-accent-ring bg-accent-soft p-4"
            : "p-4 hover:bg-tint"
        }
      >
        <div className="flex items-start gap-3">
          <span className="mt-0.5 leading-none">{icon}</span>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex items-center gap-2">
              <Typography weight="semibold">{title}</Typography>
              {pending && (
                <Chip size="sm" color="accent">
                  Updating…
                </Chip>
              )}
            </div>
            <Typography type="body-xs" color="muted">
              {body}
            </Typography>
          </div>
          {pending ? (
            <Spinner size="sm" />
          ) : showActive ? (
            <CheckCircle2 size={20} className="text-accent" />
          ) : null}
        </div>
      </Card>
    </button>
  );
}
