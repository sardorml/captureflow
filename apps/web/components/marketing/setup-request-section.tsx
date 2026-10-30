"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import {
  CheckCircle2,
  Database,
  Handshake,
  ShieldCheck,
  Users,
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
import { SUPPORT_EMAIL } from "@/lib/marketing/constants";
import { track } from "@/lib/marketing/track";
import { submitSetupRequestAction } from "@/app/self-host-setup/actions";
import { cn } from "@/lib/utils";
import { MarketingSection, SectionHeading } from "./_shared";
import { LANDING_FORM_FIELDS, PillChoice } from "./form-parts";
import { useLocalizedHref, useMessages } from "./i18n-provider";
import { AppleLogo, ChromeLogoColor, CloudflareLogo } from "./platform-logos";

type IncludedKey =
  | "infra"
  | "storage"
  | "signin"
  | "apps"
  | "ready"
  | "handover";

const INCLUDED: { key: IncludedKey; icon: ReactNode }[] = [
  { key: "infra", icon: <CloudflareLogo className="size-6" /> },
  { key: "storage", icon: <Database size={20} className="text-accent" /> },
  { key: "signin", icon: <ShieldCheck size={20} className="text-accent" /> },
  {
    key: "apps",
    icon: (
      <span className="flex items-center gap-1">
        <ChromeLogoColor className="size-5" />
        <AppleLogo className="size-[18px] text-fg" />
      </span>
    ),
  },
  { key: "ready", icon: <Users size={20} className="text-accent" /> },
  { key: "handover", icon: <Handshake size={20} className="text-accent" /> },
];

export function SetupRequestSection() {
  const copy = useMessages().setupService;

  return (
    <MarketingSection id="self-host-setup">
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
        {INCLUDED.map(({ key, icon }) => (
          <li key={key} className="rounded-xl border border-line bg-panel p-5">
            <span className="inline-flex h-10 min-w-10 items-center justify-center rounded-xl bg-panel-2 px-2.5">
              {icon}
            </span>
            <p className="mt-4 font-semibold text-fg">
              {copy.included[key].title}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-fg/75">
              {copy.included[key].body}
            </p>
          </li>
        ))}
      </ul>

      <div
        id="request"
        className="mx-auto mt-16 max-w-160 rounded-xl border border-line bg-panel p-6 sm:p-8"
      >
        <p className="text-2xl font-semibold tracking-[-0.02em] text-fg">
          {copy.nextHeading}
        </p>
        <p className="mt-1 mb-6 text-sm text-fg-muted">{copy.nextSubheading}</p>
        <RequestForm />
      </div>
    </MarketingSection>
  );
}

function RequestForm() {
  const copy = useMessages().setupService.form;
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
      const result = await submitSetupRequestAction(
        { error: null, sent: false },
        data,
      );
      if (!result.sent) {
        setError(true);
        return;
      }
      track("self_host_setup_requested");
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

      <PillChoice name="topic" label={copy.topic} options={copy.topics} />
      <PillChoice
        name="team_size"
        label={copy.teamSize}
        options={copy.teamSizes}
      />
      <PillChoice
        name="cloudflare"
        label={copy.cloudflare}
        options={copy.cloudflareOptions}
      />

      <TextField name="notes" fullWidth>
        <Label>{copy.notes}</Label>
        <TextArea placeholder={copy.notesPlaceholder} rows={3} />
      </TextField>

      <input
        type="text"
        name="_honey"
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
