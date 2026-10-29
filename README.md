# Inkfang · Hold the Inklands

A portrait English-learning survival game with Type and Speak controls, compact touchscreen keyboards, and original supernatural monsters. No build step, dependency installation, paid API key, or database is required. Serve `dist/` over HTTPS for classroom use. See [DEPLOY.md](DEPLOY.md) for GitHub Pages, static hosting and embedding.

## Quick start

The Play button is immediately visible above the choices. Controls, practice target, pace and run length sit on one screen. Extra settings and instructions are optional; there is no forced wizard, Ready page, or first-run tutorial gate. Choices are remembered in this browser. The default is Type / Numbers / Steady / Endless, with music and effects on. This release applies that profile once; later choices are remembered. Reset to default settings restores it at any time. All choices use visible buttons, without dropdown menus. Music starts after the Play action and can be muted under Audio.

Choose 2 minutes, 5 minutes, or Endless. Type number words as digits; letters and IPA remain Speak-only. A short Ready / Go transition leads directly into play. Physical keyboards work anywhere inside the active game tab, including after clicking the arena or a skill; there is no need to keep the answer box focused. Text fields in settings retain normal editing. On phones, compact game keys work directly; selecting the device keyboard requires tapping the answer box to open it. Touchscreens default to two-row number keys, three-row letter keys, or letters plus a digit row for Mixed. The device keyboard remains selectable. Device / physical keyboard users should select English and turn off UniKey or Vietnamese input.

## Monsters and progression

Every monster carries its own sign: the target box sits on the monster's body, gripped by two paws, and the monster's position is anchored to that box. A slow boss's target is therefore readable the moment it enters the arena instead of trailing far above it.

| Monster | HP | Relative movement | Behaviour |
| --- | ---: | ---: | --- |
| Ghost | 1 | 1× | First enemies; one complete answer defeats one. |
| Bat | 1 | 1.5× | Fast tier from wave 2. Flies a winding path and swerves into the free lane to pass slower monsters. |
| Stone Golem | 3 | 0.62× | Slow armoured tier from wave 3; each correct hit reveals a fresh question. |
| Vampire | 2 | 1.05× → 1.52× | From wave 4. Weaves sideways and flees faster once wounded. |
| Life Spirit | 1 | 0.8× | Occasional heart carrier from wave 2; grants one heart on defeat. |
| Ember Sprite | 1 | 0.5× → 1.8× | From wave 5. Starts slowly and accelerates as it falls. |

Four bosses rotate, one every fourth wave, each with its own theme music. After a full rotation each boss returns with two more HP.

| Boss | HP | Relative movement | Twist |
| --- | ---: | ---: | --- |
| The Ink Colossus | 12 | 0.22× | Slow stone titan. |
| The Night Harpy | 7 | 0.5× | A quick boss on a winding path: fewer answers, less time. |
| The Bone Weaver | 10 | 0.28× → 0.45× | Scuttles faster once down to three HP. |
| The Deep Kraken | 15 | 0.2× | Ordinary monsters arrive 25% faster while it lives. |

Players start with **two hearts**, with a maximum of five. Every escaped monster costs one. A Life Spirit defeated by a spell can also grant a heart. Bosses live on their own centre layer behind the swarm: they never hold up ordinary monsters and never block spawning. Within a lane, ordinary monsters keep a readable gap; a clearly faster monster (at least 15% faster than the one in front) swerves into the other lane when it is free, at most once every two seconds. New arrivals prefer the lane whose nearest monster will not slow them down.

On a short arena (under 520 px tall, typically a phone with browser bars showing) monsters receive up to 35% more travel time, so reaction room matches a tall screen. The HUD and footer also switch to a compact layout on short viewports, monsters and prompts are drawn smaller on phones, the boss sign is narrower, and the finish line sits lower so the run is longer, and the page can be added to the Home Screen (iOS: Share → Add to Home Screen; Android: Install app) to run without browser bars; `manifest.webmanifest` and the PNG icons support this.

The swarm grows with the waves: the active cap is 2 + wave (three monsters in wave 1), never above the pace's own cap; Speak mode keeps its fixed small caps. Winding fliers drift sideways by up to 11% of the arena width around their lane.

