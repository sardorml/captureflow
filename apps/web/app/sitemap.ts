import type { MetadataRoute } from "next";
import { POSTS } from "@/lib/blog/posts";
import { SITE_URL } from "@/lib/marketing/constants";

/*
 * Marketing pages only. The dashboard is auth-gated, and /r/ and /s/ are user
 * content that each already sets robots noindex per artifact.
 */
const ROUTES = [
  "",
  "/features",
  "/pricing",
  "/alternatives/loom",
  "/faq",
  "/download",
  "/privacy",
  "/terms",
  "/refund",
  "/security",
  "/suggest-feature",
  "/self-host-setup",
  "/blog",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    ...ROUTES.map((route) => ({ url: `${SITE_URL}${route}`, lastModified })),
    ...POSTS.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: new Date(`${post.date}T00:00:00Z`),
    })),
  ];
}
