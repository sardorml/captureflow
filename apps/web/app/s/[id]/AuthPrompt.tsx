import { SmoothButton } from "@captureflow/ui";

type Props = {
  marketingUrl: string;
  loginUrl: string;
};

export function AuthPrompt({ marketingUrl, loginUrl }: Props) {
  return (
    <div className="flex items-center gap-1.5">
      <SmoothButton variant="ghost" size="sm" asChild>
        <a href={`${marketingUrl}/#pricing`}>Pricing</a>
      </SmoothButton>
      <SmoothButton variant="outline" size="sm" asChild>
        <a href={loginUrl}>Log in</a>
      </SmoothButton>
      <SmoothButton variant="default" size="sm" asChild>
        <a href={marketingUrl}>Get CaptureFlow free</a>
      </SmoothButton>
    </div>
  );
}