**Orbs.** From wave 2, an ordinary monster defeated by an answer has a 9% chance to drop a Frost Orb and a 7% chance to drop an Ember Orb. The orb falls to the hero and triggers on arrival: Frost halves the swarm's movement and arrival rate for five seconds (stacking with Slowfield by taking the stronger slow); Ember burns every monster on the field three times, one HP every 1.5 seconds, bosses included. Burn kills score points but, like spell kills, do not charge mana or drop orbs. Bosses never drop orbs.

**Scenes.** Each match picks one of five backdrops (graveyard, forest, library, harbour, cavern), never the same as the previous match.

Waves last 20 seconds. With question progression enabled, levels 1, 2 and 3 unlock at 0, 40 and 80 seconds, within the selected number / word ceiling. Harder unlocked questions are favoured while some easier ones remain. Progression can be disabled in Fine-tune. Multi-hit enemies keep their body and position, reset partial letter marks, lose HP and reveal a different prompt after every surviving hit. If a tiny custom pool has no unused prompt, a different prompt already on another monster can be reused; add more words for variety.

## Mana and skills

Each **answer-earned kill** adds one mana, up to ten. Partial answers and non-lethal hits do not add mana. Spell kills score points and can drop hearts, but do not recharge mana. This prevents self-recharging wipe loops.

| Skill | Cost | Effect |
| --- | ---: | --- |
| Slowfield | 3 | Movement and arrivals slow to 45% for 7 seconds. |
| Frostlock | 4 | Movement and arrivals freeze for 4 seconds. The match clock continues. |
| Twin Strike | 5 | The next four completed answers deal two HP each. Misses do not consume a charge. |
| Chain Lightning | 6 | The next four completed answers also deal one HP to one nearby monster. No recursive chaining. |
| Inkstorm | 10 | Defeats ordinary visible monsters, removes half of a boss's HP, and gives a 1.5-second arrival breather. Space is a physical-keyboard shortcut when fully charged. |

Twin Strike and Chain Lightning can coexist if enough mana is earned. Secondary lightning kills count as answer-earned kills. Charging the primary answer cannot jump to a newly spawned replacement: neighbours are selected before damage. Powered hits can reduce the number of answers needed against a boss. Skills cannot be recast while their existing timed effect / charges remain active. Pause hides skill controls and the game keyboard to leave room for pause / audio controls. Skill timers also pause during browser focus loss or microphone reconnection.

## Music that escalates with the swarm

Four original synthesized swarm tracks (*Lantern Walk*, *Ink March*, *Ghost Carnival*, *Thunder Run*) and four boss themes are generated locally; no audio files or licensed recordings are downloaded. Each track has its own instruments and groove. A match starts on a different track from the previous match, and the track moves on every two waves, so the first minute already sounds different from the last run. Track changes land on the next bar with a short riser. When a boss enters, its own theme takes over (*Stone March*, *Night Wings*, *Web of Bones*, *Deep Current*) after a drum sting, and the swarm track returns when it is defeated. Tempo follows the actual monster travel speed, including mode and wave acceleration, plus 3 BPM per wave, within 66–176 BPM.

Music and effects have separate toggles, plus a music volume control in Pause. Music starts only after a user action, pauses with play and strongly ducks in Speak mode. Headphones or muting music may further improve microphone recognition.
## Interface language

The first visit asks for English or Vietnamese; the choice is stored in this browser and can be changed any time with the button beside Play. The language applies to instructions and settings only (setup page, guide captions, help, pause and results screens). Monster prompts, answers, in-game feedback and the Question bank stay in English, because the game practises English. Translations live in `lang.js`.

## Question bank and personal lists

The built-in bank has 1,237 targets: 1,001 integers from 0 to 1000, 26 letter names, 90 vocabulary clues, 90 names / places and 30 whole-word British English IPA cards. JSON and CSV are included in `dist/` and exportable from Question bank.

Answers use a curated bank and explicitly listed alternatives, **not AI semantic grading**. For example, the broad fish clue accepts SHARK, SALMON, TUNA, TROUT and GOLDFISH as well as FISH. Other entries include common synonyms and UK / US variants. Unlisted answers are not automatically judged, so teachers can add alternatives for their own clues. Exact canonical answers take priority when two active targets share an alternative.

Click **+ My lists** and paste up to 500 lines:

```text
PARIS
LIBRARY | A place where you borrow books.
FISH | An animal that swims and has fins. | shark, salmon, tuna
ice cream
```

