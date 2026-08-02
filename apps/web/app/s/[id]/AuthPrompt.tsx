import { buttonVariants } from "@heroui/react";

type Props = {
  marketingUrl: string;
  loginUrl: string;
};

export function AuthPrompt({ marketingUrl, loginUrl }: Props) {
  return (
    <div className="flex items-center gap-1.5">
      <a
        href={`${marketingUrl}/#pricing`}
        className={buttonVariants({ variant: "ghost", size: "sm" })}
      >
        Pricing
      </a>
      <a
        href={loginUrl}
        className={buttonVariants({ variant: "secondary", size: "sm" })}
      >
        Log in
      </a>
      <a
        href={marketingUrl}
        className={buttonVariants({ variant: "primary", size: "sm" })}
      >
        Get CaptureFlow free
      </a>
    </div>
  );
}
