import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/marketing/constants";

/*
 * Marketing pages only. The dashboard is auth-gated, and /r/ and /s/ are user
 * content that each already sets robots noindex per artifact.
 */
const ROUTES = [
  "",
  "/features",
  "/pricing",
  "/faq",
  "/roadmap",
  "/download",
  "/privacy",
  "/suggest-feature",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return ROUTES.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified,
  }));
}
