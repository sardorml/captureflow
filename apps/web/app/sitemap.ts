import type { MetadataRoute } from "next";
import { POSTS } from "@/lib/blog/posts";
import { LOCALES, languageAlternates, localizedHref } from "@/lib/i18n/config";
import { PAGE_PATHS } from "@/lib/i18n/metadata";
import { SITE_URL } from "@/lib/marketing/constants";

/*
 * Marketing pages only. The dashboard is auth-gated, and /r/ and /s/ are user
 * content that each already sets robots noindex per artifact.
 */
const ENGLISH_ONLY_ROUTES = [
  "/alternatives/loom",
  "/privacy",
  "/terms",
  "/refund",
  "/security",
  "/suggest-feature",
  "/blog",
] as const;

const absolute = (path: string) => `${SITE_URL}${path === "/" ? "" : path}`;

// One entry per language of a translated page, each naming all the others.
function translatedEntries(
  path: string,
  lastModified: Date,
): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(
    Object.entries(languageAlternates(path)).map(([lang, href]) => [
      lang,
      absolute(href),
    ]),
  );
  return [path, ...LOCALES.map((l) => localizedHref(path, l.code))].map(
    (href) => ({
      url: absolute(href),
      lastModified,
      alternates: { languages },
    }),
  );
}

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    ...Object.values(PAGE_PATHS).flatMap((path) =>
      translatedEntries(path, lastModified),
    ),
    ...ENGLISH_ONLY_ROUTES.map((route) => ({
      url: `${SITE_URL}${route}`,
      lastModified,
    })),
    ...POSTS.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: new Date(`${post.date}T00:00:00Z`),
    })),
  ];
}
