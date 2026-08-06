"""Analyze badge region coordinates."""
from pathlib import Path
from PIL import Image

SOURCE = Path(
    r"C:\Users\Neo\.cursor\projects\c-Users-Neo-season21-landing\assets\c__Users_Neo_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_mubreda_750x750_RED-1e700a12-3b75-46be-afe0-e831c4abfe9b.png"
)

img = Image.open(SOURCE).convert("RGBA")
px = img.load()
w, h = img.size

# Find golden pixels (high R, medium-high G, low B) in lower half
gold_pixels = []
for y in range(int(h * 0.65), h):
    for x in range(w):
        r, g, b, a = px[x, y]
        if r > 180 and g > 120 and b < 100 and r > g:
            gold_pixels.append((x, y))

if gold_pixels:
    xs = [p[0] for p in gold_pixels]
    ys = [p[1] for p in gold_pixels]
    print(f"Gold region: x={min(xs)}-{max(xs)}, y={min(ys)}-{max(ys)}")
    print(f"Normalized: x={min(xs)/w:.3f}-{max(xs)/w:.3f}, y={min(ys)/h:.3f}-{max(ys)/h:.3f}")

# Find red badge interior
red_pixels = []
for y in range(int(h * 0.65), h):
    for x in range(w):
        r, g, b, a = px[x, y]
        if r > 100 and g < 40 and b < 40:
            red_pixels.append((x, y))

if red_pixels:
    xs = [p[0] for p in red_pixels]
    ys = [p[1] for p in red_pixels]
    print(f"Red badge: x={min(xs)}-{max(xs)}, y={min(ys)}-{max(ys)}")
    print(f"Normalized: x={min(xs)/w:.3f}-{max(xs)/w:.3f}, y={min(ys)/h:.3f}-{max(ys)/h:.3f}")

# Sample center of badge
for y_frac in [0.70, 0.75, 0.80, 0.85, 0.90]:
    y = int(h * y_frac)
    row = []
    for x in range(w):
        r, g, b, a = px[x, y]
        if r > 100 and g < 50 and b < 50:
            row.append(x)
    if row:
        print(f"y={y_frac}: red span x={min(row)}-{max(row)}")
