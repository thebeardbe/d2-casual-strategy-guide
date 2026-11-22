# Finishing the map codex (Acts II-V)

Act I is done: 34 areas, chart, cards, example images, area levels, farming
notes, the interactive compass, and `docs/act1-checklist.md`. Acts II-V use
exactly the same pipeline; this file is the recipe so it does not have to be
rediscovered.

## Source video and chapter times

The Code to Navigate Every Diablo 2 Map, WithNoFiller,
`https://www.youtube.com/watch?v=J1EFUYGk4CA`, 44:00.

| Chapter | Start | Seconds |
|---|---|---|
| Intro | 0:00 | 0 |
| How to look at tiles | 1:56 | 116 |
| Categories: angular and random maps | 5:43 | 343 |
| Categories: fixed, fixed enough, alternating | 6:57 | 417 |
| Categories: outdoor maps | 8:08 | 488 |
| **Master list of every area** (the data spine) | **9:50** | 590 |
| Act I | 9:55 | 595 |
| Act II | 18:35 | 1115 |
| Act III: jungles | 24:22 | 1462 |
| Act III: Lower Kurast superchests and secrets | 28:52 | 1732 |
| Act III: finishing the act | 30:23 | 1823 |
| Act IV: easy maps | 33:01 | 1981 |
| Act IV: River of Flame | 33:56 | 2036 |
| Act IV: Chaos | 35:14 | 2114 |
| Act V: main storyline | 35:55 | 2155 |
| Act V: Nihlathak / Halls of Pain | 39:48 | 2388 |
| Act V: ubers maps | 41:18 | 2478 |
| Elite spawns | 42:01 | 2521 |
| Conclusion | 42:34 | 2554 |

These come from the video's own chapter list and were spot-checked against
frames: t=1118 shows Lut Gholein and t=1204 shows Rocky Waste, which is Act II.
Beware: a screenshot can carry a `t=` value that no longer matches the paused
frame, so always confirm a timestamp against the frame before trusting it.

Worth knowing for the Act I work already done: the Act I cards run 10:14 to 18:25,
and the Act II cards start at 18:38.

The act transition frames ("here is the flowchart for act two") show the chart
layout for each act: node positions, arrow directions, and which arrows are
necessary (blue) versus optional (tan). Grab those first; they decide the
`row`/`column` values and the connector list.

## The loop, per act

1. **Fetch the section**, then transcode once. Seeking VP9 is unreliable; H.264
   with 1s keyframes makes every later grab exact.
   ```bash
   yt-dlp -f "bv*[height<=1080]" --download-sections "*24:20-40:50" -o .extract/source-act2.mp4 "URL"
   ffmpeg -i .extract/source-act2.mp4 -c:v libx264 -preset ultrafast -crf 20 -g 25 -an .extract/act2-h264.mp4
   ```
2. **Find the cards.** Scan the title box at 1 fps, classify the dominant colour
   against the nine-entry palette, and every run of one colour is one card. This
   is how the Act I windows in `tools/cards.json` were produced.
3. **Extend `tools/cards.json`** with `{ id, cardType, window, force?, allowLow?, region? }`
   per area. Ids must match the area ids in the app data.
4. **Run the extractor**: `python3 tools/extract_cards.py .extract/act2-h264.mp4 --offset <section start>`.
   It picks the cleanest automap frame per card, checks the title colour against
   `cardType`, crops to the content box, trims the gameplay HUD, and writes
   `public/examples/<id>.webp` plus a report.
5. **Check the titles montage** (one image, 18 tiles) to confirm every window
   landed on the right card, then prune images nothing references.
6. **Read the panels** for Features / Entrance / Exit, and read the transcript for
   the navigation rules and caveats. Transcript examples worth keeping: "Tamoe
   never flies south-west", "red Fallen means dead end", "take the waypoint and
   walk back towards the bottom-left".
7. **Author the data**: `src/data/actN/<group>.ts` plus `index.ts` with the
   connector list. Keep each file under 400 lines; split by area group when it
   grows.
8. **Area levels** per area and difficulty, from
   `https://www.purediablo.com/diablo-2/diablo-2-area-levels` (it flags the D2R
   differences, e.g. Underground Passage L2 Hell 85 vs 83). Towns and the
   Forgotten Tower entry have no monsters and carry none. Anything at Hell 85
   gets the L85 chip automatically.
9. **Register the act** in `src/data/acts.ts` (the tab bar already shows all five;
   the ones without data are disabled).
10. **Regenerate the checklist** and review the act as a table before calling it
    done:
    ```bash
    npx esbuild tools/checklist.ts --bundle --format=cjs --platform=node --outfile=/tmp/c.cjs && node /tmp/c.cjs > docs/act1-checklist.md
    ```

## Data rules that came out of Act I

- Chart positions are `row` (0 top, 1 middle, 2 bottom) and fractional `column`
  (145-wide cells). Copy them off the act chart frame rather than eyeballing.
- Connectors are axis-aligned; `arrowBetween` tolerates columns within 0.15 cells
  and aligns the arrow to the target column. Do not place two areas on one cell.
- Necessary path blue, optional detours tan. The necessary chain must be a single
  path from the town to the act boss, and the area data tests assert it.
- `label` uses explicit `\n` line breaks, copied from the chart.
- Empty `features` or `exit` is legitimate: the video's cards sometimes list
  neither. Do not invent a "Dead end" to fill the space.
- Layout pictures only for `fixed`, `fixed-enough` and `alternating-fixed` maps,
  and for those, list the layouts in `variants`.
- Every area needs `videoTime` (seconds) so the card can link to the moment it is
  explained.

## Per-act notes to check when we get there

- **Act II**: Sewers and Halls of the Dead have several rules keyed to the
  waypoint; the Arcane Sanctuary is random but has the Summoner's direction
  trick; Tal Rasha's tomb choice is the big one. The palace is "fixed enough".
- **Act III**: the Skinny Rectangle class only appears here, and its colour was
  never sampled from the video. Sample it before writing the data, then add it to
  `src/data/mapTypes.json`.
- **Act IV**: River of Flame is split in the video into "before the waypoint" and
  "after the waypoint" with different types; Chaos Sanctuary is alternating
  fixed. Treat those as separate rows like the master list does.
- **Act V**: Crystalline Passage, Glacial Trail and Ancient's Way each carry the
  full five-rule table (entrance/waypoint to next level/dungeon), and the ubers
  maps (Matron's Den, Forgotten Sands, Furnace of Pain, Uber Tristram) are in the
  same act.
- Nihlathak's temple levels change with the portal layout; the Halls of Vaught is
  alternating fixed.

## Definition of done per act

- Every area in the master list exists as a node with the right type colour.
- The chart matches the video's act frame: order, arrows, necessary versus
  optional.
- Every card opens, shows type/features/entrance/exit/waypoint/area levels, and
  links to its moment in the video.
- Pictures exist for every fixed-shaped area, variants listed.
- `docs/act-checklist.md` regenerated and read through once.
- `npm run test`, `typecheck`, `lint`, `build` clean.
