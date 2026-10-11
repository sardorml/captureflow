"use server";

/// <reference types="@cloudflare/workers-types" />

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { writeAudit } from "@captureflow/admin";
import {
  countRecipients,
  createCampaign,
  deleteDraft,
  getCampaign,
  hydrateCampaignId,
  hydrateCampaignInput,
  revertStart,
  startCampaign,
  updateDraft,
} from "@captureflow/mail";
import { getAdminEnv } from "@/lib/env";
import { requirePermission } from "@/lib/guard";
import type { FormState } from "../actions";

export type TestState = FormState & { sentTo: string | null };

const NO_DB = "No database binding on this deployment.";
const NO_QUEUE =
  "Sending needs the mailer Worker: bind MAIL_QUEUE on this deployment.";
const NOT_DRAFT = "This email has already been sent.";

// Each action re-verifies: server actions can be replayed directly.

export async function createCampaignAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const operator = await requirePermission("mail.send");
  const env = await getAdminEnv();
  if (!env?.DB) return { error: NO_DB };
  const input = hydrateCampaignInput(formData);
  if (!input.ok) return { error: input.error };
  const id = await createCampaign(
    env.DB,
    { ...input.value, createdBy: operator.email },
    Date.now(),
  );
  await writeAudit(env.DB, {
    actor: operator.email,
    action: "mail.draft",
    targetType: "campaign",
    targetId: id,
    detail: input.value.subject,
  });
  redirect(`/emails/${id}`);
}

export async function updateCampaignAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requirePermission("mail.send");
  const env = await getAdminEnv();
  if (!env?.DB) return { error: NO_DB };
  const id = hydrateCampaignId(formData.get("id"));
  if (!id) return { error: "Unknown email." };
  const input = hydrateCampaignInput(formData);
  if (!input.ok) return { error: input.error };
  if (!(await updateDraft(env.DB, id, input.value))) {
    return { error: NOT_DRAFT };
  }
  revalidatePath(`/emails/${id}`);
  revalidatePath("/emails");
  return { error: null };
}

export async function deleteCampaignAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const operator = await requirePermission("mail.send");
  const env = await getAdminEnv();
  if (!env?.DB) return { error: NO_DB };
  const id = hydrateCampaignId(formData.get("id"));
  if (!id) return { error: "Unknown email." };
  if (!(await deleteDraft(env.DB, id))) return { error: NOT_DRAFT };
  await writeAudit(env.DB, {
    actor: operator.email,
    action: "mail.delete",
    targetType: "campaign",
    targetId: id,
  });
  revalidatePath("/emails");
  redirect("/emails");
}

export async function sendTestAction(
  _prev: TestState,
  formData: FormData,
): Promise<TestState> {
  const operator = await requirePermission("mail.send");
  const env = await getAdminEnv();
  if (!env?.DB) return { error: NO_DB, sentTo: null };
  if (!env.MAIL_QUEUE) return { error: NO_QUEUE, sentTo: null };
  const id = hydrateCampaignId(formData.get("id"));
  if (!id || !(await getCampaign(env.DB, id))) {
    return { error: "Unknown email.", sentTo: null };
  }
  await env.MAIL_QUEUE.send({
    kind: "test",
    campaignId: id,
    to: operator.email,
  });
  await writeAudit(env.DB, {
    actor: operator.email,
    action: "mail.test",
    targetType: "campaign",
    targetId: id,
  });
  return { error: null, sentTo: operator.email };
}

export async function sendCampaignAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const operator = await requirePermission("mail.send");
  const env = await getAdminEnv();
  if (!env?.DB) return { error: NO_DB };
  if (!env.MAIL_QUEUE) return { error: NO_QUEUE };
  const id = hydrateCampaignId(formData.get("id"));
  if (!id) return { error: "Unknown email." };
  if (
    String(formData.get("confirm") ?? "")
      .trim()
      .toUpperCase() !== "SEND"
  ) {
    return { error: "Type SEND to confirm." };
  }
  if ((await countRecipients(env.DB, id)) === 0) {
    return { error: "Nobody would get this. Pick at least one person." };
  }
  if (!(await startCampaign(env.DB, id, Date.now()))) {
    return { error: NOT_DRAFT };
  }
  try {
    await env.MAIL_QUEUE.send({ kind: "page", campaignId: id, after: "" });
  } catch (err) {
    console.error("admin: could not queue campaign", id, err);
    await revertStart(env.DB, id);
    return { error: "Couldn't start sending. Nothing went out; try again." };
  }
  await writeAudit(env.DB, {
    actor: operator.email,
    action: "mail.send",
    targetType: "campaign",
    targetId: id,
  });
  revalidatePath(`/emails/${id}`);
  revalidatePath("/emails");
  return { error: null };
}
