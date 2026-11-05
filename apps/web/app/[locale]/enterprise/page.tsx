import { EnterprisePage } from "@/components/marketing/site-pages";
import {
  localizedMetadata,
  resolveI18n,
  type LocaleParams,
} from "@/lib/i18n/route";

export const generateMetadata = localizedMetadata("enterprise");

export default async function Page(props: LocaleParams) {
  return <EnterprisePage i18n={await resolveI18n(props)} />;
}
