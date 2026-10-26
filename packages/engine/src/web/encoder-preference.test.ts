import { describe, expect, it } from "vitest";
import { RECORDING_QUALITIES } from "../quality";
import { encoderAccelerationFor } from "./encoder-preference";

describe("encoderAccelerationFor", () => {
  it("sends Data saver and Low to the software encoder", () => {
    expect(
      encoderAccelerationFor(RECORDING_QUALITIES.saver.screen.bitrate),
    ).toBe("prefer-software");
    expect(encoderAccelerationFor(RECORDING_QUALITIES.low.screen.bitrate)).toBe(
      "prefer-software",
    );
  });

  it("keeps Balanced and above on the hardware encoder", () => {
    for (const id of ["balanced", "high", "max"] as const) {
      expect(
        encoderAccelerationFor(RECORDING_QUALITIES[id].screen.bitrate),
      ).toBe("prefer-hardware");
    }
  });
});
