import { FREE_TIER, getSeatPlan } from "@captureflow/quota";

// Plan names and allowances that every language's catalog interpolates, so a
// pricing change lands in all of them at once.
export const LIGHT = getSeatPlan("light").name;
export const PRO = getSeatPlan("pro").name;
export const FREE_RECORDINGS = FREE_TIER.recordingsPerPerson;
export const FREE_AGENT_MIN = FREE_TIER.agentMinutesPerPerson;
export const LIGHT_AGENT_MIN = getSeatPlan("light").agentMinutesPerSeat;
export const PRO_AGENT_MIN = getSeatPlan("pro").agentMinutesPerSeat;
export const PRO_VOICEOVER_MIN = getSeatPlan("pro").voiceoverMinutesPerSeat;
