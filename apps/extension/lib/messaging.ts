import { defineExtensionMessaging } from "@webext-core/messaging";
import type { SpikeResultPayload, SpikeStatus } from "./storage";

export type SignInResult = { ok: true } | { ok: false; error: string };

type ProtocolMap = {
  // popup → background. Sign-in runs in the SW (the popup unloads when the
  // auth window steals focus), so the popup awaits the result here.
  startSignIn(): SignInResult;
  signOut(): void;
  // popup → background
  startSpike(): void;
  // background → offscreen (offscreen calls getDisplayMedia itself)
  beginCapture(): void;
  // offscreen → background
  spikeStatus(status: SpikeStatus): void;
  spikeResult(result: SpikeResultPayload): void;
};

export const { sendMessage, onMessage } =
  defineExtensionMessaging<ProtocolMap>();
