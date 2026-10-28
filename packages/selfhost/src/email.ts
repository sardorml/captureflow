import { createTransport } from "nodemailer";

type Address = string | { name?: string; email: string };

type OutgoingEmail = {
  from: Address;
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  replyTo?: Address;
};

function formatAddress(address: Address): string {
  if (typeof address === "string") return address;
  return address.name ? `"${address.name}" <${address.email}>` : address.email;
}

// The Email Service `send_email` binding's shape, sent over SMTP instead.
export function createSmtpEmail(smtpUrl: string): SendEmail {
  const transport = createTransport(smtpUrl);
  const send = async (message: OutgoingEmail) => {
    const info = await transport.sendMail({
      from: formatAddress(message.from),
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
      replyTo: message.replyTo ? formatAddress(message.replyTo) : undefined,
    });
    return { messageId: info.messageId };
  };
  return { send } as unknown as SendEmail;
}

/*
 * No mail server configured: print the message so the operator can still
 * follow an invite link from `docker compose logs`.
 */
export function createLogEmail(): SendEmail {
  const send = async (message: OutgoingEmail) => {
    console.log(
      [
        "[email] no SMTP_URL set; message not sent",
        `  to: ${[message.to].flat().join(", ")}`,
        `  subject: ${message.subject}`,
        message.text ?? "",
      ].join("\n"),
    );
    return { messageId: "logged" };
  };
  return { send } as unknown as SendEmail;
}
