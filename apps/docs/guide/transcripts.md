# Transcripts and cuts

Record with the microphone on in the Chrome extension and CaptureFlow writes a
transcript for you. It's free on every plan: the recorder uploads your mic as
small audio files next to the video, and the instance transcribes them with
Whisper running on Workers AI inside its own Cloudflare account. Nothing goes
to a third-party transcription service. Transcription takes roughly a third of
the recording's length, so a two-minute recording has its transcript about
forty seconds after you stop.

## On the share page

The transcript sits under the video:

- **Click a line** to jump to that moment.
- **Search** it to find the part you need.
- **Copy** the whole transcript with timestamps.
- Turn on **captions** with the CC button in the player, or press `c`.

A link opened right after recording shows "Transcribing…" until the transcript
is in, then fills itself in without a reload.

## Cut the video from the transcript

Open the **editor** from the share page or the dashboard and use the transcript
panel on the right:

1. Click a line to select it; shift-click another line to extend the selection.
2. Press **Delete** (or **Delete selection** in the timeline).

The player skips that span on the share page and in embeds. The recording file
is untouched, so downloads keep the full video, and **Restore** on a struck
line brings it back. Cuts save automatically, like every other edit.

## Fix the text

Double-click a line, correct it, and press Enter. Fixed lines show in the
transcript and the captions. **Reset** returns to the automatic transcript.

## Good to know

- Lines are split at sentence ends and every word is timed, so cuts land
  within a few hundred milliseconds of the speech.
- A recording made with the mic off has no transcript.
- Whisper picks up the language you speak; your browser language is passed
  along as a hint.
- Transcripts work in every Chromium browser the extension runs in, since the
  recognition happens on the server.

Next: [Screenshots](/guide/screenshots).
