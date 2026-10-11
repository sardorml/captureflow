"use client";

import { useState, type FormEvent } from "react";
import { Lightbulb } from "lucide-react";
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
import {
  FEATURE_CATEGORIES,
  FORMSUBMIT_URL,
  SUPPORT_EMAIL,
} from "@/lib/marketing/constants";
import { cn } from "@/lib/utils";
import {
  MarketingSection,
  SectionHeading,
} from "@/components/marketing/_shared";
import {
  LANDING_FORM_FIELDS,
  PillChoice,
} from "@/components/marketing/form-parts";

export function SuggestFeatureClient() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(FORMSUBMIT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(data.get("name") ?? ""),
          email: String(data.get("email") ?? ""),
          category: String(data.get("category") ?? ""),
          title: String(data.get("title") ?? ""),
          description: String(data.get("description") ?? ""),
          _subject: "New feature suggestion (CaptureFlow)",
          _template: "table",
        }),
      });
      if (!res.ok) {
        setError(true);
        return;
      }
      setSubmitted(true);
    } catch {
      setError(true);
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
            <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-warning/15 text-warning">
              <Lightbulb size={28} />
            </span>
            <p className="mt-4 text-xl font-semibold text-fg">Idea received!</p>
            <p className="mt-2 text-sm text-fg-muted">
              Thanks for sharing it. I read every suggestion.
            </p>
            <NextLink
              href="/"
              className={buttonVariants({
                variant: "tertiary",
                className: "mt-6",
              })}
            >
              Back to home
            </NextLink>
          </div>
        ) : (
          <Form
            onSubmit={onSubmit}
            validationBehavior="native"
            className={cn("flex flex-col gap-4", LANDING_FORM_FIELDS)}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField name="name" isRequired fullWidth>
                <Label>Name</Label>
                <Input placeholder="Your name" autoComplete="name" />
              </TextField>
              <TextField name="email" type="email" isRequired fullWidth>
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </TextField>
            </div>

            <PillChoice
              name="category"
              label="Category"
              options={FEATURE_CATEGORIES}
            />

            <TextField name="title" isRequired fullWidth>
              <Label>Feature title</Label>
              <Input placeholder="A short title for your idea" />
            </TextField>

            <TextField name="description" isRequired fullWidth>
              <Label>Description</Label>
              <TextArea
                rows={5}
                placeholder="Describe the feature and why it would be useful..."
              />
            </TextField>

            <Button
              variant="primary"
              type="submit"
              size="lg"
              fullWidth
              isDisabled={loading}
            >
              {loading && <Spinner size="sm" color="current" />}
              Submit idea
            </Button>

            {error && (
              <Alert status="danger">
                <Alert.Content>
                  <Alert.Description>
                    Your idea couldn&rsquo;t be sent. Please try again, or email
                    me directly at{" "}
                    <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
                  </Alert.Description>
                </Alert.Content>
              </Alert>
            )}
          </Form>
        )}
      </div>
    </MarketingSection>
  );
}
