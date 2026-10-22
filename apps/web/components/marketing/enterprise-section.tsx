"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import {
  CalendarCheck,
  CheckCircle2,
  Cloud,
  HardDrive,
  MessageCircle,
  MessagesSquare,
  PenLine,
  Sparkles,
  Users,
  Wand2,
} from "lucide-react";
import NextLink from "next/link";
import {
  Alert,
  Button,
  Form,
  Input,
  Label,
  Spinner,
  TextArea,
  TextField,
  buttonVariants,
} from "@heroui/react";
import { submitEnterpriseRequestAction } from "@/app/enterprise/actions";
import { SUPPORT_EMAIL } from "@/lib/marketing/constants";
import { track } from "@/lib/marketing/track";
import { cn } from "@/lib/utils";
import { MarketingSection, SectionHeading } from "./_shared";
import { LANDING_FORM_FIELDS, PillChoice } from "./form-parts";
import { useLocalizedHref, useMessages } from "./i18n-provider";
import { AppleLogo, ChromeLogoColor } from "./platform-logos";

type IncludedKey =
  | "storage"
  | "seats"
  | "roadmap"
  | "managed"
  | "billing"
  | "support";

const INCLUDED: { key: IncludedKey; icon: ReactNode; tone: string }[] = [
  {
    key: "storage",
    tone: "bg-sky-500/15 text-sky-500",
    icon: <HardDrive size={20} />,
  },
  {
    key: "seats",
    tone: "bg-violet-500/15 text-violet-500",
    icon: <Users size={20} />,
  },
  {
    key: "roadmap",
    tone: "bg-amber-500/15 text-amber-500",
    icon: <Sparkles size={20} />,
  },
  {
    key: "managed",
    tone: "bg-cyan-500/15 text-cyan-500",
    icon: <Cloud size={20} />,
  },
  {
    key: "billing",
    tone: "bg-emerald-500/15 text-emerald-500",
    icon: <CalendarCheck size={20} />,
  },
  {
    key: "support",
    tone: "bg-rose-500/15 text-rose-500",
    icon: <MessageCircle size={20} />,
  },
];

type EverythingKey =
  | "extension"
  | "mac"
  | "workspaces"
  | "feedback"
  | "edit"
  | "screenshots";

const EVERYTHING: {
  key: EverythingKey;
  icon: ReactNode;
  tone: string;
  soon?: boolean;
}[] = [
  {
    key: "extension",
    tone: "bg-panel-2",
    icon: <ChromeLogoColor className="size-5" />,
  },
  {
    key: "mac",
    tone: "bg-panel-2",
    icon: <AppleLogo className="size-[18px] text-fg" />,
    soon: true,
  },
  {
    key: "workspaces",
    tone: "bg-indigo-500/15 text-indigo-500",
    icon: <Users size={20} />,
  },
  {
    key: "feedback",
    tone: "bg-orange-500/15 text-orange-500",
    icon: <MessagesSquare size={20} />,
  },
  {
    key: "edit",
    tone: "bg-fuchsia-500/15 text-fuchsia-500",
    icon: <Wand2 size={20} />,
  },
  {
    key: "screenshots",
    tone: "bg-teal-500/15 text-teal-500",
    icon: <PenLine size={20} />,
  },
];

