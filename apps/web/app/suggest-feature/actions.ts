"use server";

import { hydrateSuggestion, suggestionRequest } from "@/lib/contact-requests";
import {
  submitContactRequest,
  type ContactFormState,
} from "@/lib/contact-submit";
import { sendSuggestionEmail } from "@/lib/email";
import { ADMIN_INBOX_URL, SUPPORT_EMAIL } from "@/lib/marketing/constants";

export async function submitSuggestionAction(
  _prev: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  return submitContactRequest(
    hydrateSuggestion(formData),
    suggestionRequest,
    (suggestion) =>
      sendSuggestionEmail({
        to: SUPPORT_EMAIL,
        suggestion,
        adminUrl: `${ADMIN_INBOX_URL}?kind=suggestion`,
      }),
  );
}
