import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/marketing/constants";

/*
 * /r/ and /s/ are deliberately absent from disallow: each share page sets
 * robots noindex in its own metadata, and a Disallow here would stop crawlers
 * fetching the page at all, so they would never read that noindex.
 */
const PRIVATE_PATHS = [
  "/api/",
  "/auth/",
  "/invite/",
  "/billing",
  "/devices",
  "/members",
  "/notifications",
  "/profile",
  "/recordings",
  "/screenshots",
  "/settings",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: PRIVATE_PATHS }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
