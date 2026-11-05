import { DownloadPage } from "@/components/marketing/site-pages";
import {
  localizedMetadata,
  resolveI18n,
  type LocaleParams,
} from "@/lib/i18n/route";

export const generateMetadata = localizedMetadata("download");

export default async function Page(props: LocaleParams) {
  return <DownloadPage i18n={await resolveI18n(props)} />;
}
