#!/usr/bin/env python3
"""One-off backfill for migration 0008 (sidecars move into the row).

Copies each recording's legacy R2 sidecar JSON — <key minus .mp4>.config.json
and <key>.summary-chapters.json — into recordings.config_json /
summary_chapters_json. Probes every recording (one `wrangler r2 object get`
per candidate key, a few seconds each), so expect a few minutes.

Idempotent: re-run after deploying the cutover to catch sidecars the old
worker wrote in between. Requires wrangler auth. Run the pending D1
migrations first:

    cd apps/web && npx wrangler d1 migrations apply captureflow --remote
    python3 scripts/backfill-recording-sidecars.py
"""

import json
import pathlib
import subprocess
import tempfile

WEB = pathlib.Path(__file__).resolve().parent.parent / "apps" / "web"
BUCKET = "captureflow-recordings"
DB = "captureflow"


def wrangler(*args: str) -> subprocess.CompletedProcess:
    return subprocess.run(
        ["npx", "wrangler", *args], cwd=WEB, capture_output=True, text=True
    )


def d1_json(sql: str):
    r = wrangler("d1", "execute", DB, "--remote", "--json", "--command", sql)
    if r.returncode != 0:
        raise SystemExit(f"d1 execute failed:\n{r.stderr}")
    return json.loads(r.stdout)[0]["results"]


def config_key_for(storage_key: str) -> str:
    # Mirrors recordingConfigKeyFor in apps/web/lib/recording-config.ts.
    base = storage_key[: -len(".mp4")] if storage_key.endswith(".mp4") else storage_key
    return f"{base}.config.json"


def fetch(key: str) -> str | None:
    with tempfile.NamedTemporaryFile(suffix=".json") as f:
        r = wrangler("r2", "object", "get", f"{BUCKET}/{key}", "--file", f.name)
        if r.returncode != 0:
            return None
        body = pathlib.Path(f.name).read_text()
    try:
        json.loads(body)
    except ValueError:
        print(f"  skipping {key}: not valid JSON")
        return None
    return body


def sql_quote(s: str) -> str:
    return "'" + s.replace("'", "''") + "'"


def main() -> None:
    rows = d1_json("SELECT slug, storage_key FROM recordings")
    print(f"probing {len(rows)} recordings for legacy sidecars…")
    updates = 0
    for row in rows:
        slug, key = row["slug"], row["storage_key"]
        for column, sidecar in (
            ("config_json", config_key_for(key)),
            ("summary_chapters_json", f"{key}.summary-chapters.json"),
        ):
            body = fetch(sidecar)
            if body is None:
                continue
            d1_json(
                f"UPDATE recordings SET {column} = {sql_quote(body)} "
                f"WHERE slug = {sql_quote(slug)}"
            )
            print(f"  {slug}: {sidecar} -> {column}")
            updates += 1
    print(f"done: {updates} column(s) backfilled")


if __name__ == "__main__":
    main()
