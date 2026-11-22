# Builds: data model, chooser, sources

## The build record

One build per file: `src/data/builds/<class>/<playstyle>.ts`. Every field that
states a fact carries a source reference, and the page renders them at the bottom
with video timestamps.

```ts
export interface Build {
  id: string                     // 'sorceress-lightning'
  class: ClassId                 // 'sorceress'
  playstyle: string              // 'Lightning'
  title: string                  // 'Lightning Sorceress'
  versions: VersionId[]          // ['lod', 'd2r'] or all three
  modes: ModeId[]                // ['sc'] or ['sc','hc']
  /** One line a new player can repeat to themselves. */
  summary: string

  /** What the chooser asks, and the answer that leads here. */
  chooser: { question: string; answer: string }[]

  /** Points by level, in the order the sources give them. */
  levelPlan: {
    from: number
    to: number
    points: { skill: string; n: number }[]
    why: string
  }[]

  statPlan: {
    strength: string
    dexterity: string
    vitality: string
    energy: string
    why: string
  }

  /** What to look for, stage by stage. */
  gearPlan: {
    stage: string                // 'Normal A1-A3', 'Nightmare', 'Hell'
    items: { slot: string; item: string; why: string; where?: string }[]
  }[]

  /** Runewords worth the farm, with the route to the runes. */
  runewords: {
    name: string
    runes: string[]              // ['Tal','Eth']
    base: string                 // '2 socket armor'
    why: string
    farm: { area: string; difficulty: string; note: string }
    sourceAt?: number            // seconds into the source video
  }[]

  /** Shopping, gambling, crafting: the small things people forget. */
  shopping: { item: string; when: string; where: string; why: string }[]

  /** Breakpoints and diminishing returns, including when to stop. */
  targets: {
    label: string                // 'Magic find', 'FCR', 'Resistances'
    goal: string                 // '~300%', '63%', '75 all'
    why: string
    stop?: string                // 'past 300 the gain is tiny'
  }[]

  /** Where to farm with this build; linked to the map codex. */
  farmSpots: { areaId: string; note: string }[]

  /** How hardcore changes this build. Rendered only in HC mode. */
  hardcore?: { title: string; detail: string }[]

  sources: Source[]              // required, at least one
}

export interface Source {
  label: string                  // 'MrLlamaSC — Lightning Sorceress, Normal'
  url: string
  at?: number                    // seconds; the moment the claim comes from
  kind: 'video' | 'written'
}
```

Anything the sources do not say gets `null` and renders as "the videos do not
cover this", never as a guess.

## The chooser: flowchart, with AI later as a translator

Decision: **build the deterministic tree now.**

Why not AI first:

- The catalogue is finite: roughly 20 builds across eight classes, all from
  videos we can cite. A two- or three-question tree reaches every one of them.
- Every path must land on a build that exists, and that is testable by walking the
  tree in a unit test. AI output has to be validated against the same closed set,
  so the tree is not throwaway work.
- A wrong AI answer leaves a new player on a page we do not have. A tree cannot
  do that.
- A public site with an LLM needs a server-side key, rate limits, cost control and
  abuse handling. That is not phase-one work.

Where AI earns a place later: free text ("a sorceress with fire and lightning,
like my daughter wants"), typos, unfamiliar wording, and combined intents
("ranged, cheap, safe on hardcore"). The shape is a thin endpoint that receives
the text plus the allowed build list and returns **one build id or null**, with
null falling back to the tree. Strict schema, no free-form prose, no inventing
builds.

A second, legitimate AI use is on the authoring side: run the transcript through
the prompt in
[transcript-extraction-prompt.md](transcript-extraction-prompt.md), then verify
every number against the timestamp before it ships. That attacks the real
bottleneck, which is content, not code.

### Tree sketch (Sorceress, from the videos that exist)

```
Q1 How do you want to kill things?
   blow up packs from range   -> Q2
   freeze and shatter         -> Blizzard Sorceress
   blink into a pack          -> Nova Sorceress
   cheapest, safest first run -> Lightning Sorceress
Q2 Which element?
   fire                       -> Hydra Sorceress (or Hydra/Frozen Orb)
   lightning                  -> Lightning Sorceress
   both, mixed                -> Fire/Lightning hybrid (composed, see below)
```

## Builds we can source (MrLlamaSC, checked 2026-11-22)

The channel is effectively the catalogue. Shapes:

- **Per-class condensed guides** (`HOW TO LEVEL A …`): Barbarian 13:59,
  Sorceress 12:26, Paladin 14:55, Amazon 18:41, Druid 10:48, Assassin 11:29.
  Plus `ULTIMATE LEVELING GUIDE` 46:04. These are the source for the
  point-by-level plan and the stat split.
- **Per-difficulty guided playthroughs** (`[Normal] …`, `[Nightmare] …`,
  `[Hell] …`), 1h20–2h40 each: the source for act-by-act gear, shopping, farm
  stops, with timestamps.
- **Hardcore variants** (`[Normal] HARDCORE …`): the source for `hardcore[]`.
- **Class overviews** (`The Sorceress`, 14:22): the one-paragraph class intro.
- **Reign of the Warlock**: Demon Warlock, Echoing Strike Warlock, Magic Abyss
  Warlock, plus a 6:31 Warlock leveling guide. D2R only.

Observed per class:

| Class | Builds seen | Difficulty coverage | HC variant seen |
|---|---|---|---|
| Sorceress | Lightning, Blizzard, Nova, Hydra, Hydra/Orb | Normal, Nightmare, Hell | Hydra/Orb |
| Paladin | Hammerdin, Fist of the Heavens, Zealot | Normal (more likely to exist) | FOH, Zealot |
| Druid | Fury (werewolf), Elemental, Summoner | Normal | Fury, Elemental, Summon |
| Assassin | Traps | Normal | — |
| Barbarian | leveling series (Normal/Hell) | partial | — |
| Amazon | leveling guide | partial | — |
| Necromancer | leveling guide | partial | — |
| Warlock (D2R/RotW) | Demon, Echoing Strike, Magic Abyss | partial | — |

Before writing a build page, confirm the videos exist for the difficulties we
promise, and record their ids, not just titles.

## Composition builds

Some requests do not map to one video: "a sorceress with fire and lightning" is
not a MrLlamaSC build. Those become **composition builds**: assembled from the
Fire and Nova material, with a source per section, and a visible line saying it is
composed rather than lifted from one video. The fire/lightning hybrid is the first
one.

## Sourcing rules

1. Every page ends with its sources: label, link, and timestamp where it is a
   video.
2. Every number in `levelPlan`, `statPlan`, `targets`, `runewords` and `shopping`
   points at the source and timestamp it came from.
3. If the videos disagree with a written source, say so on the page rather than
   silently picking one.
4. If a number is version-dependent (PD2 breakpoints, Warlock-only skills), it is
   version-tagged or marked "check in game".
5. PD2 has no MrLlamaSC coverage. PD2 notes come from PD2 sources and are
   sparse by design; the page says so instead of presenting D2R numbers as PD2's.
6. A build with no source does not ship.
