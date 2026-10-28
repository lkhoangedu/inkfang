# Inkfang · Hold the line

A portrait English-learning survival game with **Type** and **Speak** controls.

**Deployment:** see [DEPLOY.md](DEPLOY.md) for GitHub Pages, ordinary static hosting, and microphone-enabled embedding. A GitHub Actions workflow and a working local iframe example are included. Drawing has been retired completely: no handwriting scripts, canvas, controls, or drawing guide assets are shipped.

## Setup and practice content

Four short setup steps: Controls → Targets → Pace → Ready. A mode-specific three-screen visual guide sits beside the form (below it on phones). First-time instructions are remembered per control and skill in `inkfang-guide-v4-*`; students can replay them. Thirty captured example-screen images cover all ten supported combinations.

The built-in bank has 1,237 targets: all 1,001 integers from 0 to 1000, 26 letter names, 90 vocabulary clues, 90 names / places, and 30 whole-word British English IPA cards. Teachers can search and export JSON/CSV and add/import custom vocabulary or names. Custom questions and best scores remain in local browser storage, with no student accounts or shared reporting.

Number typing requires digits. Number words and mixed punctuation cannot damage number targets. Single letters and IPA cards are Speak-only. Mixed typing combines numbers and vocabulary; mixed speaking also includes letter names. IPA practice asks the student to say the complete transcribed word, not an isolated phoneme.

## Faster typing

Complete, unambiguous answers attack in the input event, with no fixed debounce. If the exact answer could also be a prefix of a longer active target (9 and 98), it waits 220 ms for more characters. Incomplete prefixes do not submit premature misses. Other partial/mistyped answers are checked after 180 ms; Enter remains an immediate shortcut. Input-method composition is respected.

## Speaking without sentence-final delays

The browser's SpeechRecognition / webkitSpeechRecognition service supplies transcripts. The game processes interim updates immediately for completed leading answers in a phrase. A last answer can fire after 180 ms without a changed transcript; an answer that is still a prefix of another active target waits for more speech or a final result. This removes the application's sentence-final wait; it does not control the browser service's own recognition latency.

The matcher parses several complete answers from one transcript, including sequences such as “sixty-seven seventy-eight ninety-seven”, mixed numbers/words/letter names, and multiword answers such as “ice cream”. Compound numbers are treated atomically, so “one hundred and six” does not attack 1, 100 and 6. Out-of-range and fractional numeric spans do not attack component numbers. The game chooses matching active targets rather than treating a whole transcript as one required answer.

Per-utterance ledgers track semantic answer occurrences and their spoken source. Interim revisions, digit-versus-word rewrites, repeated service callbacks and final results cannot replay an already counted attack. Separately spoken repeats remain possible. Alternative transcripts are evaluated as alternatives, not all fired together.

Speech mode requests microphone permission before the run, immediately releases the temporary permission stream, and lets the browser manage recognition. No audio is recorded or stored by Inkfang. Some browser providers process audio online. This is recognized-word practice, not a pronunciation or phoneme score. Browser/OS support, network quality, accents, and the speech service still affect speed and accuracy.

References: https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition and https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/interimResults

## Separate pace for Type and Speak

| Difficulty | Type: travel / arrival / cap | Speak: travel / arrival / cap |
| --- | --- | --- |
| Drift | 22 s / 4.8 s / 5 | 36 s / 7 s / 2 |
| Steady | 12 s / 2.25 s / 7 | 24 s / 5 s / 3 |
| Rush | 8 s / 1.45 s / 8 | 18 s / 3.8 s / 3 |
| Blitz | 5.8 s / 0.95 s / 10 | 14 s / 3 s / 4 |

Voice starts with one monster and a gentler wave escalation, capped at 1.4× instead of Type's 2×. Every voice monster gets 1.4 seconds at the danger line to absorb recognition delay. During normal microphone reconnection, monsters and the match clock freeze; reconnect attempts start after 100 ms. Service errors pause the game. After a completely cleared voice swarm, the next monster waits 1.2 seconds rather than respawning instantly or leaving the board empty for a full arrival interval.

Five hearts; escaped targets cost one. Run for two minutes, three minutes, or until hearts run out. Pause manually or automatically on hidden tabs / lost focus. Readable target labels drive collision spacing. Exact matches defeat, while typing can earn positional partial damage once per character. Scores, combos, best scores, run badges, milestone progress and review cards remain available.

## One adaptive background score

There is one original synthesized score and no soundtrack chooser. Its tempo follows actual monster travel speed, including mode and wave acceleration: gentler voice swarms get a slower score; fast typing swarms get faster music. Tempo ranges from 72–150 BPM. Locally generated chords, bass, melody and percussion add intensity through the run. No external audio files or licensed recordings are downloaded.

Music and effects have separate toggles, plus a music volume control in Pause. Distinct effects cover arrivals, partial hits, hits, combos, escapes, waves and match outcomes. Music starts only after a user action, pauses with play and strongly ducks in Speak mode. Headphones or muting music may further improve microphone recognition.

## Source and checks

Static site with no dependencies or build step; serve `dist/` with a static HTTP server. Main modules: `engine.js` (survival rules, voice parsing / ledgers, typing timing), `speech.js` (permission, interim updates and recognition lifecycle), `audio.js` (one adaptive score), `content.js` (question pools), `app.js` (UI / lifecycle), and the guide modules.

Run `node --test tests/*.test.cjs`. The checks cover numeric ranges, digits-only typing, immediate typing/prefix protection, multi-target speech, atomic number parsing, interim/final duplicate prevention, stable-update timing, permission denial, reconnect / stop behavior, voice swarm caps and grace, adaptive music, guide assets and retired-feature absence.

Browser QA verified the simplified setup, voice-specific pace descriptions, removal of the song selector, and a complete typed answer increasing the score immediately after filling the field with no wait or Enter. Live microphone recognition still needs device testing; controller callbacks and the complete spoken-batch-to-engine path are exercised with deterministic mocks. Previous portrait viewport checks are retained; physical phones/tablets and microphone provider latency are not verified.

## October 28 speech accuracy and classroom input fixes

Confirmed matcher failures: “for” failed to attack 4, “twenty for” attacked 20 rather than 24, and an updated alternative was discarded when the top transcript stayed the same. Regression cases now pass. The number parser keeps provider-formatted “1,000” atomic, rejects decimal/signed spans, and canonicalizes a small explicit homophone set before parsing whole numbers; it does not use broad fuzzy spelling or accept different numbers. Literal vocabulary takes priority over a homophone interpretation. Explicit uppercase letter batches are split only in letter-practice mode. The controller requests up to five alternatives and processes changes to the full suggestion list. Duplicate-attack ledgers still apply.

Speak setup now includes a pressure-free microphone check using the game's matcher; the browser transcript is separate from hit feedback. The check stops when leaving setup, changing options, hiding the tab, starting instructions, or starting a match. Type setup, Ready, tutorials, and composition feedback remind students to use an English keyboard and disable UniKey / Vietnamese input.

The fixes were reproduced and verified with deterministic transcript fixtures. UI behavior was checked in Microsoft Edge on macOS. Live microphone accuracy for the user's voice is not claimed; no remembered failing utterance was available, and provider recognition still needs real-speaker testing.
