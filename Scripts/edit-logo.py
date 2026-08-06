"""DEPRECATED — final logo is supplied manually as public/assets/logo-mubreda.png.

This script is kept for reference only. Do not run it; it will overwrite the
final artwork.
"""
from __future__ import annotations

import os
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(
    r"C:\Users\Neo\.cursor\projects\c-Users-Neo-season21-landing\assets\c__Users_Neo_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_mubreda_750x750_RED-1e700a12-3b75-46be-afe0-e831c4abfe9b.png"
)
OUT_PNG = ROOT / "public" / "assets" / "logo-mubreda.png"
OUT_WEBP = ROOT / "public" / "assets" / "logo-mubreda.webp"


def find_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    if bold:
        candidates = [
            r"C:\Windows\Fonts\GARABD.TTF",
            r"C:\Windows\Fonts\timesbd.ttf",
            r"C:\Windows\Fonts\georgiab.ttf",
            r"C:\Windows\Fonts\trajanbd.ttf",
        ]
    else:
        candidates = [
            r"C:\Windows\Fonts\GARA.TTF",
            r"C:\Windows\Fonts\times.ttf",
            r"C:\Windows\Fonts\georgia.ttf",
        ]
    for path in candidates:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except OSError:
                continue
    return ImageFont.load_default()


def clone_badge_texture(img: Image.Image, dest_box: tuple[int, int, int, int], src_x: int) -> None:
    x0, y0, x1, y1 = dest_box
    width = x1 - x0
    height = y1 - y0
    strip = img.crop((src_x, y0, src_x + 12, y1))
    patch = strip.resize((width, height), Image.Resampling.BILINEAR)
    img.paste(patch, (x0, y0))


def draw_metallic_gold(
    base: Image.Image,
    xy: tuple[int, int],
    text: str,
    font: ImageFont.ImageFont,
) -> None:
    x, y = xy
    w, h = base.size
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    for ox, oy, color in [
        (2, 2, (90, 55, 8, 180)),
        (1, 1, (140, 90, 20, 220)),
        (0, -1, (255, 225, 100, 255)),
        (0, 0, (230, 175, 45, 255)),
        (-1, -2, (255, 248, 190, 120)),
    ]:
        draw.text((x + ox, y + oy), text, font=font, fill=color, anchor="mm")
    base.alpha_composite(layer)


def main() -> None:
    img = Image.open(SOURCE).convert("RGBA")

    # Redraw entire badge interior text area (interior red only, keep border)
    text_area = (248, 490, 492, 556)
    clone_badge_texture(img, text_area, src_x=300)

    # Redraw SEASON in white + 21 in gold
    season_font = find_font(22)
    num_font = find_font(44, bold=True)

    w, h = img.size
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    draw.text((268, 520), "SEASON", font=season_font, fill=(255, 255, 255, 255), anchor="lm")
    img.alpha_composite(layer)

    draw_metallic_gold(img, (448, 518), "21", num_font)

    OUT_PNG.parent.mkdir(parents=True, exist_ok=True)
    img.save(OUT_PNG, "PNG", optimize=True)
    img.save(OUT_WEBP, "WEBP", quality=92, method=6)
    print(f"Saved: {OUT_PNG}")
    print(f"Saved: {OUT_WEBP}")


if __name__ == "__main__":
    main()
