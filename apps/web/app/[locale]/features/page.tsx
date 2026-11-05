import { FeaturesPage } from "@/components/marketing/site-pages";
import {
  localizedMetadata,
  resolveI18n,
  type LocaleParams,
} from "@/lib/i18n/route";

export const generateMetadata = localizedMetadata("features");

export default async function Page(props: LocaleParams) {
  return <FeaturesPage i18n={await resolveI18n(props)} />;
}
