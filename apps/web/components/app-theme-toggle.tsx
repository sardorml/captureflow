"use client";

import type { ComponentProps } from "react";
import { ThemeToggle } from "@captureflow/ui";
import { useAppMessages } from "./app-i18n-provider";

// The theme toggle with its labels in the app's language.
export function AppThemeToggle(
  props: Omit<ComponentProps<typeof ThemeToggle>, "labels">,
) {
  const { themeToLight, themeToDark } = useAppMessages().common;
  return (
    <ThemeToggle
      {...props}
      labels={{ toLight: themeToLight, toDark: themeToDark }}
    />
  );
}
