# Planning notes

Working notes for turning this map tool into a guide. Nothing here is shipped
code; it is the agreed direction, the reasoning behind it, and the open
questions, kept so a later session can pick it up without re-deriving it.

| File | What it holds |
|---|---|
| [site-vision-and-ia.md](site-vision-and-ia.md) | The name, the four destinations, version and hardcore switching, tone, and what we deliberately leave out |
| [builds-data-model.md](builds-data-model.md) | The build schema, the chooser analysis (flowchart vs AI), the MrLlamaSC catalogue we can source from, and the sourcing rules |
| [transcript-extraction-prompt.md](transcript-extraction-prompt.md) | Copy-paste prompt for another AI to turn a video transcript into our build format |
| [map-codex-roadmap.md](map-codex-roadmap.md) | How Acts II-V get finished: video timestamps, the card-discovery loop, data and image work, area levels |

Order of work agreed on 2026-11-22: **finish the map codex (Acts II-V) first**,
then the guide shell, Basics, the pilot build, and the rest. These notes exist so
that pause does not lose anything.

## Facts worth not rediscovering

- The source video for the maps is "The Code to Navigate Every Diablo 2 Map" by
  WithNoFiller (`https://www.youtube.com/watch?v=J1EFUYGk4CA`). Its chapter
  times are in `map-codex-roadmap.md`.
- The "souls dance" magic find easter egg is real and documented, not a myth:
  four Will-o'-wisps (Gloam, Burning Soul or Black Soul) left alone until they
  draw seven letters; each grants magic find, up to +4,200% in Hell for 19.2
  hours. Covered by PC Gamer (2026-03-06) and D2Runewizard (2026-10-23). The
  ghosts spawn in Great Marsh, Plains of Despair and Worldstone Keep Level 2, so
  it ties into the map codex. Treat the exact numbers as reported by those
  sources, not as our own measurement.
- Reign of the Warlock (RotW) is the current D2R expansion and adds the Warlock
  class. It is D2R-only: neither LoD nor PD2 has it, so the class list has to be
  version-gated.
- `references/*.html` (the DeepSeek files) are **style references only**. They are
  AI-written and are never cited as sources.
