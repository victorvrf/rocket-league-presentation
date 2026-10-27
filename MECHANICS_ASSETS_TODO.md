# Assets status

## How to run
From this folder: `python3 -m http.server 8080`, then open http://localhost:8080 in Chrome or Edge (F = fullscreen). Everything is local: Reveal.js and the fonts are in `vendor/`. No internet is needed. Arrow keys, Space, Home/End and the timeline at the bottom all navigate.

## Video and image assets
This redesign uses **no video and no photo files**. Every mechanic is drawn as SVG/CSS, so nothing can break or look unfinished.

**Video infrastructure is prepared, but the footage was intentionally NOT added yet.** The project already contains the empty folder `assets/videos/`, the single config file `videos-config.js` (9 optional clips on slides 3–6) and `replay.js`. A clip appears (press →) only when its file exists; otherwise the slides are unchanged. Step-by-step instructions in Portuguese: `HOW_TO_ADD_GAMEPLAY_VIDEOS.md`.

| Item | Status |
|---|---|
| `assets/videos/*.mp4` and `assets/images/*.webp` from the old project | **Not present** in the files I received, so I could not inspect them. Not used. |
| Gameplay clips for the 9 mechanics listed in `videos-config.js` | **Intentionally not added yet.** Optional: the diagrams already work alone. Add clips later, following `HOW_TO_ADD_GAMEPLAY_VIDEOS.md`. Only use footage that clearly shows the named mechanic. |

## Not verified
- The diagrams are simplified illustrations, not physics simulations, and show no speeds or numbers.
- Only the flip reset (three or more wheels), the musty flick and the speed flip were checked against sources. Half-flip, wave dash, air dribble, ceiling shot and pinches are from general knowledge. Please watch one example of each so you can answer questions.
- The timing-window dots on slide 7 are illustrative, not data.

## Old files
The previous version is kept untouched in `legacy-reference/`. You can delete that folder.

## Video system — what was and was not tested
- Tested (Chromium, temporary .webm test clips in a copy outside this folder): replay opens with →, closes with ← / Esc / on-screen arrows, steps through several clips, is muted, pauses and unloads on close or slide change, a corrupt file is dropped silently, counters and progress stay correct, no console errors.
- Tested with no videos at all: all slides, navigation, animations and counters work, no console errors, no failed requests.
- **Not tested:** real `.mp4` (H.264) playback, because the test browser lacks that codec. Chrome/Edge normally play it. Check once with your first real clip.
