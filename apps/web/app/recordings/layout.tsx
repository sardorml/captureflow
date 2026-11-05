import { AppI18n } from "@/components/app-i18n";

export default function RecordingEditorLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <AppI18n>{children}</AppI18n>;
}
