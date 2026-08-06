"""Analyze gold numeral region more precisely."""
from pathlib import Path
from PIL import Image

SOURCE = Path(
    r"C:\Users\Neo\.cursor\projects\c-Users-Neo-season21-landing\assets\c__Users_Neo_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_mubreda_750x750_RED-1e700a12-3b75-46be-afe0-e831c4abfe9b.png"
)

img = Image.open(SOURCE).convert("RGBA")
px = img.load()
w, h = img.size

# Gold numeral: bright gold, right side of badge
for x_min in [350, 380, 400, 420]:
    gold = []
    for y in range(int(h * 0.65), int(h * 0.82)):
        for x in range(x_min, w):
            r, g, b, a = px[x, y]
            if r > 200 and g > 150 and b < 120:
                gold.append((x, y))
    if gold:
        xs = [p[0] for p in gold]
        ys = [p[1] for p in gold]
        print(f"x>={x_min}: gold x={min(xs)}-{max(xs)}, y={min(ys)}-{max(ys)}")

# White SEASON text region
white = []
for y in range(int(h * 0.65), int(h * 0.82)):
    for x in range(w):
        r, g, b, a = px[x, y]
        if r > 200 and g > 200 and b > 200:
            white.append((x, y))
if white:
    xs = [p[0] for p in white]
    ys = [p[1] for p in white]
    print(f"White text: x={min(xs)}-{max(xs)}, y={min(ys)}-{max(ys)}")
