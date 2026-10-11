import { isValidElement, type ReactNode } from "react";
import NextLink from "next/link";
import Markdown, { type Components } from "react-markdown";
import { slugify } from "@/lib/blog/parse";

function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) {
    return textOf(node.props.children);
  }
  return "";
}

const LINK_CLASS =
  "font-medium text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent";

const COMPONENTS: Components = {
  h2: ({ children }) => (
    <h2
      id={slugify(textOf(children))}
      className="mt-20 mb-5 scroll-mt-28 text-[28px] leading-tight font-semibold tracking-[-0.02em] text-fg sm:text-[32px]"
    >
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-12 mb-4 text-xl font-semibold text-fg">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="my-6 text-[18px] leading-[1.8] text-fg/85">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="my-6 flex list-disc flex-col gap-3 pl-6 text-[18px] leading-[1.75] text-fg/85 marker:text-fg-muted">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="my-6 flex list-decimal flex-col gap-3 pl-6 text-[18px] leading-[1.75] text-fg/85 marker:text-fg-muted">
      {children}
    </ol>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-fg">{children}</strong>
  ),
  code: ({ children }) => (
    <code className="rounded-md bg-panel-2 px-1.5 py-0.5 font-mono text-[0.85em] text-fg">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="my-8 overflow-x-auto rounded-2xl bg-panel p-6 font-mono text-[14px] leading-relaxed text-fg [&>code]:bg-transparent [&>code]:p-0 [&>code]:text-[1em]">
      {children}
    </pre>
  ),
  blockquote: ({ children }) => (
    <aside className="my-8 rounded-2xl border-l-4 border-accent bg-accent/10 px-6 py-1 [&_p]:my-4 [&_p]:text-[17px]">
      {children}
    </aside>
  ),
  a: ({ href = "", children }) =>
    href.startsWith("/") ? (
      <NextLink href={href} className={LINK_CLASS}>
        {children}
      </NextLink>
    ) : (
      <a href={href} target="_blank" rel="noopener" className={LINK_CLASS}>
        {children}
      </a>
    ),
};

export function PostBody({ markdown }: { markdown: string }) {
  return <Markdown components={COMPONENTS}>{markdown}</Markdown>;
}
