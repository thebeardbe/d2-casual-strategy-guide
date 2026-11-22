#!/usr/bin/env python3
"""Extract area-card art from the source video.

Each card in tools/cards.json names the area id, the map type of the *card* and
the window of video seconds where that card is on screen. `cardType` is the type
shown in that card's title box, which is not always the area's own map type: the
video only ever shows Underground Passage Level 2 under the Level 1 card, so that
card's type is Straight even though the level itself is Fixed.

Inside the window the script picks the frame with the cleanest automap (bright
map lines on black, no gameplay HUD) and checks the title box colour against
`cardType`. A frame is only written when that check passes; anything else lands in
the report's `missing` list instead of shipping a mismatched picture. Two
overrides exist per card: `force` pins one second, and `allowLow` accepts a frame
that failed the clean-automap thresholds. Both are deliberate, hand-checked
exceptions, never automatic.

Writes, per card:
  .extract/frames/<id>.png    full 1920x1080 frame that was chosen
  .extract/panels/<id>.png    left info panel (Features / Entrance / Exit)
  .extract/titles/<id>.png    coloured title box (sanity check for the card)
  public/examples/<id>.webp   isometric example map, auto-cropped to content
  tools/extract-report.json   chosen second, scores, confidence and the missing list

The video is not part of the repository. Fetch the Act I slice first, then
transcode it once so seeking is frame-accurate (VP9 seeks drift):

  yt-dlp -f "bv*[height<=1080][ext=mp4]" --download-sections "*10:00-18:45" \\
      -o .extract/source-act1.mp4 "https://www.youtube.com/watch?v=J1EFUYGk4CA"
  ffmpeg -i .extract/source-act1.mp4 -c:v libx264 -preset ultrafast -crf 20 \\
      -g 25 -an .extract/act1-h264.mp4

Then:

  nix shell nixpkgs#ffmpeg --command python3 tools/extract_cards.py \\
      .extract/act1-h264.mp4 --offset 600
"""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
EXTRACT = ROOT / ".extract"
FRAMES = EXTRACT / "frames"
PANELS = EXTRACT / "panels"
TITLES = EXTRACT / "titles"
EXAMPLES = ROOT / "public" / "examples"
REPORT = ROOT / "tools" / "extract-report.json"

# Regions of a 1920x1080 card frame: (width, height, x, y).
MAP_REGION = (1480, 780, 440, 300)
PANEL_REGION = (390, 800, 20, 200)
TITLE_REGION = (400, 180, 16, 50)

# Scoring pass runs on a half-size copy of the frame to keep memory sane.
SCAN_SIZE = (960, 540)
SCAN_SCALE = 0.5

EXAMPLE_WIDTH = 1100
CONTENT_THRESHOLD = 18  # a channel above this counts as map content
CONTENT_PADDING = 12    # breathing room around the detected map, source pixels
HUD_ORB_MIN_PIXELS = 30  # vivid pixels in one row that mean a life/mana orb

# A frame is a usable automap when most of the map area is background black.
MIN_BLACK_FRACTION = 0.55
# Gameplay frames always paint the life/mana orbs along the bottom edge.
MAX_HUD_FRACTION = 0.02
# Automap walls and markers are drawn in saturated yellow.
MIN_YELLOW, MIN_YELLOW_RED, MIN_YELLOW_GREEN, MAX_YELLOW_BLUE = 170, 170, 140, 150

PALETTE = {
    "#930000": "Fixed",
    "#ff0607": "Fixed Enough",
    "#7a007d": "Alternating Fixed",
    "#ef6f00": "Big Square",
    "#c99200": "Big Rectangle",
    "#003100": "Counter-Clockwise",
    "#00135c": "Clockwise",
    "#007bad": "Straight",
    "#767170": "Random",
}
# How far a sampled title colour may drift from a palette entry (squared RGB).
COLOUR_TOLERANCE = 3000


def run(args: list[str], capture: bool = False) -> bytes:
    result = subprocess.run(args, capture_output=True)
    if result.returncode != 0:
        raise SystemExit(f"command failed: {' '.join(args)}\n{result.stderr.decode(errors='replace')}")
    return result.stdout if capture else b""


def classify(red: int, green: int, blue: int) -> str | None:
    best, best_distance = None, 1 << 30
    for hex_colour, name in PALETTE.items():
        pr, pg, pb = (int(hex_colour[i : i + 2], 16) for i in (1, 3, 5))
        distance = (red - pr) ** 2 + (green - pg) ** 2 + (blue - pb) ** 2
        if distance < best_distance:
            best, best_distance = name, distance
    return best if best_distance <= COLOUR_TOLERANCE else None


