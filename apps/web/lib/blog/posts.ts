import loomPricingAlternative from "@/content/blog/loom-pricing-alternative.md";
import selfHostCaptureflow from "@/content/blog/self-host-captureflow.md";
import selfHostedLoomAlternative from "@/content/blog/self-hosted-loom-alternative.md";
import { parsePost, type BlogPost } from "./parse";

export const POSTS: BlogPost[] = [
  parsePost("loom-pricing-alternative", loomPricingAlternative),
  parsePost("self-hosted-loom-alternative", selfHostedLoomAlternative),
  parsePost("self-host-captureflow", selfHostCaptureflow),
].sort((a, b) => b.date.localeCompare(a.date));

export function getPost(slug: string): BlogPost | undefined {
  return POSTS.find((post) => post.slug === slug);
}
