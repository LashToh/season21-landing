"""Remove edge-connected black background from MU BREDA logo and export RGBA PNG + WebP."""
from __future__ import annotations

from collections import deque
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = Path(
    r'C:\Users\Neo\.cursor\projects\c-Users-Neo-season21-landing\assets'
    r'\c__Users_Neo_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images'
    r'_Mu_breda_S21.3-e069645a-491a-42a5-9ffd-43d1fcfbdcf5.png'
)
OUT_PNG = ROOT / 'public' / 'assets' / 'logo-mubreda.png'
OUT_WEBP = ROOT / 'public' / 'assets' / 'logo-mubreda.webp'

THRESHOLD = 28


def is_bg(r: int, g: int, b: int) -> bool:
    return max(r, g, b) <= THRESHOLD


def remove_edge_black(im: Image.Image) -> Image.Image:
    im = im.convert('RGBA')
    w, h = im.size
    px = im.load()
    visited = [[False] * w for _ in range(h)]
    q: deque[tuple[int, int]] = deque()

    def try_push(x: int, y: int) -> None:
        if 0 <= x < w and 0 <= y < h and not visited[y][x]:
            r, g, b, _ = px[x, y]
            if is_bg(r, g, b):
                visited[y][x] = True
                q.append((x, y))

    for x in range(w):
        try_push(x, 0)
        try_push(x, h - 1)
    for y in range(h):
        try_push(0, y)
        try_push(w - 1, y)

    while q:
        x, y = q.popleft()
        r, g, b, _ = px[x, y]
        px[x, y] = (r, g, b, 0)
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= nx < w and 0 <= ny < h and not visited[ny][nx]:
                r2, g2, b2, _ = px[nx, ny]
                if is_bg(r2, g2, b2):
                    visited[ny][nx] = True
                    q.append((nx, ny))

    return im


def analyze(path: Path, label: str) -> None:
    im = Image.open(path)
    im.load()
    print(f'=== {label}: {path.name} ===')
    print('mode:', im.mode, 'size:', im.size)
    rgba = im.convert('RGBA')
    a = rgba.getchannel('A')
    print('alpha extrema:', a.getextrema())
    print('corner alpha:', rgba.getpixel((0, 0))[3])


def main() -> None:
    if not SRC.exists():
        raise SystemExit(f'Source not found: {SRC}')

    analyze(SRC, 'SOURCE (before)')

    out = remove_edge_black(Image.open(SRC))
    OUT_PNG.parent.mkdir(parents=True, exist_ok=True)
    out.save(OUT_PNG, 'PNG', optimize=True)
    out.save(OUT_WEBP, 'WEBP', lossless=True, method=6)

    analyze(OUT_PNG, 'OUTPUT PNG')
    print('Saved:', OUT_PNG)
    print('Saved:', OUT_WEBP)


if __name__ == '__main__':
    main()
