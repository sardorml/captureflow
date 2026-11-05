import { describe, expect, it } from "vitest";
import { LOCALES, type LocaleCode } from "./config";

type Leaf = { path: string; text: string; copy: boolean };

// Every value in a catalog with its dotted path, arrays by index. Flags and
// numbers come back as text, so they have to equal the English ones.
function leaves(value: unknown, path = ""): Leaf[] {
  if (value === null || typeof value !== "object") {
    return [{ path, text: String(value), copy: typeof value === "string" }];
  }
  return Object.entries(value).flatMap(([key, child]) =>
    leaves(child, path ? `${path}.${key}` : key),
  );
}

const PLURAL_FORM = /^(zero|one|two|few|many|other):/;

const sorted = (matches: RegExpMatchArray | null) =>
  [...(matches ?? [])].sort();
const slots = (text: string) => sorted(text.match(/\{\w+\}/g));
const digits = (text: string) => sorted(text.match(/\d/g)).join("");
const lineBreaks = (text: string) => text.split("\n").length;
const struckOut = (text: string) => (text.match(/\[[^\]]+\]/g) ?? []).length;
const isCounted = (text: string) => PLURAL_FORM.test(text);

// A counted string lists its forms as "one:…|other:…"; each needs a known
// label, and "other" is the one every language falls back to.
function countedProblem(text: string): string | null {
  const forms = text.split("|");
  if (!forms.every((form) => PLURAL_FORM.test(form))) return "unlabelled form";
  if (!forms.some((form) => form.startsWith("other:"))) return "no other form";
  return null;
}

/*
 * The checks every translated catalog has to pass against its English one:
 * same keys, placeholders, numbers and line breaks, and actually translated.
 * A counted string may have more or fewer forms than English, so its
 * placeholders are compared form by form instead.
 */
export function describeCatalogParity(
  english: unknown,
  load: (locale: LocaleCode) => Promise<unknown>,
) {
  const source = leaves(english);
  const sourceText = new Map(source.map((leaf) => [leaf.path, leaf.text]));

  describe.each(LOCALES.map((l) => l.code))("%s catalog", (code) => {
    it("has the same keys and list lengths as English", async () => {
      const paths = leaves(await load(code)).map((leaf) => leaf.path);
      expect(paths).toEqual(source.map((leaf) => leaf.path));
    });

    it("keeps placeholders, numbers and line breaks in every string", async () => {
      const problems: string[] = [];
      for (const { path, text } of leaves(await load(code))) {
        const original = sourceText.get(path) ?? "";
        if (!text.trim()) problems.push(`${path}: empty`);
        if (isCounted(original)) {
          const problem = isCounted(text)
            ? countedProblem(text)
            : "not a counted string";
          if (problem) problems.push(`${path}: ${problem}`);
          const wanted = slots(original.split("|")[0] ?? "").join();
          if (text.split("|").some((form) => slots(form).join() !== wanted))
            problems.push(`${path}: placeholders differ`);
          continue;
        }
        if (slots(text).join() !== slots(original).join())
          problems.push(`${path}: placeholders differ`);
        if (digits(text) !== digits(original))
          problems.push(`${path}: numbers differ`);
        if (lineBreaks(text) !== lineBreaks(original))
          problems.push(`${path}: line breaks differ`);
        if (struckOut(text) !== struckOut(original))
          problems.push(`${path}: [bracketed] words differ`);
      }
      expect(problems).toEqual([]);
    });

    it("is translated", async () => {
      // Flags are never translated, and URLs, commands and brand names stay
      // as they are, so some of the text is the same in every language.
      const all = leaves(await load(code)).filter((leaf) => leaf.copy);
      const same = all.filter(
        ({ path, text }) => text === sourceText.get(path),
      );
      expect(same.length / all.length).toBeLessThan(0.2);
    });
  });
}
