import { Button, Card, Typography } from "@heroui/react";
import { sendMessage } from "@/lib/messaging";

// Only renders in the brief window before the service worker clears the popup
// for the signed-out action; the button opens the web sign-in tab.
export function SignInGate() {
  const onSignIn = () => {
    void sendMessage("openSignIn", undefined);
    window.close();
  };

  return (
    <div className="flex flex-col gap-3 p-3.5">
      <header className="flex items-center gap-2">
        <img className="size-4.5 rounded-[5px]" src="/icon/32.png" alt="" />
        <Typography weight="semibold">CaptureFlow</Typography>
      </header>

      <Card className="p-3">
        <Typography type="body-sm">
          Sign in to record your screen and get an instant recording link.
        </Typography>
      </Card>

      <Button variant="primary" size="lg" fullWidth onPress={onSignIn}>
        Sign in
      </Button>
    </div>
  );
}
