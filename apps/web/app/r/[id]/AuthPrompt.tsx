import { buttonVariants } from "@/components/ui/button";

type Props = {
  marketingUrl: string;
  loginUrl: string;
};

export function AuthPrompt({ marketingUrl, loginUrl }: Props) {
  return (
    <div className="flex items-center gap-1.5">
      <a
        href={`${marketingUrl}/#pricing`}
        className={buttonVariants({
          variant: "ghost",
          className: "max-sm:hidden",
        })}
      >
        Pricing
      </a>
      <a href={loginUrl} className={buttonVariants({ variant: "secondary" })}>
        Log in
      </a>
      <a href={marketingUrl} className={buttonVariants()}>
        <span className="sm:hidden">Get started</span>
        <span className="max-sm:hidden">Get CaptureFlow free</span>
      </a>
    </div>
  );
}
