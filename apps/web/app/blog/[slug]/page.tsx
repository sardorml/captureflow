import type { Metadata } from "next";
import { notFound } from "next/navigation";
import NextLink from "next/link";
import { ArrowLeft } from "lucide-react";
import { MarketingPage } from "@/components/marketing/marketing-page";
import { JsonLd } from "@/components/marketing/json-ld";
import { PostBody } from "@/components/marketing/blog/prose";
import { TableOfContents } from "@/components/marketing/blog/toc";
import { formatPostDate } from "@/lib/blog/format";
import { getPost } from "@/lib/blog/posts";
import { SITE_URL } from "@/lib/marketing/constants";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return {};
  const url = `/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: post.title,
      description: post.description,
      publishedTime: post.date,
      siteName: "CaptureFlow",
      images: ["/og-image.png"],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: ["/og-image.png"],
    },
  };
}

export default async function BlogPostPage({ params }: Params) {
  const post = getPost((await params).slug);
  if (!post) notFound();
  const url = `${SITE_URL}/blog/${post.slug}`;

  return (
    <MarketingPage>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.description,
            datePublished: post.date,
            dateModified: post.date,
            mainEntityOfPage: url,
            url,
            image: `${SITE_URL}/og-image.png`,
            author: {
              "@type": "Organization",
              name: "CaptureFlow",
              url: SITE_URL,
            },
            publisher: {
              "@type": "Organization",
              name: "CaptureFlow",
              logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
            },
          },
          ...(post.faq.length > 0
            ? [
                {
                  "@context": "https://schema.org",
                  "@type": "FAQPage",
                  mainEntity: post.faq.map((item) => ({
                    "@type": "Question",
                    name: item.question,
                    acceptedAnswer: { "@type": "Answer", text: item.answer },
                  })),
                },
              ]
            : []),
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: SITE_URL,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Blog",
                item: `${SITE_URL}/blog`,
              },
              { "@type": "ListItem", position: 3, name: post.title, item: url },
            ],
          },
        ]}
      />
      <article className="mx-auto w-full max-w-5xl px-6 pt-[clamp(56px,9vw,120px)]">
        <header className="max-w-215">
          <NextLink
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-fg-muted hover:text-fg"
          >
            <ArrowLeft size={16} />
            Blog
          </NextLink>
          <h1 className="mt-8 text-[clamp(2.25rem,1.4rem+3vw,3.75rem)] leading-[1.06] font-bold tracking-[-0.03em] text-balance text-fg">
            {post.title}
          </h1>
          <p className="mt-6 max-w-180 text-xl leading-relaxed text-pretty text-fg-muted">
            {post.description}
          </p>
          <p className="mt-6 text-sm text-fg-muted">
            <time dateTime={post.date}>{formatPostDate(post.date)}</time> ·{" "}
            {post.readMinutes} min read
          </p>
        </header>

        <div className="mt-16 border-t border-fg/10 pt-6 lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-20">
          <nav aria-label="On this page" className="hidden lg:block">
            <div className="sticky top-28 pt-8">
              <p className="text-xs font-semibold tracking-wider text-fg-muted uppercase">
                On this page
              </p>
              <TableOfContents items={post.toc} />
            </div>
          </nav>

          <div className="max-w-180 min-w-0">
            <details className="mt-4 rounded-2xl bg-panel px-5 py-4 lg:hidden">
              <summary className="cursor-pointer text-sm font-semibold text-fg">
                On this page
              </summary>
              <ol className="mt-3 flex flex-col gap-2 text-[15px]">
                {post.toc.map((item) => (
                  <li key={item.id}>
                    <a href={`#${item.id}`} className="text-fg-muted">
                      {item.title}
                    </a>
                  </li>
                ))}
              </ol>
            </details>
            <PostBody markdown={post.markdown} />
          </div>
        </div>
      </article>
    </MarketingPage>
  );
}
