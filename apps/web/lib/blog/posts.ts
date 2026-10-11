import loomPricing from "@/content/blog/loom-pricing.md";
import selfHostedLoomAlternative from "@/content/blog/self-hosted-loom-alternative.md";
import selfHostedScreenRecorder from "@/content/blog/self-hosted-screen-recorder.md";
import { parsePost, type BlogPost } from "./parse";

export const BLOG_AUTHOR = {
  name: "sardorml",
  url: "https://github.com/sardorml",
};

export function postImagePath(slug: string): string {
  return `/blog/${slug}.png`;
}

export const POSTS: BlogPost[] = [
  parsePost("loom-pricing", loomPricing),
  parsePost("self-hosted-loom-alternative", selfHostedLoomAlternative),
  parsePost("self-hosted-screen-recorder", selfHostedScreenRecorder),
].sort((a, b) => b.date.localeCompare(a.date));

export function getPost(slug: string): BlogPost | undefined {
  return POSTS.find((post) => post.slug === slug);
}
