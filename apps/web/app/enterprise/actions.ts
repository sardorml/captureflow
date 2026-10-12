"use server";

import {
  enterpriseRequest,
  hydrateEnterpriseRequest,
} from "@/lib/contact-requests";
import {
  submitContactRequest,
  type ContactFormState,
} from "@/lib/contact-submit";
import { sendCompanyRequestEmail } from "@/lib/email";
import { ADMIN_INBOX_URL, SUPPORT_EMAIL } from "@/lib/marketing/constants";

export async function submitEnterpriseRequestAction(
  _prev: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  return submitContactRequest(
    hydrateEnterpriseRequest(formData),
    enterpriseRequest,
    (request) =>
      sendCompanyRequestEmail({
        to: SUPPORT_EMAIL,
        label: "Enterprise",
        subject: `Enterprise: ${request.company}`,
        name: request.name,
        email: request.email,
        company: request.company,
        details: [
          ["Needs", request.need],
          ["Team size", request.teamSize],
          ["Storage", request.storage],
        ],
        notes: request.notes,
        adminUrl: `${ADMIN_INBOX_URL}?kind=enterprise`,
      }),
  );
}
