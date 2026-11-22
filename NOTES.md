# Notes: deferred work and open questions

## Acts III to V

Acts I and II are complete. Acts III to V need the same treatment:

1. Add `src/data/act3/`, `act4/`, `act5/` with areas and connectors, and register
   them in `src/data/acts.ts`. The master list in the video (09:50) already gives
   the map type and the per-entrance notes for every area in every act.
2. Extend `tools/cards.json` with the per-act windows and download the matching
   video section per act. Every card now carries an `act` field and the extractor
   takes `--act N`, because one video section only holds one act: without the
   filter the scan range spans cards that are not in the file and every window
   lands on the wrong frame. The chapter times, verified against frames, are in
   `references/planning/map-codex-roadmap.md`: Act III 24:22, Act IV 33:01,
   Act V 35:55.
3. Add the Skinny Rectangle colour to `src/data/mapTypes.json`. It is one of the
   ten classes in the video's legend and only appears in Act III, so its colour
   has not been sampled yet. Until it is, `mapTypeColor` logs a warning and falls
   back to grey.

## Act III: areas built, pictures pending

Act III's 28 areas, chart and connectors are in. The layout is committed to
`references/planning/act3-layout.md`: columns snapped to whole cells so every
arrow renders, which moves Great Marsh into the middle row and puts the two "?"
connector tiles into the notes instead of the chart.

Still missing, on purpose:

- **No example images.** The card windows for Act III have not been scanned yet, so
  no `example` is set on any Act III area. A skipped test in
  `src/data/acts.test.ts` marks the gap. Next pass: title-box scan at 1 fps, add
  `"act": 3` cards, run `tools/extract_cards.py .extract/act3-h264.mp4 --offset 1455 --act 3`.
- Kurast Sewers sit off Disused Fane in the chart because the model needs
  axis-aligned arrows; in the game they are entered from Kurast Bazaar and Upper
  Kurast, which the notes say.
- Area levels use the Resurrected values, so the temples, the sewers, the Swampy
  Pit levels and the Arachnid Lair carry the L85 chip.

## Act III measurement notes

The expensive preparation is done and the findings are here so none of it is
repeated:

- Section fetched to `.extract/source-act3.mp4` (24:15-33:05) and transcoded to
  `.extract/act3-h264.mp4` at 1080p with 1s keyframes (531 MB, gitignored).
- The Act III chart frame is at **24:27** (12s into that section); extract it with
  `-ss 12`. It is the source for node positions and the necessary/optional arrows.
- **Skinny Rectangle colour sampled: `#7b8900`** (olive), now in
  `src/data/mapTypes.json`. The three Skinny Rectangle nodes are Spider Forest,
  Great Marsh and Flayer Jungle.
- The chart is four rows, not three, and has a **connector tile drawn as "?"**
  between Spider Forest and Flayer Jungle: the jungle maps are linked through that
  junction rather than in a simple row. The rows interleave (Arachnid Lair and
  Great Marsh sit above Spider Forest; the Swampy Pit and Flayer Dungeon chains
  hang off it), so the layout needs measuring from the frame rather than copying
  Act II's grid.
- Twenty-nine areas, from the master list: Kurast Docks, Spider Forest, Spider
  Cavern, Arachnid Lair, Great Marsh, Flayer Jungle, Swampy Pit 1-3, Flayer
  Dungeon 1-3, Lower Kurast, Kurast Bazaar, Ruined Temple, Disused Fane, Sewers 1-2,
  Upper Kurast, Forgotten Temple, Forgotten Reliquary, Kurast Causeway, Disused
  Reliquary, Ruined Fane, Travincal, Durance of Hate 1-3.
- Chapter times inside the act: jungles 24:22, Lower Kurast superchests 28:52,
  finishing 30:23. Act IV starts 33:01.

The chart has now been measured and the full node table (27 boxes, four rows,
measured fill colours, derived columns) is in
`references/planning/act3-layout.md`. It also records the two "?" connector tiles
and the three diagonal arrows that `arrowBetween` cannot draw, with the two
options for handling them (snap the columns, or teach the layout diagonal arrows).

Stopped before authoring the areas rather than guessing connectors: a chart that is
subtly wrong is worse than one that is obviously unfinished. Everything needed to
finish Act III without re-measuring is in that file.

## Act II notes

- The chart has five rows and the necessary path branches at Lut Gholein: the
  palace route to Duriel and the desert route for the staff pieces. The area tests
  assert a necessary DAG rooted at town, not a single chain.
- The video shows far fewer Act II cards than Act I (22 cards for 30 nodes). Harem
  L1, the three Palace Cellar levels and Claw Viper Temple L2 have no card at all,
  so they read from the transcript and the master list.
- Only two Act II cards produced usable pictures (`sewers-1`, `harem-2`). Lut
  Gholein, Canyon of the Magi and Tal Rasha's Chamber were captured from gameplay
  footage or from a frame that caught the act chart strip, so they show the
  written rule instead of a picture. Worth a second pass with hand-picked frames.
- Stony Tomb L1/L2 and Maggot Lair L3 are level 85 in Resurrected; Stony Tomb was
  78 in Lord of Destruction. The L85 chip follows the data.

## Example images that do not exist yet

`tools/extract-report.json` lists the current gaps under `missing`. As of this
commit they render the navigation-rule fallback and need a picture:

Rogue Encampment, Blood Moor, Cave L1, Burial Ground, Mausoleum & Crypt, Stony
Field, Tristram, Secret Cow Level, Underground Passage L1, Black Marsh, Hole L1,
Forgotten Tower, Tamoe Highland, Barracks, Inner Cloister, Catacombs L3.

Where a clean automap exists the pipeline now collects it; the rest are gameplay
footage in the source video. Options: a hand-picked frame from a different card,
or an isometric render from the Diablo wiki (`diablo-archive.fandom.com` has 61
area renders, CC-BY-SA, needs attribution and a note that the video itself credits
PhrozenDragon3 for the Outer Cloister renders).

Catacombs L3 was dropped deliberately: every frame in its window is either the
video's joke footage or gameplay. Dark Wood was dropped for the same reason.

## Interactive entrance helper

Idea from the owner: in the detail view, let the visitor drag the entrance arrow
to the direction their entrance tile is pointing, and have the app draw the exit
direction that the turn rule implies (counter-clockwise, clockwise or straight).
The data already carries what it needs: `NavigationRule.turn` plus
`NavigationRule.from`. `src/components/NavigationRule.tsx` renders a static
version of exactly this diagram.

## Known rough edges

- `public/examples/*.webp` are screenshots from the video, so a few still include
  the video's own "Example: (not the same every time)" caption and, in three
  cases, the game HUD. The crop pipeline trims obvious HUD orbs but cannot
  remove baked-in text without cutting map art.
- `underground-passage-2.webp` shows the Level 1 automap, because the video never
  shows Level 2 on its own card. Worth replacing when a better frame turns up.
- `pit-2` uses the `allowLow` override: the card is only two seconds long, so the
  title box never settles and the confidence check cannot pass.
- Act tabs for Acts II to V are disabled. That is intentional, so the structure of
  the site is visible before the data lands.
- `arrowBetween` assumes a visible gap between axis-aligned nodes. Two same-row
  areas closer together than one node width would draw an arrow that points the
  wrong way. No Act I pair is that close (the closest is 0.9 cells) and the data
  tests forbid two areas on the same grid cell, so this is a guard for future
  acts rather than a live bug.
