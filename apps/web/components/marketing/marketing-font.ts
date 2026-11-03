import { Hanken_Grotesk } from "next/font/google";

// Passed to MarketingShell by the pages that use it, not loaded by the shell:
// the root not-found page renders the shell and ships with every route.
export const marketingFont = Hanken_Grotesk({
  subsets: ["latin"],
  display: "swap",
});
