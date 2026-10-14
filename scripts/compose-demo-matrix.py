"""Compose the four recorded demos for social sharing. Requires Pillow."""

from pathlib import Path

from PIL import Image, ImageOps, ImageSequence


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "docs" / "assets" / "demos"
PROVIDERS = ("recaptcha", "turnstile", "hcaptcha", "image-text")
clips = []
durations = []
for provider in PROVIDERS:
    with Image.open(ASSETS / f"{provider}.gif") as source:
        frames = []
        timing = []
        for frame in ImageSequence.Iterator(source):
            frames.append(frame.convert("RGB"))
            timing.append(frame.info.get("duration", 100))
        clips.append(frames)
        durations.append(timing)

# Keep the source timing and complete frames; never synthesize a passed state.
if any(timing != durations[0] for timing in durations[1:]):
    raise ValueError("Recordings must have matching timelines before composition.")

output = []
for frame_index in range(len(clips[0])):
    canvas = Image.new("RGB", (1600, 1152), "white")
    for index, clip in enumerate(clips):
        tile = ImageOps.contain(clip[frame_index], (800, 576))
        canvas.paste(tile, ((index % 2) * 800, (index // 2) * 576))
    output.append(canvas)

target = ASSETS / "matrix.gif"
output[0].save(
    target,
    save_all=True,
    append_images=output[1:],
    duration=durations[0],
    loop=0,
    optimize=True,
)
print(f"Created {target}: {target.stat().st_size:,} bytes")
