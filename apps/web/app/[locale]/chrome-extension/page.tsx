import { ChromeExtensionPage } from "@/components/marketing/site-pages";
import {
  localizedMetadata,
  resolveI18n,
  type LocaleParams,
} from "@/lib/i18n/route";

export const generateMetadata = localizedMetadata("chromeExtension");

export default async function Page(props: LocaleParams) {
  return <ChromeExtensionPage i18n={await resolveI18n(props)} />;
}
