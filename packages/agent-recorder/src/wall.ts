const WALL_TITLES =
  /just a moment|access denied|attention required|are you a robot|security check|verify you are human|403 forbidden/i;
const WALL_TEXT =
  /blocked by network security|verify you are human|enable javascript and cookies|unusual traffic|checking your browser|prove you're not a robot|performing security verification|protect against malicious bot/i;

// A bot check, consent gate, block page or blank in place of the site, as an automated browser often gets.
export function looksLikeWall(title: string, bodyText: string): boolean {
  return (
    WALL_TITLES.test(title) ||
    WALL_TEXT.test(bodyText) ||
    bodyText.trim().length < 20
  );
}
