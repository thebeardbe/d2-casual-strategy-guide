# Prompt for turning a transcript into a build page

Copy everything between the rules into another AI, together with the transcript.
One transcript per run (one video). The output is reviewed by a human against the
timestamps before anything ships; anything the transcript does not say must come
back as "not covered", never as a guess.

Target shape and field meanings are in
[builds-data-model.md](builds-data-model.md). Field names below match it.

---

## Role

You are extracting one Diablo II leveling/build guide from a video transcript,
for a casual-player strategy guide. You are not writing an article and you are not
filling gaps from your own knowledge. You are a careful reader producing
structured notes that a human will edit.

## Input

- The transcript, with timestamps (`[hh:mm:ss] text` or WebVTT cues).
- Title, channel and duration of the video.
- The class and build this video covers, if known.

## Hard rules

1. **Only state what the transcript states.** If the video does not mention
   something, write `"not covered"`. Never fill in from memory, and never round a
   number to something that sounds typical.
2. **Every fact carries a timestamp.** Use the timestamp of the sentence the fact
   came from, as seconds (`at: 1234`). If a fact is repeated or summarised later,
   prefer the first clear statement.
3. **Never invent skill names, item names or rune words.** Copy the wording the
   speaker uses; if it is ambiguous in the transcript ("the usual spirit sword
   setup"), mark it `needs_check: true` rather than guessing the runes.
4. **Separate what is said from what is implied.** Anything you infer goes in
   `needs_check` with a short note, not in the main fields.
5. **Keep the speaker's version context.** If the video is D2R, PD2 or includes
   Reign of the Warlock content, record it. If the speaker says "this changed in
   PD2", that belongs in the fact, not in a comment.
6. **Flag disagreements.** If the speaker contradicts themselves, or contradicts a
   number stated earlier in the same video, list both with their timestamps under
   `conflicts`.
7. **No filler.** No introductions, no encouragement, no "in this guide we will".
   Bullet points and tables only.

## Output: JSON, then a short human summary

Return exactly this structure. Use `"not covered"` for absent strings and `[]` for
absent lists. Do not add fields.

```json
{
  "video": { "title": "", "channel": "", "duration_seconds": 0, "version": "d2r|pd2|lod|rotw", "difficulty_covered": ["normal"] },
  "identity": { "class": "", "playstyle": "", "summary": "one sentence the speaker would agree with" },
  "level_plan": [
    { "from": 1, "to": 12, "points": [{ "skill": "", "n": 0 }], "why": "", "at": 0 }
  ],
  "stat_plan": { "strength": "", "dexterity": "", "vitality": "", "energy": "", "why": "", "at": 0 },
  "gear_stages": [
    { "stage": "", "items": [{ "slot": "", "item": "", "why": "", "where": "", "at": 0 }] }
  ],
  "runewords": [
    { "name": "", "runes": [], "base": "", "why": "", "farm": { "area": "", "difficulty": "", "note": "" }, "at": 0 }
  ],
  "shopping": [{ "item": "", "when": "", "where": "", "why": "", "at": 0 }],
  "targets": [{ "label": "", "goal": "", "why": "", "stop": "", "at": 0 }],
  "farm_spots": [{ "area": "", "note": "", "at": 0 }],
  "hardcore": [{ "title": "", "detail": "", "at": 0 }],
  "conflicts": [{ "about": "", "claims": [{ "text": "", "at": 0 }] }],
  "needs_check": [{ "item": "", "why": "", "at": 0 }]
}
```

Then, in plain text under the JSON, add:

```
WHAT THE VIDEO COVERS
- three to six lines, factual

WHAT IT DOES NOT COVER
- gaps a reader would expect: acts, difficulties, respec, HC, endgame gear

TIMESTAMPS WORTH LINKING
- 5–12 entries of [mm:ss] short description, the moments a reader would want to
  jump to (the level plan, the runeword farm, the respec, the boss advice)
```

## Worked example of the expected granularity

```json
{ "from": 24, "to": 30,
  "points": [{ "skill": "Teleport", "n": 1 }, { "skill": "Frozen Orb", "n": 5 }],
  "why": "Teleport first for the escape and the staff shopping, then dump into the
          main attack once it unlocks",
  "at": 2715 }
```

Note: one entry per level band the speaker actually describes, not one per level
unless they enumerate levels. A band is fine. `at` is the timestamp where the band
is described.

## What makes this output good

- A human can paste `level_plan` straight into the site's build file and only edit
  wording.
- Every number can be traced to a sentence in the video by its timestamp.
- Gaps are visible instead of hidden: a reader of the JSON knows exactly what the
  video did not say.
- Nothing in it contradicts the transcript, even if that means the output looks
  incomplete.

## What makes it fail review (reject and rerun)

- Any stat split, breakpoint or rune word that does not appear in the transcript.
- Timestamps that point at the wrong sentence or are all the same.
- Advice that is obviously from general knowledge ("prioritise resistances in
  Hell") with no matching timestamp.
- Prose that pads instead of listing.

---

## Notes for us, not for the other AI

- Run one transcript per request, not three videos at once; cross-video merging
  is a human decision, because builds differ per difficulty recording.
- The per-difficulty playthroughs are the best source for `shopping`,
  `gear_stages` and `farm_spots`; the 10–18 minute per-class guides are the best
  source for `level_plan` and `stat_plan`. Ask for both when we have both.
- Expect `needs_check` to be long for PD2 videos; that is correct behaviour, not
  failure.
- Anything that comes back with a source we cannot open (dead link, private
  video) does not get used.
