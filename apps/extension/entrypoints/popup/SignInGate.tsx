import { Button, Card, Typography } from "@heroui/react";
import { sendMessage } from "@/lib/messaging";
import { closeSurface } from "@/lib/surface";

// `note` explains a session the panel dropped mid-open (expired, signed out
// elsewhere, or a different account in this browser).
export function SignInGate({ note }: { note?: string | null }) {
  const onSignIn = () => {
    void sendMessage("openSignIn", undefined);
    closeSurface();
  };

  return (
    <div className="flex flex-col gap-3 p-3.5">
      <header className="flex items-center gap-2">
        <img className="size-4.5 rounded-[5px]" src="/icon/32.png" alt="" />
        <Typography weight="semibold">CaptureFlow</Typography>
      </header>

      <Card className="p-3">
        <Typography type="body-sm">
          {note ??
            "Sign in to record your screen and get an instant recording link."}
        </Typography>
      </Card>

      <Button variant="primary" size="lg" fullWidth onPress={onSignIn}>
        Sign in
      </Button>
    </div>
  );
}
