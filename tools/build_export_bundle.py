"""Sinh js/export_bundle.js (AD-003): gói nguồn css/js để export chạy được ở file://.

Chạy từ gốc repo: py tools/build_export_bundle.py   (thêm --check để chỉ kiểm tra).
Chỉ dùng thư viện chuẩn.
"""
import json
import os
import sys
from pathlib import Path

HEADER = (
    "/* TỆP SINH TỰ ĐỘNG bởi tools/build_export_bundle.py — KHÔNG SỬA TAY. "
    "Chạy: py tools/build_export_bundle.py */\n"
)
FIXED_FILES = ["css/app.css", "css/tailwind.css","js/state.js", "js/api.js", "js/runtime.js", "js/render.js"]
OUTPUT = "js/export_bundle.js"


def source_paths(root: Path) -> list:
    """Danh sách đường dẫn tương đối (dùng `/`) của các nguồn cần gói."""
    paths = list(FIXED_FILES)
    sections = root / "js" / "sections"
    if sections.is_dir():
        paths += sorted("js/sections/" + p.name for p in sections.glob("*.js") if p.is_file())
    return paths


def read_text(root: Path, rel: str) -> str:
    text = (root / rel).read_bytes().decode("utf-8")
    return text.replace("\r\n", "\n").replace("\r", "\n")


def build_bundle(root: Path) -> str:
    root = Path(root)
    sources = {rel: read_text(root, rel) for rel in source_paths(root)}
    payload = json.dumps(sources, ensure_ascii=False, sort_keys=True)
    payload = (
        payload.replace("</", "<\\/")
        .replace(" ", "\\u2028")
        .replace(" ", "\\u2029")
    )
    return HEADER + "window.__EXPORT_SOURCES = " + payload + ";\n"


def bundle_matches(target: Path, expected: str) -> bool:
    """So tệp đích với nội dung sinh ra, bỏ qua khác biệt CRLF/LF (autocrlf)."""
    target = Path(target)
    if not target.is_file():
        return False
    actual = target.read_bytes().decode("utf-8").replace("\r\n", "\n").replace("\r", "\n")
    return actual == expected


def _say(msg: str) -> None:
    """In an toàn: lỗi mã hoá console không được ảnh hưởng mã thoát."""
    try:
        print(msg)
    except Exception:
        pass


def main(argv=None) -> int:
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding="utf-8", errors="replace")
        except (AttributeError, ValueError, OSError):
            pass
    argv = sys.argv[1:] if argv is None else argv
    root = Path(__file__).resolve().parent.parent
    target = root / OUTPUT
    content = build_bundle(root)
    data = content.encode("utf-8")
    count = len(source_paths(root))

    if "--check" in argv:
        if bundle_matches(target, content):
            _say(f"OK: {OUTPUT} khớp nguồn ({count} tệp, {len(data)} byte).")
            return 0
        _say(f"LỖI: {OUTPUT} thiếu hoặc cũ. Chạy: py tools/build_export_bundle.py")
        return 1

    tmp = target.with_name(target.name + ".tmp")
    tmp.write_bytes(data)
    os.replace(tmp, target)
    _say(f"Đã ghi {OUTPUT}: {count} tệp nguồn, {len(data)} byte.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