export function EnterpriseSection() {
  const copy = useMessages().enterprise;

  return (
    <MarketingSection id="enterprise">
      <SectionHeading
        level={1}
        title={
          <>
            {copy.title}{" "}
            <span className="inline-block -rotate-1 rounded-2xl bg-fg px-3 pb-1 text-canvas">
              {copy.titleHighlight}
            </span>
          </>
        }
        subtitle={copy.subtitle}
      />

      <p className="mb-4 text-center text-sm font-medium text-fg-muted">
        {copy.includedHeading}
      </p>
      <ul className="mx-auto grid max-w-215 gap-3 sm:grid-cols-2 md:grid-cols-3">
        {INCLUDED.map(({ key, icon, tone }) => (
          <li key={key} className="rounded-2xl border border-line bg-panel p-5">
            <span
              className={cn(
                "inline-flex size-10 items-center justify-center rounded-xl",
                tone,
              )}
            >
              {icon}
            </span>
            <p className="mt-4 font-semibold text-fg">
              {copy.included[key].title}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-balance text-fg/75">
              {copy.included[key].body}
            </p>
          </li>
        ))}
      </ul>

      <p className="mt-12 mb-4 text-center text-sm font-medium text-fg-muted">
        {copy.everythingHeading}
      </p>
      <ul className="mx-auto grid max-w-215 gap-3 sm:grid-cols-2 md:grid-cols-3">
        {EVERYTHING.map(({ key, icon, tone, soon }) => (
          <li key={key} className="rounded-2xl border border-line bg-panel p-5">
            <div className="flex items-center justify-between gap-2">
              <span
                className={cn(
                  "inline-flex size-10 items-center justify-center rounded-xl",
                  tone,
                )}
              >
                {icon}
              </span>
              {soon ? (
                <span className="rounded-full bg-panel-2 px-2.5 py-1 text-xs font-medium text-fg-muted">
                  {copy.comingSoon}
                </span>
              ) : null}
            </div>
            <p className="mt-4 font-semibold text-fg">
              {copy.everything[key].title}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-balance text-fg/75">
              {copy.everything[key].body}
            </p>
          </li>
        ))}
      </ul>

      <div
        id="contact"
        className="mx-auto mt-16 max-w-160 rounded-3xl border border-line bg-panel p-6 sm:p-8"
      >
        <p className="text-2xl font-semibold tracking-[-0.02em] text-fg">
          {copy.formHeading}
        </p>
        <p className="mt-1 mb-6 text-sm text-fg-muted">{copy.formSubheading}</p>
        <EnterpriseForm />
      </div>
    </MarketingSection>
  );
}

function EnterpriseForm() {
  const copy = useMessages().enterprise.form;
  const lh = useLocalizedHref();
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
        <CheckCircle2 size={44} className="text-success" />
        <p className="mt-4 text-xl font-semibold text-fg">{copy.sentTitle}</p>
        <p className="mt-2 max-w-80 text-sm text-fg-muted">
          {copy.sentBody.replace("{email}", sentTo)}
        </p>
        <NextLink
          href={lh("/")}
          className={buttonVariants({ variant: "tertiary", className: "mt-6" })}
        >
          {copy.back}
        </NextLink>
      </div>
    );
  }

  const [errorBefore, errorAfter] = copy.error.split("{email}");

  return (
    <Form
      onSubmit={onSubmit}
      validationBehavior="native"
      className={cn("flex flex-col gap-4", LANDING_FORM_FIELDS)}
    >
      <TextField name="company" isRequired fullWidth>
        <Label>{copy.company}</Label>
        <Input
          placeholder={copy.companyPlaceholder}
          autoComplete="organization"
        />
      </TextField>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField name="name" isRequired fullWidth>
          <Label>{copy.name}</Label>
          <Input placeholder={copy.namePlaceholder} autoComplete="name" />
        </TextField>
        <TextField name="email" type="email" isRequired fullWidth>
          <Label>{copy.email}</Label>
          <Input
            type="email"
            placeholder={copy.emailPlaceholder}
            autoComplete="email"
          />
        </TextField>
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

      <TextField name="notes" fullWidth>
        <Label>{copy.notes}</Label>
        <TextArea placeholder={copy.notesPlaceholder} rows={3} />
      </TextField>

      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="hidden"
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        isDisabled={loading}
      >
        {loading && <Spinner size="sm" color="current" />}
        {copy.submit}
      </Button>

      {error && (
        <Alert status="danger">
          <Alert.Content>
            <Alert.Description>
              {errorBefore}
              <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
              {errorAfter}
            </Alert.Description>
          </Alert.Content>
        </Alert>
      )}
    </Form>
  );
}
