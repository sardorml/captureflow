import { headers } from "next/headers";

/*
 * TODO: remove once the stall is found. Renders of / and /login on long-lived
 * prod isolates have hung without a response; the last step a request logs
 * (keyed by cf-ray) is where it stopped.
 */
export async function renderTrace(
  name: string,
): Promise<(step: string) => void> {
  const ray = (await headers()).get("cf-ray") ?? "-";
  const start = Date.now();
  return (step) =>
    console.log(`[trace ${name} ${ray}] ${step} +${Date.now() - start}ms`);
}
