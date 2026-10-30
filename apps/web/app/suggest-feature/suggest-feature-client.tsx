"use client";

import { useState, type FormEvent } from "react";
import { Lightbulb } from "lucide-react";
import NextLink from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { FEATURE_CATEGORIES, SUPPORT_EMAIL } from "@/lib/marketing/constants";
import { cn } from "@/lib/utils";
import {
  MarketingSection,
  SectionHeading,
} from "@/components/marketing/_shared";
import {
  LANDING_FORM_FIELDS,
  PillChoice,
} from "@/components/marketing/form-parts";
import { submitSuggestionAction } from "./actions";

export function SuggestFeatureClient() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setLoading(true);
    setError(null);
    try {
      const result = await submitSuggestionAction(
        { error: null, sent: false },
        data,
      );
      if (result.sent) setSubmitted(true);
      else setError(result.error);
    } catch {
      setError("Your idea couldn\u2019t be sent. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MarketingSection style={{ paddingBottom: 0 }}>
      <SectionHeading
        level={1}
        title={
          <>
            Suggest a{" "}
            <span className="inline-block -rotate-1 rounded-2xl bg-fg px-3 pb-1 text-canvas">
              feature
            </span>
          </>
        }
        subtitle="Got an idea that would make CaptureFlow better? I read every suggestion, and the good ones get built in the open."
      />

      <div className="mx-auto max-w-160 rounded-3xl bg-panel p-6 sm:p-8">
        {submitted ? (
          <div className="flex flex-col items-center py-8 text-center">
            <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-500">
              <Lightbulb size={28} />
            </span>
            <p className="mt-4 text-xl font-semibold text-fg">Idea received!</p>
            <p className="mt-2 text-sm text-fg-muted">
              Thanks for sharing it. I read every suggestion.
            </p>
            <NextLink
              href="/"
              className={buttonVariants({
                variant: "ghost",
                className: "mt-6",
              })}
            >
              Back to home
            </NextLink>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            className={cn("flex flex-col gap-4", LANDING_FORM_FIELDS)}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="suggest-name">Name</FieldLabel>
                <Input
                  id="suggest-name"
                  name="name"
                  required
                  placeholder="Your name"
                  autoComplete="name"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="suggest-email">Email</FieldLabel>
                <Input
                  id="suggest-email"
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </Field>
            </div>

            <PillChoice
              name="category"
              label="Category"
              options={FEATURE_CATEGORIES}
            />

            <Field>
              <FieldLabel htmlFor="suggest-title">Feature title</FieldLabel>
              <Input
                id="suggest-title"
                name="title"
                required
                placeholder="A short title for your idea"
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

            <Field>
              <FieldLabel htmlFor="suggest-description">Description</FieldLabel>
              <Textarea
                id="suggest-description"
                name="description"
                required
                rows={5}
                placeholder="Describe the feature and why it would be useful..."
              />
            </Field>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading && <Spinner />}
              Submit idea
            </Button>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>
                  {error} You can also email me directly at{" "}
                  <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
                </AlertDescription>
              </Alert>
            )}
          </form>
        )}
      </div>
    </MarketingSection>
  );
}
