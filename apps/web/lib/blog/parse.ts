export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  date: string;
  readMinutes: number;
  toc: { id: string; title: string }[];
  faq: { question: string; answer: string }[];
  markdown: string;
};

const WORDS_PER_MINUTE = 220;

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function splitFrontmatter(source: string): {
  fields: Record<string, string>;
  markdown: string;
} {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(source);
  if (!match) return { fields: {}, markdown: source };
  const fields: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const colon = line.indexOf(":");
    if (colon > 0) {
      fields[line.slice(0, colon).trim()] = line.slice(colon + 1).trim();
    }
  }
  return { fields, markdown: source.slice(match[0].length) };
}

function withoutCodeBlocks(markdown: string): string {
  return markdown.replace(/```[\s\S]*?```/g, "");
}

function plainText(markdown: string): string {
  return markdown
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractFaq(
  markdown: string,
): { question: string; answer: string }[] {
  return [
    ...markdown.matchAll(/^### (.+\?)\s*\n([\s\S]*?)(?=^#{2,3} |(?![\s\S]))/gm),
  ].map(([, question, answer]) => ({
    question: question.trim(),
    answer: plainText(answer),
  }));
}

export function parsePost(slug: string, source: string): BlogPost {
  const { fields, markdown } = splitFrontmatter(source);
  const { title, description, date } = fields;
  if (!title || !description || !/^\d{4}-\d{2}-\d{2}$/.test(date ?? "")) {
    throw new Error(`Blog post "${slug}" needs title, description and date`);
  }
  const prose = withoutCodeBlocks(markdown);
  const words = prose.split(/\s+/).filter(Boolean).length;
  const toc = [...prose.matchAll(/^## (.+)$/gm)].map(([, heading]) => ({
    id: slugify(heading),
    title: heading.trim(),
  }));
  return {
    slug,
    title,
    description,
    date,
    readMinutes: Math.max(1, Math.round(words / WORDS_PER_MINUTE)),
    toc,
    faq: extractFaq(prose),
    markdown,
  };
}
