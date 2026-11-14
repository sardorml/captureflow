"use client";

import { useId, useState, type FormEvent } from "react";
import {
  AppWindow,
  Bot,
  CheckCircle2,
  Globe,
  Captions,
  MessagesSquare,
  PenLine,
  Users,
  Wand2,
} from "lucide-react";
import NextLink from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { submitEnterpriseRequestAction } from "@/app/enterprise/actions";
import { SUPPORT_EMAIL } from "@/lib/marketing/constants";
import { track } from "@/lib/marketing/track";
import { cn } from "@/lib/utils";
import { LANDING_FORM_FIELDS, PillChoice } from "./form-parts";
import { FrameHeader, FrameSection } from "./frame";
import { useLocalizedHref, useMessages } from "./i18n-provider";
import { IconTileGrid } from "./icon-tile";
import { PageHeroFrame } from "./page-hero";

export function EnterpriseSection() {
  const m = useMessages();
  const copy = m.enterprise;
  const { everything } = copy;

  return (
    <>
      <PageHeroFrame
        label={m.nav.enterprise}
        word="ENTERPRISE"
        title={`${copy.title} ${copy.titleHighlight}`}
        subtitle={copy.subtitle}
      />
      <FrameSection id="enterprise">
        <FrameHeader title={copy.everythingHeading} />
        <IconTileGrid
          items={[
            {
              key: "extension",
              ...everything.extension,
              Icon: Globe,
              color: "text-sky-500",
            },
            {
              key: "agents",
              ...everything.agents,
              Icon: Bot,
              color: "text-violet-500",
            },
            {
              key: "mac",
              ...everything.mac,
              badge: copy.comingSoon,
              Icon: AppWindow,
              color: "text-blue-500",
            },
            {
              key: "workspaces",
              ...everything.workspaces,
              Icon: Users,
              color: "text-indigo-500",
            },
            {
              key: "feedback",
              ...everything.feedback,
              Icon: MessagesSquare,
              color: "text-orange-500",
            },
            {
              key: "edit",
              ...everything.edit,
              Icon: Wand2,
              color: "text-fuchsia-500",
            },
            {
              key: "screenshots",
              ...everything.screenshots,
              Icon: PenLine,
              color: "text-teal-500",
            },
            {
              key: "transcripts",
              ...everything.transcripts,
              Icon: Captions,
              color: "text-amber-500",
            },
          ]}
        />
      </FrameSection>
      <FrameSection id="contact">
        <FrameHeader title={copy.formHeading} subtitle={copy.formSubheading} />
        <div className="px-6 pb-16 md:px-12">
          <div className="max-w-160 rounded-xl border border-line bg-panel p-6 sm:p-8">
            <EnterpriseForm />
          </div>
        </div>
      </FrameSection>
    </>
  );
}

function EnterpriseForm() {
  const copy = useMessages().enterprise.form;
  const lh = useLocalizedHref();
  const id = useId();
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setLoading(true);
    setError(false);
    try {
      const result = await submitEnterpriseRequestAction(
        { error: null, sent: false },
        data,
      );
      if (!result.sent) {
        setError(true);
        return;
      }
      track("enterprise_contact_requested");
      setSentTo(String(data.get("email") ?? "").trim());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (sentTo) {
    return (
      <div className="flex h-full flex-col items-center justify-center py-10 text-center">
        <CheckCircle2 size={44} className="text-emerald-500" />
        <p className="mt-4 text-xl font-semibold text-fg">{copy.sentTitle}</p>
        <p className="mt-2 max-w-80 text-sm text-fg-muted">
          {copy.sentBody.replace("{email}", sentTo)}
        </p>
        <NextLink
          href={lh("/")}
          className={cn(buttonVariants({ variant: "ghost" }), "mt-6")}
        >
          {copy.back}
        </NextLink>
      </div>
    );
  }

  const [errorBefore, errorAfter] = copy.error.split("{email}");

  return (
    <form
      onSubmit={onSubmit}
      className={cn("flex flex-col gap-4", LANDING_FORM_FIELDS)}
    >
      <Field>
        <FieldLabel htmlFor={`${id}-company`}>{copy.company}</FieldLabel>
        <Input
          id={`${id}-company`}
          name="company"
          required
          placeholder={copy.companyPlaceholder}
          autoComplete="organization"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor={`${id}-name`}>{copy.name}</FieldLabel>
          <Input
            id={`${id}-name`}
            name="name"
            required
            placeholder={copy.namePlaceholder}
            autoComplete="name"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor={`${id}-email`}>{copy.email}</FieldLabel>
          <Input
            id={`${id}-email`}
            name="email"
            type="email"
            required
            placeholder={copy.emailPlaceholder}
            autoComplete="email"
          />
        </Field>
      </div>

      <PillChoice name="need" label={copy.need} options={copy.needs} />
      <PillChoice
        name="team_size"
        label={copy.teamSize}
        options={copy.teamSizes}
      />
      <PillChoice
        name="storage"
        label={copy.storage}
        options={copy.storageOptions}
      />

      <Field>
        <FieldLabel htmlFor={`${id}-notes`}>{copy.notes}</FieldLabel>
        <Textarea
          id={`${id}-notes`}
          name="notes"
          placeholder={copy.notesPlaceholder}
          rows={3}
        />
      </Field>

      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="hidden"
      />

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading && <Spinner className="size-4" />}
        {copy.submit}
      </Button>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            {errorBefore}
            <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
            {errorAfter}
          </AlertDescription>
        </Alert>
      )}
    </form>
  );
}
