# Act III layout: measured from the chart frame

Measured 2026-11-22 from the video's Act III chart frame: **24:27**, i.e. 12s into
`.extract/source-act3.mp4` (section 24:15-33:05). Extract it with:

```bash
npx ffmpeg -ss 12 -i .extract/act3-h264.mp4 -frames:v 1 /tmp/a3full.png   # or via nix shell
```

Method: flood-fill the chart region (x >= 440, y <= 360) for saturated pixels,
excluding the arrow colours (cyan `#1fa8d8`, tan `#e8c69f`, white, `#00bbff`).
That found 27 components; two pairs of touching boxes merged and were split by
hand. Cell pitch is about 103 px at 1920 width, node boxes 111x78.

## Node table

Columns are `(x - 500) / 103`, rows 0-3 (top to bottom). Colours are the measured
fill, which confirms the class against the master list.

| Row | Col | Area | Fill | Class |
|---|---|---|---|---|
| 0 | 1.04 | Arachnid Lair | `#ff0506` | Fixed Enough |
| 0 | 1.94 | Great Marsh | `#7b8900` | Skinny Rectangle |
| 0 | 2.84 | Flayer Dungeon L1 | `#003000` | Counter-Clockwise |
| 0 | 3.88 | Flayer Dungeon L2 | `#003000` | Counter-Clockwise |
| 0 | 4.88 | Flayer Dungeon L3 | `#79007c` | Alternating Fixed |
| 0 | 5.83 | Ruined Temple | `#79007c` | Alternating Fixed |
| 0 | 7.70 | Forgotten Temple | `#79007c` | Alternating Fixed |
| 0 | 8.83 | Disused Reliquary | `#79007c` | Alternating Fixed |
| 1 | 0.00 | Kurast Docks (Town) | `#910000` | Fixed |
| 1 | 1.00 | Spider Forest | `#7b8900` | Skinny Rectangle |
| 1 | 3.23 | Flayer Jungle | `#7b8900` | Skinny Rectangle |
| 1 | 5.50 | Lower Kurast | `#f07000` | Big Square |
| 1 | 6.53 | Kurast Bazaar | `#f07000` | Big Square |
| 1 | 7.70 | Upper Kurast | `#f07000` | Big Square |
| 1 | 8.90 | Kurast Causeway | `#910000` | Fixed |
| 1 | 9.97 | Travincal | `#910000` | Fixed |
| 1 | 11.26 | Durance of Hate L1 | `#003000` | Counter-Clockwise |
| 2 | 1.00 | Spider Cavern | `#ff0506` | Fixed Enough |
| 2 | 3.11 | Swampy Pit L1 | `#003000` | Counter-Clockwise |
| 2 | 4.08 | Swampy Pit L2 | `#003000` | Counter-Clockwise |
| 2 | 5.05 | Swampy Pit L3 | `#79007c` | Alternating Fixed |
| 2 | 6.02 | Disused Fane | `#79007c` | Alternating Fixed |
| 2 | 7.06 | Sewers L1 | `#ff0506` | Fixed Enough |
| 2 | 7.70 | Forgotten Reliquary | `#79007c` | Alternating Fixed |
| 2 | 8.90 | Ruined Fane | `#79007c` | Alternating Fixed |
| 2 | 11.26 | Durance of Hate L2 | `#003000` | Counter-Clockwise |
| 3 | 7.06 | Sewers L2 | `#910000` | Fixed |
| 3 | 11.26 | Durance of Hate L3 | `#910000` | Fixed |

That is 27 areas plus a 28th to confirm: the master list has **29 Act III entries**
(Kurast Docks through Durance of Hate L3). Count the table against it when
authoring; the chart has 27 boxes plus two connector tiles.

## The two "?" tiles

The chart draws two junctions as literal **"?"** boxes, and they are the reason
the jungle route is not a row:

1. Between Spider Forest and Flayer Jungle (row 1, around col 2.1).
2. Between Great Marsh and Flayer Dungeon L1 (row 0/1 boundary, around col 2.9).

They represent random connector tiles in the jungles, not areas, so they get no
node. In the data, connect Spider Forest to Flayer Jungle directly and hang Great
Marsh off that junction, with a note that the connecting tile is random.

## The problem to solve before authoring

Three arrows in the source are diagonal, and `arrowBetween` only draws
axis-aligned arrows (it warns and drops others):

- Flayer Jungle (1, 3.23) up to Flayer Dungeon L1 (0, 2.84).
- Spider Forest (1, 1.00) up to the "?" junction feeding Great Marsh (0, 1.94).
- Swampy Pit L1 (2, 3.11) vs Flayer Jungle (1, 3.23): 0.12 apart, inside the
  0.15 tolerance, so that one is fine.

Two ways out, and this is a design decision rather than a transcription task:

1. **Snap the columns** so connected pairs share a column (move Flayer Dungeon L1
   to 3.23, Great Marsh to 1.00 or make it an optional neighbour of Flayer
   Jungle). The chart stays readable and every arrow renders; it deviates from the
   source by a fraction of a cell.
2. **Extend the layout model** to allow diagonal arrows, which means new arrow
   geometry and new tests.

Option 1 is in keeping with Act I and II (paired columns already differ by up to
0.08) and needs no new code.

## Remaining work for Act III

1. Decide the column snapping above.
2. Card windows: scan the title box at 1 fps over the section (the pattern in
   `.scratch/tl_names.py`), then extend `tools/cards.json` with `"act": 3` and run
   `tools/extract_cards.py .extract/act3-h264.mp4 --offset 1455 --act 3`.
3. Read the panels for Features / Entrance / Exit, and the transcript (Act III
   starts at 24:22 in the video, `act three gets really strange` at 24:32) for the
   jungle rules: head north-east, the swampy pit and flayer dungeon chains, and
   the Lower Kurast superchest runs.
4. Author `src/data/act3/` (town, jungle, kurast, durance), the connectors, and
   register the act.
5. Area levels from the PureDiablo table (Act III rows start at Spider Forest
   21/49/79). The D2R row-85 upgrades there are Spider Cave, Swampy Pit L1-L3,
   Sewers L1 and Ruined Temple/Disused Fane/Reliquary and Forgotten Temple/Fane.
6. Regenerate the checklist, run the gates, commit.
