"use client";

import NextLink from "next/link";
import { ArrowRight, Rss } from "lucide-react";
import type { BlogPost } from "@/lib/blog/parse";
import { useLocalizedHref, useMessages } from "../i18n-provider";

export function BlogIndex({
  posts,
}: {
  posts: (Omit<BlogPost, "markdown" | "toc"> & { dateLabel: string })[];
}) {
  const copy = useMessages().blog;
  const lh = useLocalizedHref();

  return (
    <section className="mx-auto w-full max-w-5xl px-6 pt-[clamp(56px,9vw,120px)]">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[clamp(2.75rem,1.6rem+4vw,4.5rem)] leading-none font-bold tracking-[-0.03em] text-fg">
            {copy.title}
          </h1>
          <p className="mt-5 max-w-120 text-xl leading-relaxed text-fg-muted">
            {copy.subtitle}
          </p>
        </div>
        <a
          href="/blog/rss.xml"
          className="inline-flex items-center gap-2 self-start rounded-full bg-panel px-4 py-2 text-sm font-medium text-fg-muted transition-colors hover:bg-panel-2 hover:text-fg sm:self-auto"
        >
          <Rss size={15} />
          RSS
        </a>
      </header>

      {posts.length === 0 ? (
        <p className="mt-16 border-t border-fg/10 pt-10 text-fg-muted">
          {copy.empty}
        </p>
      ) : (
        <ul className="mt-16 border-b border-fg/10">
          {posts.map((post) => (
            <li key={post.slug} className="border-t border-fg/10">
              <NextLink
                href={lh(`/blog/${post.slug}`)}
                className="group grid gap-4 py-10 sm:py-12 md:grid-cols-[200px_minmax(0,1fr)] md:gap-12"
              >
                <p className="text-sm text-fg-muted md:pt-2">
                  <time dateTime={post.date}>{post.dateLabel}</time>
                  <span className="mx-2 md:hidden">·</span>
                  <span className="md:mt-1 md:block">
                    {post.readMinutes} min read
                  </span>
                </p>
                <div className="max-w-180">
                  <h2 className="text-[clamp(1.5rem,1.1rem+1.4vw,2.25rem)] leading-[1.15] font-semibold tracking-[-0.02em] text-balance text-fg transition-colors group-hover:text-accent-strong">
                    {post.title}
                  </h2>
                  <p className="mt-4 text-lg leading-relaxed text-pretty text-fg/70">
                    {post.description}
                  </p>
                  <span className="mt-6 inline-flex items-center gap-1.5 text-[15px] font-medium text-fg">
                    {copy.readArticle}
                    <ArrowRight
                      size={16}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </span>
                </div>
              </NextLink>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
