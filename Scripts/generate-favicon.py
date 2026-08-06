"""Generate favicon assets from the red B logo."""
from __future__ import annotations

import base64
import io
from pathlib import Path

from PIL import Image, ImageEnhance, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(
    r"C:\Users\Neo\.cursor\projects\c-Users-Neo-season21-landing\assets"
    r"\c__Users_Neo_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images"
    r"_B_red-cb65d60b-a90c-41f4-b00a-b2874047173a.png"
)
PUBLIC = ROOT / "public"
ASSETS = PUBLIC / "assets"
THEME_BG = (9, 9, 9, 255)  # #090909


def load_and_prepare() -> Image.Image:
    img = Image.open(SOURCE).convert("RGBA")
    # Normalize background to theme color for consistency
    pixels = img.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            if a > 0 and r < 30 and g < 30 and b < 30:
                pixels[x, y] = THEME_BG
    return img


def enhance_for_size(img: Image.Image, size: int) -> Image.Image:
    """Resize and sharpen for favicon readability."""
    resized = img.resize((size, size), Image.Resampling.LANCZOS)

    # Boost contrast and color pop at small sizes
    contrast = 1.15 if size <= 32 else 1.08
    color = 1.12 if size <= 32 else 1.05
    sharpen = 1.8 if size <= 16 else 1.4 if size <= 32 else 1.2

    resized = ImageEnhance.Contrast(resized).enhance(contrast)
    resized = ImageEnhance.Color(resized).enhance(color)
    resized = ImageEnhance.Sharpness(resized).enhance(sharpen)
    resized = resized.filter(
        ImageFilter.UnsharpMask(radius=0.6, percent=120, threshold=2)
    )
    return resized


def save_png(img: Image.Image, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, "PNG", optimize=True)
    print(f"Saved: {path}")


def save_ico(img: Image.Image, path: Path, sizes: list[int]) -> None:
    icons = [enhance_for_size(img, s) for s in sizes]
    path.parent.mkdir(parents=True, exist_ok=True)
    icons[0].save(
        path,
        format="ICO",
        sizes=[(s, s) for s in sizes],
        append_images=icons[1:],
    )
    print(f"Saved: {path} ({', '.join(f'{s}x{s}' for s in sizes)})")


def save_svg_with_embedded_png(png: Image.Image, path: Path) -> None:
    buf = io.BytesIO()
    png.save(buf, format="PNG", optimize=True)
    b64 = base64.b64encode(buf.getvalue()).decode("ascii")
    svg = (
        '<svg xmlns="http://www.w3.org/2000/svg" '
        'xmlns:xlink="http://www.w3.org/1999/xlink" '
        'viewBox="0 0 64 64">\n'
        f'  <image width="64" height="64" href="data:image/png;base64,{b64}"/>\n'
        "</svg>\n"
    )
    path.write_text(svg, encoding="utf-8")
    print(f"Saved: {path}")


def main() -> None:
    source_img = load_and_prepare()

    # Copy full-res source to assets
    save_png(source_img, ASSETS / "logo-b-red.png")

    # Navbar mark (44px display ~ 88px for retina)
    save_png(enhance_for_size(source_img, 88), ASSETS / "logo-b-mark.png")

    # Favicon PNG (64x64)
    favicon_png = enhance_for_size(source_img, 64)
    save_png(favicon_png, PUBLIC / "favicon.png")

    # Apple touch icon (180x180)
    save_png(enhance_for_size(source_img, 180), PUBLIC / "apple-touch-icon.png")

    # Multi-size ICO (16, 32, 48)
    save_ico(source_img, PUBLIC / "favicon.ico", [16, 32, 48])

    # SVG fallback with embedded PNG
    save_svg_with_embedded_png(favicon_png, PUBLIC / "favicon.svg")


if __name__ == "__main__":
    main()
