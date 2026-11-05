import { fmt } from "./i18n/format";

export type RecordedTimeForms = {
  minutes: string;
  hours: string;
  hoursMinutes: string;
};

// Total recorded time as people say it: minutes under an hour, then h and m.
export function formatRecordedTime(
  ms: number,
  forms: RecordedTimeForms,
): string {
  const minutes = Math.round(ms / 60_000);
  if (minutes < 60) return fmt(forms.minutes, { minutes });
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0
    ? fmt(forms.hours, { hours })
    : fmt(forms.hoursMinutes, { hours, minutes: rest });
}
