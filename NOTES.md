# Notes: deferred work and open questions

## Acts II to V

Act I is complete. Acts II to V need the same treatment:

1. Add `src/data/act2/` with the areas and connectors, register it in
   `src/data/acts.ts`. The master list in the video (09:50) already gives the map
   type and the per-entrance notes for every area in every act.
2. Extend `tools/cards.json` with the per-act windows and download the matching
   video section per act. The chapter times, verified against frames, are in
   `references/planning/map-codex-roadmap.md`: Act II 18:35, Act III 24:22,
   Act IV 33:01, Act V 35:55.
3. Add the Skinny Rectangle colour to `src/data/mapTypes.json`. It is one of the
   ten classes in the video's legend and only appears in Act III, so its colour
   has not been sampled yet. Until it is, `mapTypeColor` logs a warning and falls
   back to grey.

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
