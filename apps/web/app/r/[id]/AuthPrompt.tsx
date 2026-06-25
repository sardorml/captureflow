import { Button, Flex } from "antd";

type Props = {
  marketingUrl: string;
  loginUrl: string;
};

export function AuthPrompt({ marketingUrl, loginUrl }: Props) {
  return (
    <Flex align="center" gap={6}>
      <Button type="text" size="small" href={`${marketingUrl}/#pricing`}>
        Pricing
      </Button>
      <Button size="small" href={loginUrl}>
        Log in
      </Button>
      <Button type="primary" size="small" href={marketingUrl}>
        Get CaptureFlow free
      </Button>
    </Flex>
  );
}
