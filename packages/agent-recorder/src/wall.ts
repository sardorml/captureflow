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

export type FullFrame = { srcdoc: string } | { src: string };

/*
 * Some site builders serve the whole site from one frame that fills the
 * window, leaving only a badge on the page itself. Run in the page: the frame
 * whose site should be rebuilt in place of the page, or null.
 */
export function findFullFrame(viewport: {
  width: number;
  height: number;
}): FullFrame | null {
  const covering = Array.from(document.querySelectorAll("iframe")).filter(
    (f) => {
      const r = f.getBoundingClientRect();
      return (
        r.width >= viewport.width * 0.9 && r.height >= viewport.height * 0.9
      );
    },
  );
  if (covering.length !== 1) return null;
  const [frame] = covering;
  if (frame.srcdoc) return { srcdoc: frame.srcdoc };
  return /^https?:/.test(frame.src) ? { src: frame.src } : null;
}
