import type { Metadata } from "next";
import { SuggestFeatureClient } from "./suggest-feature-client";

export const metadata: Metadata = {
  title: "Suggest a feature",
  description:
    "Recording your ideas to improve CaptureFlow. Submit feature requests and help shape the open-source macOS screen recorder’s roadmap.",
  alternates: { canonical: "/suggest-feature" },
};

export default function SuggestFeaturePage() {
  return <SuggestFeatureClient />;
}
