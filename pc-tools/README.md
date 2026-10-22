# Poddex PC pipeline (mp3 → app, with Whisper lyrics)

Drop an mp3 into your Podcasts folder → it is uploaded to Cloudflare R2, appears in the app as
"Lyrics coming soon", Whisper writes `<name>.lrc` (or `<name>.failed`), and the app shows the lyrics.
**The folder is the source of truth. The filename is the episode title.**

## One-time setup

**1. Cloudflare R2** (dash.cloudflare.com → R2)
- Create a bucket named `poddex`.
- Bucket → Settings → Public access → enable the **R2.dev subdomain**. Copy the URL (`https://pub-….r2.dev`).
- R2 → Manage API tokens → Create token → permission **Object Read & Write**, bucket `poddex`.
  Copy the **Access Key ID** and **Secret Access Key** (shown once).
- Copy your **Account ID** (R2 overview page, right side).

**2. PC software** (Command Prompt)
```
winget install Python.Python.3.12
winget install ffmpeg
pip install openai-whisper boto3 requests
```
Close and reopen Command Prompt after installing so `python` and `ffmpeg` are found.

**3. Config**
- Podcasts folder: `C:\Users\Zokirov\telegram-podcast\podcasts` (already created; it is in `.gitignore`, so mp3s never go to GitHub).
- Copy `config.example.json` to `config.json` (same folder as this README) and fill in the values.
  `supabase_service_key` = Supabase → Poddex → Settings → API Keys → Legacy tab → service_role.
- `config.json` is in `.gitignore`. Never commit it or share it.

**4. Test once in a window** (you'll see errors if something is wrong)
```
cd C:\Users\Zokirov\telegram-podcast\pc-tools
python make_lrc.py
```
Drop a short mp3 into the podcasts folder, wait ~2 minutes, check `make_lrc.log`. Ctrl+C to stop.

**5. Start with Windows**
Press Win+R → `shell:startup` → copy `make_lrc.bat` into that folder.

## Operations

| Task | How |
|---|---|
| Add episode | Drop mp3 into Podcasts folder |
| Rename episode | Rename the mp3 **and** its `.lrc` to the same new name |
| Remove episode | Delete the mp3 (and `.lrc` / `.failed`) |
| Fix wrong lyrics | Edit the `.lrc` in Notepad, save as UTF-8 |
| Retry failed lyrics | Read the `.failed` file for the error, then delete it |
| Better accuracy | In `config.json` change `"base.en"` to `"small.en"` (slower) |
| See what happened | Open `make_lrc.log` |

Safety: if the Podcasts folder is missing or empty, nothing is ever removed from the app.

## Known limits
- Uploads and lyrics only happen while the PC is on.
- Transcription runs on CPU: roughly 10–30 min per hour of audio, one file at a time.
- Lyrics are highlighted per line, not per word. Whisper may mishear names.
- R2 free tier: 10 GB storage (~150–200 hours of mp3). Streaming is free.
