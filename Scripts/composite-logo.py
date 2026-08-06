"""DEPRECATED — final logo is supplied manually as public/assets/logo-mubreda.png.

This script is kept for reference only. Do not run it; it will overwrite the
final artwork.
"""
from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(
    r"C:\Users\Neo\.cursor\projects\c-Users-Neo-season21-landing\assets"
    r"\c__Users_Neo_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images"
    r"_mubreda_750x750_RED-1e700a12-3b75-46be-afe0-e831c4abfe9b.png"
)
DIGITS_SRC = Path(
    r"C:\Users\Neo\.cursor\projects\c-Users-Neo-season21-landing\assets\digits-21-gen.png"
)
OUT_PNG = ROOT / "public" / "assets" / "logo-mubreda.png"
OUT_WEBP = ROOT / "public" / "assets" / "logo-mubreda.webp"

# Original golden "6" bounding box (measured from source image)
DIGIT_BOX = (418, 488, 472, 542)


def key_black_to_alpha(img: Image.Image, threshold: int = 35) -> Image.Image:
    img = img.convert("RGBA")
    px = img.load()
    for y in range(img.height):
        for x in range(img.width):
            r, g, b, a = px[x, y]
            if r <= threshold and g <= threshold and b <= threshold:
                px[x, y] = (0, 0, 0, 0)
            else:
                px[x, y] = (r, g, b, 255)
    return img


def trim_alpha(img: Image.Image, pad: int = 2) -> Image.Image:
    bbox = img.getbbox()
    if not bbox:
        return img
    x0, y0, x1, y1 = bbox
    return img.crop((max(0, x0 - pad), max(0, y0 - pad), x1 + pad, y1 + pad))


def clone_strip(img: Image.Image, dest: tuple[int, int, int, int], src_x: int) -> None:
    x0, y0, x1, y1 = dest
    w, h = x1 - x0, y1 - y0
    strip = img.crop((src_x, y0, src_x + 6, y1))
    img.paste(strip.resize((w, h), Image.Resampling.BILINEAR), (x0, y0))


def main() -> None:
    img = Image.open(SOURCE).convert("RGBA")

    # Erase original "6" by cloning badge interior texture
    clone_strip(img, DIGIT_BOX, src_x=360)

    # Prepare "21" overlay keyed from black background
    digits = Image.open(DIGITS_SRC).convert("RGBA")
    digits = key_black_to_alpha(digits)
    digits = trim_alpha(digits)

    # Trim decorative underline at base of generated "1"
    dh = digits.height
    digits = digits.crop((0, 0, digits.width, int(dh * 0.92)))
    digits = trim_alpha(digits)

    slot_w = DIGIT_BOX[2] - DIGIT_BOX[0]
    slot_h = DIGIT_BOX[3] - DIGIT_BOX[1]
    dw, dh = digits.size
    scale = min(slot_w / dw, slot_h / dh) * 1.05
    nw, nh = int(dw * scale), int(dh * scale)
    digits = digits.resize((nw, nh), Image.Resampling.LANCZOS)

    cx = (DIGIT_BOX[0] + DIGIT_BOX[2]) // 2 + 12
    cy = (DIGIT_BOX[1] + DIGIT_BOX[3]) // 2 - 1
    img.alpha_composite(digits, (cx - nw // 2, cy - nh // 2))

    OUT_PNG.parent.mkdir(parents=True, exist_ok=True)
    img.save(OUT_PNG, "PNG", optimize=True)
    img.save(OUT_WEBP, "WEBP", quality=92, method=6)
    print(f"Saved: {OUT_PNG}")
    print(f"Saved: {OUT_WEBP}")


if __name__ == "__main__":
    main()
