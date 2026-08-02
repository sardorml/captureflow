"use client";

import { useState, type FormEvent } from "react";
import { Lightbulb } from "lucide-react";
import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  Label,
  Radio,
  RadioGroup,
  Spinner,
  TextArea,
  TextField,
  Typography,
  buttonVariants,
} from "@heroui/react";
import { FEATURE_CATEGORIES, SUPPORT_EMAIL } from "@/lib/marketing/constants";

// FormSubmit sends a one-time confirmation email to SUPPORT_EMAIL on the first
// submission; once confirmed, later submissions deliver silently.
const FORMSUBMIT_URL = `https://formsubmit.co/ajax/${SUPPORT_EMAIL}`;

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
    <div className="flex min-h-screen items-center justify-center bg-canvas p-6 text-fg">
      <Card className="w-full max-w-160 p-6">
        {submitted ? (
          <div className="flex flex-col items-center text-center">
            <Lightbulb size={48} className="text-warning" />
            <h1 className="mt-4 text-xl font-semibold text-fg-strong">
              Idea received!
            </h1>
            <p className="mt-2 text-sm text-fg-muted">
              Thanks for sharing your idea. I read every suggestion.
            </p>
            <a
              href="/"
              className={buttonVariants({
                variant: "primary",
                className: "mt-6",
              })}
            >
              Back to home
            </a>
          </div>
        ) : (
          <>
            <Typography.Heading level={2} className="mt-0">
              Suggest a feature
            </Typography.Heading>
            <Typography.Paragraph color="muted">
              Got an idea that would make CaptureFlow better? I&rsquo;m all
              ears.
            </Typography.Paragraph>
            <Form
              onSubmit={onSubmit}
              validationBehavior="native"
              className="flex flex-col gap-4"
            >
              <TextField name="name" isRequired fullWidth>
                <Label>Name</Label>
                <Input placeholder="Your name" />
              </TextField>

              <TextField name="email" type="email" isRequired fullWidth>
                <Label>Email</Label>
                <Input type="email" placeholder="you@example.com" />
              </TextField>

              <RadioGroup name="category" orientation="horizontal">
                <Label>Category</Label>
                {/* Radio.Content is the clickable control; plain children skip
                    it and the row renders as bare text with no selected state.
                    Categories read better as pills than as a row of dots. */}
                <div className="mt-2 flex flex-wrap gap-2">
                  {FEATURE_CATEGORIES.map((c) => (
                    <Radio key={c} value={c}>
                      {({ isSelected }) => (
                        <Radio.Content
                          className={[
                            "cursor-pointer rounded-full border px-3 py-1.5 text-sm transition-colors motion-reduce:transition-none",
                            isSelected
                              ? "border-accent bg-tint text-fg"
                              : "border-line-strong text-fg-muted hover:bg-tint hover:text-fg",
                          ].join(" ")}
                        >
                          {c}
                        </Radio.Content>
                      )}
                    </Radio>
                  ))}
                </div>
              </RadioGroup>

              <TextField name="title" isRequired fullWidth>
                <Label>Feature title</Label>
                <Input placeholder="A short title for your idea" />
              </TextField>

              <TextField name="description" isRequired fullWidth>
                <Label>Description</Label>
                <TextArea
                  rows={6}
                  placeholder="Describe the feature and why it would be useful..."
                />
              </TextField>

              <Button
                variant="primary"
                type="submit"
                fullWidth
                isDisabled={loading}
              >
                {loading && <Spinner size="sm" color="current" />}
                Submit Idea
              </Button>

              {error && (
                <Alert status="danger">
                  <Alert.Content>
                    <Alert.Description>
                      Your idea couldn&rsquo;t be sent. Please try again, or
                      email me directly at{" "}
                      <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
                    </Alert.Description>
                  </Alert.Content>
                </Alert>
              )}

              <Typography type="body-xs" color="muted" align="center">
                Delivered via FormSubmit.
              </Typography>
            </Form>
          </>
        )}
      </Card>
    </div>
  );
}
