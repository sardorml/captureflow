import { describe, expect, it } from "vitest";
import { objectKeysFor } from "@captureflow/shared/object-keys";

const row = {
  storageKey: "videos/abc.mp4",
  posterKey: null,
  posterThumbKey: null,
  webcamStorageKey: null,
};

describe("objectKeysFor with a background picture", () => {
  it("deletes the uploaded background along with the recording", () => {
    const file = `${"c".repeat(32)}.jpg`;
    const keys = objectKeysFor({
      ...row,
      configJson: JSON.stringify({ background: `image:${file}` }),
    });
    expect(keys).toContain(`recording-backgrounds/${file}`);
  });

  it("adds nothing for other backgrounds or a broken config", () => {
    const plain = objectKeysFor(row);
    for (const configJson of ['{"background":"violet"}', "{oops", null]) {
      expect(objectKeysFor({ ...row, configJson })).toEqual(plain);
    }
  });
});
