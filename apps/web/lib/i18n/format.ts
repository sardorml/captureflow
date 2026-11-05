// Fills the {name} placeholders of a catalog string.
export function fmt(
  text: string,
  values: Record<string, string | number>,
): string {
  return text.replace(/\{(\w+)\}/g, (slot, name: string) =>
    name in values ? String(values[name]) : slot,
  );
}

/*
 * Picks the form of a counted string for `count` and fills {n}. The forms are
 * labelled with the language's plural categories and split by "|":
 * "one:{n} recording|other:{n} recordings". A language lists the categories it
 * has (Polish adds few and many); "other" is always there and is the fallback.
 */
export function plural(forms: string, count: number, lang: string): string {
  const byCategory = new Map(
    forms.split("|").map((form) => {
      const at = form.indexOf(":");
      return [form.slice(0, at), form.slice(at + 1)] as const;
    }),
  );
  const category = new Intl.PluralRules(lang).select(count);
  const form = byCategory.get(category) ?? byCategory.get("other") ?? forms;
  return fmt(form, { n: count });
}
