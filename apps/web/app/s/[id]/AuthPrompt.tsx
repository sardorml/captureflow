import { buttonVariants } from "@/components/ui/button";
import { getAppI18n } from "@/lib/i18n/app/server";
import { fmt } from "@/lib/i18n/format";
import { PRODUCT_NAME } from "@/lib/site";

type Props = {
  marketingUrl: string;
  loginUrl: string;
};

export async function AuthPrompt({ marketingUrl, loginUrl }: Props) {
  const { messages: m } = await getAppI18n();
  return (
    <div className="flex items-center gap-1.5">
      <a
        href={`${marketingUrl}/#pricing`}
        className={buttonVariants({
          variant: "ghost",
          size: "sm",
          className: "max-sm:hidden",
        })}
      >
        {m.screenshotView.authPrompt.pricing}
      </a>
      <a
        href={loginUrl}
        className={buttonVariants({ variant: "secondary", size: "sm" })}
      >
        {m.screenshotView.authPrompt.logIn}
      </a>
      <a href={marketingUrl} className={buttonVariants({ size: "sm" })}>
        <span className="sm:hidden">
          {m.screenshotView.authPrompt.getStarted}
        </span>
        <span className="max-sm:hidden">
          {fmt(m.screenshotView.authPrompt.getFree, { product: PRODUCT_NAME })}
        </span>
      </a>
    </div>
  );
}
