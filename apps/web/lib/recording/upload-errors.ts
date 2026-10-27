import { jsonError } from "./cors";
import type { UploadOverrun } from "./quota";

export function overrunError(kind: UploadOverrun) {
  return kind === "size_limit"
    ? jsonError(
        "Free plan limit: recordings up to the data saver size",
        413,
        "size_limit",
      )
    : jsonError("Storage cap reached", 413, "storage_limit");
}
