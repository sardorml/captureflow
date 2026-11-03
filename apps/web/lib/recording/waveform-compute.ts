import type { AppWebBindings } from "@/lib/cf-env";
import { hydratePeaks } from "./waveform";

/*
 * Reads the file with ffmpeg in a container. Null when that can't happen
 * (local dev and self-hosting have no container, or all of them are busy), and
 * the editor then works the peaks out in the browser.
 */
export async function computePeaks(
  env: Pick<AppWebBindings, "WAVEFORM" | "WAVEFORM_URL">,
  mediaKey: string,
  mediaUrl: string,
): Promise<Float32Array<ArrayBuffer> | null> {
  const path = `/peaks?url=${encodeURIComponent(mediaUrl)}`;
  try {
    let res: Response;
    if (env.WAVEFORM_URL) {
      res = await fetch(`${env.WAVEFORM_URL}${path}`);
    } else if (env.WAVEFORM) {
      const stub = env.WAVEFORM.get(env.WAVEFORM.idFromName(mediaKey));
      res = await stub.fetch(new Request(`http://waveform${path}`));
    } else {
      return null;
    }
    if (!res.ok) {
      console.warn(`[waveform] ${mediaKey}: ${res.status}`);
      return null;
    }
    return hydratePeaks(await res.arrayBuffer());
  } catch (err) {
    console.warn(`[waveform] ${mediaKey}:`, err);
    return null;
  }
}
