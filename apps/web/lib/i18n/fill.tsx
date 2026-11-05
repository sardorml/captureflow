import { Fragment, type ReactNode } from "react";

// Renders "Read the {link} first" with a node in place of each {slot}, so a
// translation decides where the link or logo sits in its sentence.
export function fill(
  text: string,
  slots: Record<string, ReactNode>,
): ReactNode[] {
  return text
    .split(/\{(\w+)\}/)
    .map((part, i) =>
      i % 2 ? <Fragment key={i}>{slots[part]}</Fragment> : part,
    );
}
