"use client";

import { useState } from "react";
import { Lightbulb } from "lucide-react";
import {
  Alert,
  Button,
  Card,
  Flex,
  Form,
  Input,
  Radio,
  Result,
  Typography,
  theme,
} from "antd";
import { FEATURE_CATEGORIES, SUPPORT_EMAIL } from "@/lib/marketing/constants";

// FormSubmit sends a one-time confirmation email to SUPPORT_EMAIL on the first
// submission; once confirmed, later submissions deliver silently.
const FORMSUBMIT_URL = `https://formsubmit.co/ajax/${SUPPORT_EMAIL}`;

type FormValues = {
  name: string;
  email: string;
  category?: string;
  title: string;
  description: string;
};

export function SuggestFeatureClient() {
  const { token } = theme.useToken();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const onFinish = async (values: FormValues) => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(FORMSUBMIT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          category: values.category ?? "",
          title: values.title,
          description: values.description,
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
    <Flex
      align="center"
      justify="center"
      style={{
        minHeight: "100vh",
        padding: 24,
        background: token.colorBgLayout,
        color: token.colorText,
      }}
    >
      <Card style={{ width: "100%", maxWidth: 640 }}>
        {submitted ? (
          <Result
            icon={<Lightbulb size={48} color={token.colorWarning} />}
            title="Idea received!"
            subTitle="Thanks for sharing your idea. I read every suggestion."
            extra={
              <Button type="primary" href="/">
                Back to home
              </Button>
            }
          />
        ) : (
          <>
            <Typography.Title level={2} style={{ marginTop: 0 }}>
              Suggest a feature
            </Typography.Title>
            <Typography.Paragraph type="secondary">
              Got an idea that would make CaptureFlow better? I&rsquo;m all
              ears.
            </Typography.Paragraph>
            <Form
              layout="vertical"
              requiredMark={false}
              onFinish={onFinish}
              disabled={loading}
            >
              <Form.Item
                label="Name"
                name="name"
                rules={[{ required: true, message: "Please enter your name" }]}
              >
                <Input placeholder="Your name" />
              </Form.Item>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Please enter your email" },
                  { type: "email", message: "Please enter a valid email" },
                ]}
              >
                <Input type="email" placeholder="you@example.com" />
              </Form.Item>
              <Form.Item label="Category" name="category">
                <Radio.Group
                  optionType="button"
                  options={FEATURE_CATEGORIES.map((c) => ({
                    label: c,
                    value: c,
                  }))}
                />
              </Form.Item>
              <Form.Item
                label="Feature title"
                name="title"
                rules={[{ required: true, message: "Please enter a title" }]}
              >
                <Input placeholder="A short title for your idea" />
              </Form.Item>
              <Form.Item
                label="Description"
                name="description"
                rules={[
                  { required: true, message: "Please describe your idea" },
                ]}
              >
                <Input.TextArea
                  rows={6}
                  placeholder="Describe the feature and why it would be useful..."
                />
              </Form.Item>
              <Button type="primary" htmlType="submit" block loading={loading}>
                Submit Idea
              </Button>
              {error && (
                <Alert
                  type="error"
                  showIcon
                  style={{ marginTop: 16 }}
                  message={
                    <span>
                      Your idea couldn&rsquo;t be sent. Please try again, or
                      email me directly at{" "}
                      <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
                    </span>
                  }
                />
              )}
              <Typography.Paragraph
                type="secondary"
                style={{
                  textAlign: "center",
                  fontSize: 12,
                  marginTop: 16,
                  marginBottom: 0,
                }}
              >
                Delivered via FormSubmit.
              </Typography.Paragraph>
            </Form>
          </>
        )}
      </Card>
    </Flex>
  );
}
