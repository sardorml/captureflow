import { defineExtensionMessaging } from "@webext-core/messaging";
import type { SpikeResultPayload, SpikeStatus } from "./storage";

type ProtocolMap = {
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
