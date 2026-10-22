"""Poddex PC pipeline: Podcasts folder -> Cloudflare R2 + Supabase, with Whisper lyrics.

Drop an mp3 into the Podcasts folder:
  1. it is uploaded to R2 and added to the app (lyrics "pending"),
  2. Whisper (base.en) transcribes it -> <name>.lrc, or <name>.failed on error,
  3. the lyrics state/text is sent to Supabase -> the app shows the lyrics.
The folder is the source of truth: renaming, deleting, editing .lrc or deleting .failed
(to retry) are all picked up on the next check (every 60s).

Usage:  pythonw make_lrc.py            (settings in config.json next to this file)
Log:    make_lrc.log next to this file
"""
import json, logging, pathlib, time
from datetime import datetime, timezone
from urllib.parse import quote

import boto3
import requests
import whisper

HERE = pathlib.Path(__file__).resolve().parent
CFG = json.loads((HERE / "config.json").read_text(encoding="utf-8"))
FOLDER = pathlib.Path(CFG["podcasts_folder"])
PODCAST_ID = CFG.get("podcast_id", 2)  # "Poddex" row in the podcasts table

logging.basicConfig(filename=HERE / "make_lrc.log", level=logging.INFO,
                    format="%(asctime)s %(message)s", encoding="utf-8")
log = logging.info

# --- Supabase (service role key: this script is the only writer) ---
DB = CFG["supabase_url"].rstrip("/") + "/rest/v1/episodes"
HEADERS = {"apikey": CFG["supabase_service_key"],
           "Authorization": f"Bearer {CFG['supabase_service_key']}",
           "Content-Type": "application/json"}

def db_rows():
    r = requests.get(DB, headers=HEADERS, timeout=30, params={
        "podcast_id": f"eq.{PODCAST_ID}", "select": "guid,lyrics_status,lyrics_lrc"})
    r.raise_for_status()
    return {row["guid"]: row for row in r.json()}

def db_insert(mp3):
    added = datetime.fromtimestamp(mp3.stat().st_mtime, timezone.utc).isoformat()
    r = requests.post(DB, headers={**HEADERS, "Prefer": "resolution=merge-duplicates"},
                      params={"on_conflict": "guid"}, timeout=30, json={
        "podcast_id": PODCAST_ID, "guid": mp3.name, "title": mp3.stem,
        "audio_url": CFG["r2_public_url"].rstrip("/") + "/" + quote(mp3.name),
        "published_at": added, "lyrics_status": "pending"})
    r.raise_for_status()

def db_update(guid, fields):
    requests.patch(DB, headers=HEADERS, params={"guid": f"eq.{guid}"}, json=fields, timeout=30).raise_for_status()

def db_delete(guid):
    requests.delete(DB, headers=HEADERS, params={"guid": f"eq.{guid}"}, timeout=30).raise_for_status()

# --- Cloudflare R2 (S3-compatible) ---
s3 = boto3.client("s3", endpoint_url=f"https://{CFG['r2_account_id']}.r2.cloudflarestorage.com",
                  aws_access_key_id=CFG["r2_access_key_id"],
                  aws_secret_access_key=CFG["r2_secret_access_key"], region_name="auto")

def r2_upload(mp3):
    s3.upload_file(str(mp3), CFG["r2_bucket"], mp3.name, ExtraArgs={"ContentType": "audio/mpeg"})

def r2_delete(name):
    s3.delete_object(Bucket=CFG["r2_bucket"], Key=name)

# --- Whisper ---
model = None  # loaded on first use, so the script starts fast

def transcribe(mp3):
    global model
    if model is None:
        model = whisper.load_model(CFG.get("whisper_model", "base.en"))
    result = model.transcribe(str(mp3))
    lines = []
    for s in result["segments"]:
        m, sec = divmod(s["start"], 60)
        lines.append(f"[{int(m):02d}:{sec:05.2f}] {s['text'].strip()}")
    return "\n".join(lines)

def stable(path):
    return time.time() - path.stat().st_mtime >= 60  # may still be copying

def check_once():
    """One pass over the folder. Returns True if it transcribed something (then check again right away)."""
    if not FOLDER.is_dir():
        log(f"Podcasts folder not found: {FOLDER}")
        return False
    local = {p.name: p for p in FOLDER.glob("*.mp3")}
    rows = db_rows()

    # 1. new mp3 -> upload + add to the app (lyrics pending)
    for name, mp3 in local.items():
        if name not in rows and stable(mp3):
            log(f"Uploading: {name}")
            r2_upload(mp3)
            db_insert(mp3)
            rows[name] = {"guid": name, "lyrics_status": "pending", "lyrics_lrc": None}

    # 2. lyrics state on disk -> Supabase (covers new .lrc, edited .lrc, .failed, deleted .failed)
    for name, mp3 in local.items():
        if name not in rows:
            continue
        lrc, failed = mp3.with_suffix(".lrc"), mp3.with_suffix(".failed")
        if lrc.exists():
            status, text = "ready", lrc.read_text(encoding="utf-8")
        elif failed.exists():
            status, text = "failed", None
        else:
            status, text = "pending", None
        if rows[name]["lyrics_status"] != status or rows[name]["lyrics_lrc"] != text:
            db_update(name, {"lyrics_status": status, "lyrics_lrc": text})
            log(f"Lyrics {status}: {name}")

    # 3. removed mp3 -> remove from the app (never when the folder is empty: protects against a wrong path)
    if local:
        for name in set(rows) - set(local):
            log(f"Removing: {name}")
            r2_delete(name)
            db_delete(name)

    # 4. transcribe ONE pending mp3 (so new uploads aren't stuck behind a long batch)
    for name, mp3 in local.items():
        lrc, failed = mp3.with_suffix(".lrc"), mp3.with_suffix(".failed")
        if lrc.exists() or failed.exists() or not stable(mp3):
            continue
        log(f"Transcribing: {name}")
        try:
            lrc.write_text(transcribe(mp3), encoding="utf-8")
            log(f"Saved: {lrc.name}")
        except Exception as e:
            failed.write_text(str(e), encoding="utf-8")
            log(f"Failed: {name} {e}")
        return True
    return False

if __name__ == "__main__":
    log(f"Watching {FOLDER}")
    while True:
        try:
            busy = check_once()
        except Exception as e:  # network down, Supabase/R2 error: just try again next round
            log(f"Error: {e}")
            busy = False
        if not busy:
            time.sleep(60)
