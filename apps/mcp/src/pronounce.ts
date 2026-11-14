const OBJECT_STARTS =
  "a|an|the|it|them|this|that|these|those|your|their|its|my|our|his|her|what|whatever|everything|anything|each|every|any|all|both|only|just|one|two|three";

const VERB_RECORD = new RegExp(
  `\\b(r)ecord(s?)(?=\\s+(?:${OBJECT_STARTS})\\b)`,
  "gi",
);

/*
 * Kokoro's phonemizer reads "record" after a noun as the noun ("REcord"), so
 * "the skill records a demo" came out wrong; "rekord" is always the verb. It
 * also reads lowercase "captureflow" as one word, "capture-reh-flow".
 */
export function respellForKokoro(text: string): string {
  return text
    .replace(/\b(c)apture(f)low\b/gi, "$1apture $2low")
    .replace(VERB_RECORD, "$1ekord$2");
}
