import { LanguagePreference } from "@/components/language-preference";
import { getAppI18n } from "@/lib/i18n/app/server";
import { SettingsRow } from "./SettingsRow";

export async function LanguageSetting() {
  const { messages: m } = await getAppI18n();
  return (
    <SettingsRow
      title={m.common.language}
      description={m.settings.personal.languageDescription}
    >
      <LanguagePreference className="w-full" />
    </SettingsRow>
  );
}
