/*
 * Dates, numbers and relative times in the app's language. The Workers runtime
 * ships no Uzbek data and a browser has its own, so Uzbek is written out here
 * and reads the same on both sides. `english` is the locale to format with
 * when the app is in English; left out, it is the runtime's own.
 */

type RelativeUnit =
  | "second"
  | "minute"
  | "hour"
  | "day"
  | "week"
  | "month"
  | "year";
type RelativeStyle = "long" | "short";

const isEnglish = (lang: string) => /^en\b/.test(lang);
const isUzbek = (lang: string) => /^uz\b/.test(lang);

const UZ_MONTHS = [
  "yanvar",
  "fevral",
  "mart",
  "aprel",
  "may",
  "iyun",
  "iyul",
  "avgust",
  "sentabr",
  "oktabr",
  "noyabr",
  "dekabr",
];
const UZ_MONTHS_SHORT = [
  "yan",
  "fev",
  "mar",
  "apr",
  "may",
  "iyn",
  "iyl",
  "avg",
  "sen",
  "okt",
  "noy",
  "dek",
];
const UZ_WEEKDAYS: Record<string, string> = {
  Sunday: "yakshanba",
  Monday: "dushanba",
  Tuesday: "seshanba",
  Wednesday: "chorshanba",
  Thursday: "payshanba",
  Friday: "juma",
  Saturday: "shanba",
};
const UZ_UNITS: Record<RelativeUnit, Record<RelativeStyle, string>> = {
  second: { long: "soniya", short: "son." },
  minute: { long: "daqiqa", short: "daq." },
  hour: { long: "soat", short: "soat" },
  day: { long: "kun", short: "kun" },
  week: { long: "hafta", short: "hafta" },
  month: { long: "oy", short: "oy" },
  year: { long: "yil", short: "yil" },
};
const UZ_NAMED: Partial<Record<RelativeUnit, Record<number, string>>> = {
  second: { 0: "hozir" },
  day: { 0: "bugun", [-1]: "kecha", 1: "ertaga" },
  week: { [-1]: "oʻtgan hafta" },
  month: { [-1]: "oʻtgan oy" },
  year: { [-1]: "oʻtgan yil" },
};

const pad = (n: number) => String(n).padStart(2, "0");

function uzbekDate(date: Date, options: Intl.DateTimeFormatOptions): string {
  const { dateStyle, timeStyle } = options;
  const styledMonth =
    dateStyle === "full" || dateStyle === "long"
      ? "long"
      : dateStyle === "medium"
        ? "short"
        : dateStyle && "numeric";
  const monthForm = styledMonth || options.month;
  const hasDay = !!dateStyle || !!options.day;
  const hasYear = !!dateStyle || !!options.year;
  const hasWeekday = dateStyle === "full" || !!options.weekday;
  const hasTime = !!timeStyle || !!options.hour;
  const bare = !monthForm && !hasDay && !hasYear && !hasWeekday && !hasTime;

  const parts: Record<string, string> = {};
  const read = new Intl.DateTimeFormat("en-GB", {
    timeZone: options.timeZone,
    weekday: "long",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  for (const part of read.formatToParts(date)) parts[part.type] = part.value;
  const day = Number(parts.day);
  const month = Number(parts.month) - 1;

  let text = "";
  if (monthForm === "long" || monthForm === "short") {
    const name = (monthForm === "long" ? UZ_MONTHS : UZ_MONTHS_SHORT)[month];
    text = hasDay ? `${day}-${name}` : (name ?? "");
    if (hasYear) text += hasDay ? `, ${parts.year}` : ` ${parts.year}`;
  } else if (monthForm || bare) {
    text = [
      hasDay || bare ? pad(day) : null,
      pad(month + 1),
      hasYear || bare ? parts.year : null,
    ]
      .filter(Boolean)
      .join(".");
  } else if (hasYear) {
    text = parts.year ?? "";
  }
  if (hasWeekday) {
    const weekday = UZ_WEEKDAYS[parts.weekday ?? ""] ?? "";
    text = text ? `${weekday}, ${text}` : weekday;
  }
  if (hasTime || bare) {
    const time = `${parts.hour}:${parts.minute}`;
    text = text ? `${text}, ${time}` : time;
  }
  return text;
}

function uzbekRelative(
  value: number,
  unit: RelativeUnit,
  style: RelativeStyle,
): string {
  const named = UZ_NAMED[unit]?.[value];
  if (named) return named;
  const name = UZ_UNITS[unit][style];
  return value <= 0
    ? `${Math.abs(value)} ${name} oldin`
    : `${value} ${name}dan keyin`;
}

export function formatDate(
  value: number | Date,
  lang: string,
  options: Intl.DateTimeFormatOptions,
  english?: string,
): string {
  const date = new Date(value);
  if (isUzbek(lang)) return uzbekDate(date, options);
  const locale = isEnglish(lang) ? english : lang;
  return new Intl.DateTimeFormat(locale, options).format(date);
}

export function formatNumber(
  value: number,
  lang: string,
  options?: Intl.NumberFormatOptions,
  english?: string,
): string {
  if (isUzbek(lang)) {
    const plain = new Intl.NumberFormat("en-US", options).format(value);
    return plain.replace(/[,.]/g, (mark) => (mark === "," ? " " : ","));
  }
  const locale = isEnglish(lang) ? english : lang;
  return new Intl.NumberFormat(locale, options).format(value);
}

/*
 * "5 minutes ago" in the app's language; a value of 0 or -1 reads as "now" or
 * "yesterday" where the language has a word for it. Short keeps the unit
 * abbreviated: the narrow style prints "-5 min" in several languages.
 */
export function relativeTime(
  lang: string,
  style: RelativeStyle,
): (value: number, unit: RelativeUnit) => string {
  if (isUzbek(lang)) return (value, unit) => uzbekRelative(value, unit, style);
  const format = new Intl.RelativeTimeFormat(lang, { style, numeric: "auto" });
  return (value, unit) => format.format(value, unit);
}
