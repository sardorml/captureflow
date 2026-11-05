import { buttonVariants } from "@/components/ui/button";
import { getAppI18n } from "@/lib/i18n/app/server";
import { fmt } from "@/lib/i18n/format";
import { PRODUCT_NAME } from "@/lib/site";
import Link from "next/link";

type Props = {
  marketingUrl: string;
  loginUrl: string;
};

export async function AuthPrompt({ marketingUrl, loginUrl }: Props) {
  const copy = (await getAppI18n()).messages.viewer.authPrompt;
  return (
    <div className="flex items-center gap-1.5">
      <a
        href={`${marketingUrl}/#pricing`}
        className={buttonVariants({
          variant: "ghost",
          className: "max-sm:hidden",
        })}
      >
        {copy.pricing}
      </a>
      <Link
        href={loginUrl}
        className={buttonVariants({ variant: "secondary" })}
      >
        {copy.logIn}
      </Link>
      <a href={marketingUrl} className={buttonVariants()}>
        <span className="sm:hidden">{copy.getStarted}</span>
        <span className="max-sm:hidden">
          {fmt(copy.getFree, { product: PRODUCT_NAME })}
        </span>
      </a>
    </div>
  );
}