Plain words become spelling targets. Optional clues create vocabulary targets; the third column lists accepted alternatives separated by commas or semicolons. Tabs can replace pipes. English words / answers are normalised to 1–24 letters, ignoring spaces, apostrophes and hyphens. Invalid lines are reported before the list is saved. Save & use selects the list for the next run; at least two eligible targets are needed. Fine-tune can mix the saved words back into the built-in bank. JSON import / export preserves alternatives. You can also paste a JSON array (or an object with a `questions` array), including a chatbot's fenced JSON response. Vocabulary uses `mode: "vocabulary"`, names use `mode: "spelling"`, and numbers use `mode: "numbers"`. Number answers must be whole-number digit strings from 0 to 1000; number-word prompts are generated by the game so they remain consistent. A personal numbers run uses the saved numbers rather than the built-in range.

Open **Generate a JSON list with your own chatbot**, select Vocabulary, Names & places, or Numbers, and copy the ready-made prompt. Replace its topic, learner-level and count placeholders in your own chatbot, then paste the returned JSON into the game and review it. No chatbot is contacted by Inkfang. Reusable prompts are also included in `examples/chatbot-prompts.md`. Use **My lists** export in Question bank to move saved questions to another browser.

Custom questions, settings, scores and guide history stay in local browser storage, with no student accounts or shared reporting. Export custom questions before moving to another domain or browser. Paste lists are not sent to a server.

## Speech and answer handling

The browser's SpeechRecognition / webkitSpeechRecognition service supplies transcripts. A microphone check before play shows the raw browser transcript separately from hit feedback. No audio is recorded or stored by Inkfang; the provider may process audio online. This is recognized-word practice, not a validated pronunciation assessment.

Stable interim speech can fire without waiting for a sentence-final result. The matcher parses several complete answers from one transcript, keeps compound / comma-formatted numbers atomic, recognises a small explicit number-homophone set, evaluates up to five alternatives, and guards against repeated interim / final attacks. Explicit uppercase acronym expansion is limited to letter practice. Question revisions are checked when a spoken batch targets multi-hit monsters, so an earlier answer cannot attack a replacement prompt. Actual recognition speed and accuracy still depend on the browser service, connection, speaker and environment.

Voice mode retains slower travel, fewer targets, a 1.4-second grace at the danger line, and frozen movement / match time during microphone reconnection. A cleared voice swarm waits briefly before another arrival. Unmatched typed entries clear after **0.8 seconds of inactivity**, measured from the last edit. Valid prefixes of a live answer remain, so “9” is protected when “98” is approaching. Each edit restarts the timer; pausing cancels it. Type uses immediate complete answers, a 160 ms guard for active answer prefixes, and protected input-method composition. Partial character matches can chip one HP; each matching position is counted once per question.

## Editing and verification

Edit `dist/` directly. Core modules: `engine.js` (battle / matching / powers), `content.js` (pools / alternatives), `personal.js` (list validation / chatbot prompt templates), `choices.js` / `choices.css` (button choices and defaults), `typing.js` (idle reset / physical-key routing), `speech.js` (recognition lifecycle), `keyboard.js` (touch input), `audio.js` (original synthesized adaptive score), `app.js` (UI / lifecycle), and the guide modules. Script / stylesheet URLs are release-versioned to prevent stale mixed versions after deployment.

Run:

```sh
node --test tests/*.test.cjs
```

Automated checks cover typing / speech matching, compound numbers, partial and multi-hit damage, stale question revisions, monster unlocks, boss scheduling / HP, heart limits, all five skills, mana costs, no recursive lightning, timed effects, progressive questions, personal-list validation, aliases, quick-start structure, audio and compact keyboards. Browser QA uses the real UI plus a separately hosted, clearly labelled local fixture for boss / skill states; that fixture is excluded from the release. Physical iPhone / iPad / Android tapping ergonomics, long-term difficulty balance, and live speech accuracy still need real-device classroom testing.

The included `scripts/package-release.py OUTPUT_DIRECTORY` creates a complete GitHub deployment kit and a static-files-only ZIP using an explicit allowlist. Site identities, credentials, Git history and local test fixtures are excluded. The GitHub Actions workflow is prepared; publishing to your own repository is a separate step from the ChatGPT-hosted Site.
