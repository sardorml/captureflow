import selfHostCaptureflow from "@/content/blog/self-host-captureflow.md";
import { parsePost, type BlogPost } from "./parse";

export const POSTS: BlogPost[] = [
  parsePost("self-host-captureflow", selfHostCaptureflow),
].sort((a, b) => b.date.localeCompare(a.date));

export function getPost(slug: string): BlogPost | undefined {
  return POSTS.find((post) => post.slug === slug);
}
