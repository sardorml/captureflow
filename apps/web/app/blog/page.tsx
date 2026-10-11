import type { Metadata } from "next";
import { MarketingPage } from "@/components/marketing/marketing-page";
import { BlogIndex } from "@/components/marketing/blog/blog-index";
import { formatPostDate } from "@/lib/blog/format";
import { POSTS } from "@/lib/blog/posts";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Screen recording guides and updates",
  description:
    "Guides and updates from CaptureFlow: self-hosting a private screen recorder, recording better async videos, and what's new.",
  alternates: {
    canonical: "/blog",
    types: { "application/rss+xml": "/blog/rss.xml" },
  },
};

export default function BlogPage() {
  const posts = POSTS.map(({ markdown: _, toc: __, ...meta }) => ({
    ...meta,
    dateLabel: formatPostDate(meta.date),
  }));
  return (
    <MarketingPage>
      <BlogIndex posts={posts} />
    </MarketingPage>
  );
}
