"use server";

import { hydrateSetupRequest, setupRequest } from "@/lib/contact-requests";
import {
  submitContactRequest,
  type ContactFormState,
} from "@/lib/contact-submit";
import { sendCompanyRequestEmail } from "@/lib/email";
import { ADMIN_INBOX_URL, SUPPORT_EMAIL } from "@/lib/marketing/constants";

export async function submitSetupRequestAction(
  _prev: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  return submitContactRequest(
    hydrateSetupRequest(formData),
    setupRequest,
    (request) =>
      sendCompanyRequestEmail({
        to: SUPPORT_EMAIL,
        label: "Setup request",
        subject: `${request.topic || "Contact"}: ${request.company}`,
        name: request.name,
        email: request.email,
        company: request.company,
        details: [
          ["Topic", request.topic],
          ["Team size", request.teamSize],
          ["Cloudflare account", request.cloudflare],
        ],
        notes: request.notes,
        adminUrl: `${ADMIN_INBOX_URL}?kind=setup`,
      }),
  );
}
