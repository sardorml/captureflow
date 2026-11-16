import { isMarketingRoute } from "@/lib/app-routes";

const CONTEST_SITE_HOST = "captureflow.dev";
const CONTEST_SITE_ID = "4c5188c64efb476de1ca33e33b6c4ca4f02cb651";
const CONTEST_SCRIPT_URL = "https://www.ship-or-die.com/hackathon/verify.js";

/*
 * The contest script reports the path of every page it sees, so it starts on
 * marketing pages only: a share or invite link opened directly never loads it.
 * Once loaded it keeps reporting through client-side navigation.
 */
export function shouldLoadContestTracker(
  hostname: string,
  pathname: string,
): boolean {
  return hostname === CONTEST_SITE_HOST && isMarketingRoute(pathname);
}

export function loadContestTracker(): void {
  if (document.querySelector(`script[src="${CONTEST_SCRIPT_URL}"]`)) return;
  const script = document.createElement("script");
  script.defer = true;
  script.src = CONTEST_SCRIPT_URL;
  script.dataset.site = CONTEST_SITE_ID;
  document.head.appendChild(script);
}
