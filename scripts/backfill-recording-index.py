#!/usr/bin/env python3
"""One-off backfill: seek index + CDN caching for recordings uploaded before both.

Recordings uploaded before the client wrote a seek index start slowly (the
player walks every fragment) and their camera files have no duration. They
were also stored with Cache-Control: no-cache, so the CDN never kept them.

For each ready recording this downloads the screen and camera files, writes
the index with packages/engine/scripts/index-recording.ts, uploads the result
over the original with the media Cache-Control, and stores the new size (the
?v=<size> URL then busts any browser copy). Files that already have an index
are skipped, so it is safe to re-run.

Dry run by default: downloads and indexes everything, uploads nothing.

    python3 scripts/backfill-recording-index.py           # dry run
    python3 scripts/backfill-recording-index.py --apply
"""

import json
import pathlib
import subprocess
import sys
import tempfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
WEB = ROOT / "apps" / "web"
ENGINE = ROOT / "packages" / "engine"
BUCKET = "captureflow-recordings"
DB = "captureflow"
# Mirrors MEDIA_CACHE_CONTROL in apps/web/lib/recording/r2.ts.
MEDIA_CACHE_CONTROL = "public, max-age=0, must-revalidate, s-maxage=31536000"
CONTENT_TYPES = {"mp4": "video/mp4", "webm": "video/webm"}


def run(cmd: list[str], cwd: pathlib.Path) -> str:
    r = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError(f"{' '.join(cmd[:4])} failed:\n{r.stderr[-2000:]}")
    return r.stdout


def wrangler(*args: str) -> str:
    return run(["npx", "wrangler", *args], WEB)


def d1(sql: str) -> dict:
    return json.loads(wrangler("d1", "execute", DB, "--remote", "--json", "--command", sql))[0]


def sql_quote(s: str) -> str:
    return "'" + s.replace("'", "''") + "'"


def index(src: pathlib.Path, dst: pathlib.Path) -> dict:
    out = run(["pnpm", "exec", "tsx", "scripts/index-recording.ts", str(src), str(dst)], ENGINE)
    return json.loads(out.strip().splitlines()[-1])


def backfill(
    slug: str, key: str, size_column: str, size: int, duration_ms: int, apply: bool, tmp: pathlib.Path
) -> bool:
    src, dst = tmp / "src", tmp / "dst"
    wrangler("r2", "object", "get", f"{BUCKET}/{key}", "--file", str(src), "--remote")
    if src.stat().st_size != size:
        print(f"  {slug} {key}: R2 has {src.stat().st_size}B, D1 says {size}B; skipped")
        return False
    result = index(src, dst)
    if not result["indexed"]:
        print(f"  {slug} {key}: already indexed or not indexable; skipped")
        return False
    drift = abs((result["durationMs"] or 0) - duration_ms)
    if drift > max(2000, duration_ms * 0.05):
        # The file's own timeline disagrees with the recording: leave it as it is.
        print(f"  {slug} {key}: timeline says {result['durationMs']}ms, recording {duration_ms}ms; skipped")
        return False
    new_size = result["size"]
    print(f"  {slug} {key}: {size}B -> {new_size}B, {result['durationMs']}ms")
    if not apply:
        return True
    wrangler(
        "r2", "object", "put", f"{BUCKET}/{key}", "--file", str(dst), "--remote",
        "--content-type", CONTENT_TYPES[result["format"]],
        "--cache-control", MEDIA_CACHE_CONTROL,
    )
    changed = d1(
        f"UPDATE recordings SET {size_column} = {new_size} "
        f"WHERE slug = {sql_quote(slug)} AND state = 'ready' AND {size_column} = {size}"
    )["meta"]["changes"]
    if changed == 0:
        # Deleted (or replaced) while this ran: don't leave our copy behind.
        wrangler("r2", "object", "delete", f"{BUCKET}/{key}", "--remote")
        print(f"  {slug}: recording changed during the backfill; upload removed")
    return True


def main() -> None:
    apply = "--apply" in sys.argv[1:]
    rows = d1(
        "SELECT slug, storage_key, size_bytes, webcam_storage_key, webcam_size_bytes, webcam_state, duration_ms "
        "FROM recordings WHERE state = 'ready' ORDER BY created_at"
    )["results"]
    print(f"{'applying to' if apply else 'dry run over'} {len(rows)} recordings…")
    done = failed = 0
    for row in rows:
        files = [(row["storage_key"], "size_bytes", row["size_bytes"])]
        if row["webcam_storage_key"] and row["webcam_state"] == "ready":
            files.append((row["webcam_storage_key"], "webcam_size_bytes", row["webcam_size_bytes"]))
        for key, column, size in files:
            with tempfile.TemporaryDirectory() as tmp:
                try:
                    done += backfill(
                        row["slug"], key, column, size, row["duration_ms"] or 0, apply, pathlib.Path(tmp)
                    )
                except RuntimeError as err:
                    failed += 1
                    print(f"  {row['slug']} {key}: {err}")
    verb = "rewrote" if apply else "would rewrite"
    print(f"done: {verb} {done} file(s), {failed} failed")


if __name__ == "__main__":
    main()
