# Site vision and information architecture

Agreed 2026-11-22.

## Name

**Diablo II Casual Player Strategy Guide** — the full title in the header, with a
subtitle covering the three games: *for LoD, PD2 and D2R*. The name nods at the
physical strategy guides of the late 90s: it says what it is, it does not pretend
to be official, and it does not promise completeness.

## Who it is for

A new or intermediate player who wants an answer quickly: what to press, where to
go, where to put the points, what to pick up. Not a wiki, not a database, not a
ladder tier list. The test for any page: *would you tell a friend this while
playing with them?* If not, it does not belong.

## The four destinations

Top-level navigation, no chapters and no deep hierarchy. Every page is reachable
in at most two clicks from the home page.

| Destination | For | Contents |
|---|---|---|
| **Basics** | someone who just installed the game | what the buttons do, how the screen is laid out, stats explained, first hour, curated videos with timestamps |
| **Maps** | anyone lost | the codex: act charts, area cards, turn rules, waypoints, area levels, farming notes, the interactive exit compass |
| **Characters** | anyone starting or rebuilding a character | class in one paragraph, then "what do you want it to do?" and a build that tells you what to do at level 8 |
| **Hardcore** | anyone playing with one life | what changes, and the build variants that survive it |

## Switchers in the header

Two controls, deliberately placed side by side like a language switcher, because
they are the same kind of choice:

- **Version:** LoD · PD2 · D2R (D2R includes the Reign of the Warlock patch).
- **Mode:** Softcore · Hardcore.

Both persist in `localStorage` and in the URL, so a link keeps its context. Both
are also deep-linkable for sharing ("here is the hardcore PD2 view of the Pit").

Effects:

- Version gates the class list (the Warlock exists only in D2R), the area levels,
  and any version-specific mechanics note.
- Mode swaps build variants and adds hardcore warnings to map and farming pages.
  Modes are not a filter over one text: where hardcore changes the answer, it is
  different content.

## Home page

Three large version cards, each with two or three lines: what that version is,
who plays it, what this guide covers for it. Under them, one line of honesty:
this is general reference for playing the game, not ladder-specific build
rankings or patch-by-patch tier lists. Choosing a card sets the version and lands
on the map chart; the header always allows changing it later.

## The character flow, and why it looks like that

New players do not arrive saying "I want a Hammerdin with Concentration". They
arrive saying "a sorceress with fire and lightning", "a druid that turns into a
wolf", "a necromancer with an army".

So: class first, then a short question about what they want the character to do,
then one build. The questions are concrete ("blow up packs from range", "freeze
and shatter", "blink into a pack and pulse"), and each answer maps to a build we
actually have.

The chooser is a deterministic tree in data, not an AI call. Reasoning in
[builds-data-model.md](builds-data-model.md).

## What we deliberately do not cover

Written down so future sessions do not drift:

- every runeword, every crafting recipe, every affix table
- full monster lists, immunities and spawn tables
- patch history and patch-by-patch notes
- ladder tier lists and build rankings
- PvP
- anything we cannot source; a number without a source is a bug, not content

## Tone

Short paragraphs, imperative voice, second person. Concrete numbers where they
matter (life targets, stat splits, magic find where it stops paying). Where a
number changes by version or is not verifiable, say "check in game" rather than
invent precision. Bold for the thing that will get a new player killed if they
miss it; no walls of text; no nested bullet mazes.

Reference style: the DeepSeek guides in `references/*.html` (style only, never
cited). Bad style: fextralife wikis, where every page is complete and nobody
finishes reading.
