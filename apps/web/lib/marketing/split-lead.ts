// Section copy reads in two tones: the first sentence bright, the rest muted.
export function splitLead(text: string): { lead: string; rest: string } {
  const match = /^(.+?[.!?])\s+(.+)$/s.exec(text);
  if (!match) return { lead: text, rest: "" };
  return { lead: match[1]!, rest: match[2]! };
}