def scan(video: Path, first: int, last: int, time_base: int) -> list[dict]:
    """One decoding pass: title colour, black share, HUD share and yellow count.

    `first`/`last` are positions in the video file, `time_base` is the
    full-video second that file position 0 corresponds to, so every metric is
    reported in video time.
    """
    raw = subprocess.run(
        [
            "ffmpeg", "-nostdin", "-loglevel", "error",
            "-ss", str(first), "-t", str(last - first + 1), "-i", str(video),
            "-vf", f"fps=1,scale={SCAN_SIZE[0]}:{SCAN_SIZE[1]}",
            "-f", "rawvideo", "-pix_fmt", "rgb24", "-",
        ],
        capture_output=True,
    )
    if raw.returncode != 0:
        raise SystemExit(f"scan failed: {raw.stderr.decode(errors='replace')}")

    width, height = SCAN_SIZE
    frame_bytes = width * height * 3
    frames = len(raw.stdout) // frame_bytes
    if frames == 0:
        raise SystemExit("scan produced no frames; check --offset and the windows")

    map_x, map_y = int(MAP_REGION[2] * SCAN_SCALE), int(MAP_REGION[3] * SCAN_SCALE)
    map_w, map_h = int(MAP_REGION[0] * SCAN_SCALE), int(MAP_REGION[1] * SCAN_SCALE)
    title_x, title_y = int(TITLE_REGION[2] * SCAN_SCALE), int(TITLE_REGION[3] * SCAN_SCALE)
    title_w, title_h = int(TITLE_REGION[0] * SCAN_SCALE), int(TITLE_REGION[1] * SCAN_SCALE)
    hud_y = map_y + int(map_h * 0.82)

    metrics: list[dict] = []
    for index in range(frames):
        frame_start = index * frame_bytes
        colours: dict[tuple[int, int, int], int] = {}
        for row in range(title_y, title_y + title_h, 2):
            for col in range(title_x, title_x + title_w, 2):
                offset = frame_start + (row * width + col) * 3
                key = (raw.stdout[offset], raw.stdout[offset + 1], raw.stdout[offset + 2])
                colours[key] = colours.get(key, 0) + 1
        dominant, dominant_count = max(colours.items(), key=lambda item: item[1])
        sampled = ((title_h // 2) * (title_w // 2))
        title_colour = dominant if dominant_count >= sampled * 0.45 else None
        title_type = classify(*title_colour) if title_colour else None

        black = yellow = hud = 0
        total = map_w * map_h
        for row in range(map_y, map_y + map_h):
            row_base = frame_start + row * width * 3
            for col in range(map_x, map_x + map_w):
                offset = row_base + col * 3
                red, green, blue = raw.stdout[offset], raw.stdout[offset + 1], raw.stdout[offset + 2]
                if max(red, green, blue) <= 24:
                    black += 1
                if red >= MIN_YELLOW and green >= MIN_YELLOW_GREEN and blue <= MAX_YELLOW_BLUE:
                    yellow += 1
                if row >= hud_y and (red > 120 and green < 70 and blue < 70 or blue > 120 and red < 80):
                    hud += 1
        hud_total = max(1, map_w * (map_y + map_h - hud_y))

        metrics.append(
            {
                "second": time_base + first + index,
                "type": title_type,
                "black": black / total,
                "yellow": yellow,
                "hud": hud / hud_total,
            }
        )
    return metrics


def pick(metrics: list[dict], card: dict) -> dict | None:
    if "force" in card:
        forced = next((m for m in metrics if m["second"] == card["force"]), None)
        if forced is None:
            raise SystemExit(f"{card['id']}: forced second {card['force']} is outside the scanned range")
        return {**forced, "confidence": "forced"}
    expected = card["cardType"] if isinstance(card["cardType"], list) else [card["cardType"]]
    start, end = card["window"]
    in_window = [m for m in metrics if start <= m["second"] <= end]
    typed = [m for m in in_window if m["type"] in expected]
    clean = [
        m for m in typed
        if m["black"] >= MIN_BLACK_FRACTION and m["hud"] <= MAX_HUD_FRACTION
    ]
    for candidates, confidence in ((clean, "high"), (typed, "low"), (in_window, "none")):
        if candidates:
            if confidence != "high" and not card.get("allowLow"):
                return None
            best = max(candidates, key=lambda m: (m["yellow"], -abs(m["second"] - (start + end) // 2)))
            return {**best, "confidence": confidence}
    return None


def grab(video: Path, offset: int, second: int, out: Path) -> None:
    run([
        "ffmpeg", "-nostdin", "-loglevel", "error", "-y",
        "-ss", str(second - offset), "-i", str(video),
        "-frames:v", "1", str(out),
    ])


def crop(
    source: Path,
    region: tuple[int, int, int, int],
    out: Path,
    filters: list[str] | None = None,
    options: list[str] | None = None,
) -> None:
    """Crop a region out of a frame, optionally adding filters and encoder options."""
    width, height, x, y = region
    chain = ",".join([f"crop={width}:{height}:{x}:{y}", *(filters or [])])
    run([
        "ffmpeg", "-nostdin", "-loglevel", "error", "-y",
        "-i", str(source), "-vf", chain, *(options or []), str(out),
    ])


def is_hud_pixel(red: int, green: int, blue: int) -> bool:
    """The life and mana orbs are large, vivid red and blue discs."""
    vivid_red = red > 150 and green < 70 and blue < 70
    vivid_blue = blue > 140 and red < 90 and green < 120
    return vivid_red or vivid_blue


def trim_hud_band(hud_rows: list[int], min_y: int, max_y: int) -> int:
    """Bottom row to keep, so the gameplay HUD orbs stay out of the crop.

    Only rows in the bottom fifth are considered, and only when enough vivid
    pixels are present to be an orb rather than the small red "Exit" label.
    """
    search_from = min_y + int((max_y - min_y) * 0.8)
    for row in range(search_from, max_y + 1):
        if hud_rows[row] >= HUD_ORB_MIN_PIXELS:
            return max(min_y + 1, row - CONTENT_PADDING)
    return max_y


class NoContentError(RuntimeError):
    """The frame has no map art inside the scan region."""


def content_box(frame: Path, region: tuple[int, int, int, int] | None = None) -> tuple[int, int, int, int]:
    """Bounding box of non-black pixels inside the map region.

    cropdetect is unreliable on still images, so the region is decoded to raw
    RGB and scanned directly.
    """
    width, height, x, y = region or MAP_REGION
    data = run([
        "ffmpeg", "-nostdin", "-loglevel", "error", "-i", str(frame),
        "-vf", f"crop={width}:{height}:{x}:{y}", "-f", "rawvideo", "-pix_fmt", "rgb24", "-",
    ], capture=True)
    if len(data) != width * height * 3:
        raise SystemExit(f"could not read the map region of {frame}")

    min_x, min_y, max_x, max_y = width, height, -1, -1
    row_counts = [0] * height
    hud_rows = [0] * height
    for row in range(height):
        base = row * width * 3
        for col in range(width):
            offset = base + col * 3
            if max(data[offset : offset + 3]) > CONTENT_THRESHOLD:
                min_x, max_x = min(min_x, col), max(max_x, col)
                row_counts[row] += 1
                if is_hud_pixel(data[offset], data[offset + 1], data[offset + 2]):
                    hud_rows[row] += 1
                if row < min_y:
                    min_y = row
                if row > max_y:
                    max_y = row
    if max_x < 0:
        raise NoContentError(f"no map content in the scan region of {frame}")

    top = min_y
    bottom_limit = trim_hud_band(hud_rows, min_y, max_y)

    pad = CONTENT_PADDING
    left, top = max(0, min_x - pad), max(0, top - pad)
    right = min(width - 1, max_x + pad)
    bottom = min(bottom_limit, height - 1, max_y + pad)
    return right - left + 1, bottom - top + 1, x + left, y + top


def parse_args() -> tuple[Path, int]:
    args = sys.argv[1:]
    if not args or args[0].startswith("-"):
        raise SystemExit("usage: extract_cards.py <video.mp4> [--offset seconds]")
    video = Path(args[0])
    offset = 0
    if "--offset" in args:
        try:
            offset = int(args[args.index("--offset") + 1])
        except (IndexError, ValueError):
            raise SystemExit("--offset needs an integer number of seconds")
    if not video.exists():
        raise SystemExit(f"video not found: {video}")
    return video, offset


def main() -> None:
    video, offset = parse_args()
    cards = json.loads((ROOT / "tools" / "cards.json").read_text())
    for path in (FRAMES, PANELS, TITLES, EXAMPLES):
        path.mkdir(parents=True, exist_ok=True)

    first = min(card["window"][0] for card in cards) - offset
    last = max(card["window"][1] for card in cards) - offset
    metrics = scan(video, first, last, offset)

    report = {}
    missing = []
    for card in cards:
        card_id = card["id"]
        chosen = pick(metrics, card)
        if chosen is None:
            missing.append(card_id)
            continue
        frame = FRAMES / f"{card_id}.png"
        grab(video, offset, chosen["second"], frame)
        crop(frame, PANEL_REGION, PANELS / f"{card_id}.png")
        crop(frame, TITLE_REGION, TITLES / f"{card_id}.png")
        try:
            box = content_box(frame, tuple(card["region"]) if "region" in card else None)
            crop(frame, box, EXAMPLES / f"{card_id}.webp", [f"scale={EXAMPLE_WIDTH}:-1"], ["-quality", "82"])
        except NoContentError as error:
            missing.append(card_id)
            print(f"{card_id:24s} {chosen['second']:>5}s  {error}")
            continue
        report[card_id] = {
            "second": chosen["second"],
            "type": chosen["type"],
            "expected": card["cardType"],
            "confidence": chosen["confidence"],
            "black": round(chosen["black"], 3),
            "hud": round(chosen["hud"], 4),
            "yellow": chosen["yellow"],
        }
        flag = "" if chosen["confidence"] == "high" else f"  <-- {chosen['confidence']} confidence"
        print(f"{card_id:24s} {chosen['second']:>5}s  {chosen['type'] or '?':<20s}"
              f" black {chosen['black']:.2f} hud {chosen['hud']:.3f} yellow {chosen['yellow']:>6d}{flag}")

    REPORT.write_text(json.dumps({"cards": report, "missing": sorted(missing)}, indent=2) + "\n")
    if missing:
        print(f"\nno usable frame for: {', '.join(missing)}")
        print("these areas need a fallback example image")


if __name__ == "__main__":
    main()
