"""Sinh css/tailwind.css (AD-005) bằng Tailwind standalone CLI v3.4.17.

Chạy từ gốc repo: py tools/build_tailwind.py   (thêm --check để chỉ so hash nguồn, không cần CLI).
Chỉ dùng thư viện chuẩn.
"""
import hashlib
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

OUTPUT = "css/tailwind.css"
CONFIG = "tools/tailwind.config.js"
INPUT = "tools/tailwind.input.css"
EXCLUDE = {"js/export_bundle.js"}
HEADER_RE = re.compile(r"^/\* Sinh bởi tools/build_tailwind\.py — KHÔNG sửa tay\. nguon:([0-9a-f]{64}) \*/$")
DOWNLOAD_URL = "https://github.com/tailwindlabs/tailwindcss/releases/tag/v3.4.17"


def header_line(digest: str) -> str:
    return f"/* Sinh bởi tools/build_tailwind.py — KHÔNG sửa tay. nguon:{digest} */"


def source_paths(root: Path) -> list:
    """Đường dẫn tương đối (dùng `/`), sắp xếp, của mọi nguồn ảnh hưởng tới CSS sinh ra."""
    root = Path(root)
    paths = [CONFIG, INPUT, "index.html", "invite.html"]
    js = root / "js"
    if js.is_dir():
        paths += [
            p.relative_to(root).as_posix()
            for p in js.rglob("*.js")
            if p.is_file() and p.relative_to(root).as_posix() not in EXCLUDE
        ]
    return sorted(set(paths))


def source_hash(root=None) -> str:
    """Hash nguồn. Lưu ý: KHÔNG gồm phiên bản CLI — CLI được ghim v3.4.17 theo AD-005;
    đổi CLI thì phải chạy lại tool để sinh lại css/tailwind.css."""
    root = Path(root) if root is not None else Path(__file__).resolve().parent.parent
    h = hashlib.sha256()
    for rel in source_paths(root):
        text = (root / rel).read_bytes().decode("utf-8").replace("\r\n", "\n").replace("\r", "\n")
        h.update(rel.encode("utf-8") + b"\0" + text.encode("utf-8") + b"\0")
    return h.hexdigest()


def read_header_hash(target: Path):
    """Trả hash ở dòng đầu của tệp đích, hoặc None nếu thiếu/sai mẫu."""
    target = Path(target)
    if not target.is_file():
        return None
    with open(target, "rb") as f:
        first = f.readline().decode("utf-8", "replace").rstrip("\r\n")
    m = HEADER_RE.match(first)
    return m.group(1) if m else None


def find_cli(root: Path):
    env = os.environ.get("TAILWIND_BIN")
    if env and Path(env).is_file():
        return Path(env)
    for name in ("tailwindcss.exe", "tailwindcss"):
        p = root / "tools" / "bin" / name
        if p.is_file():
            return p
    return None


def _say(msg: str) -> None:
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
    digest = source_hash(root)

    if "--check" in argv:
        if read_header_hash(target) == digest:
            _say(f"OK: {OUTPUT} khớp nguồn.")
            return 0
        _say(f"LỖI: {OUTPUT} thiếu hoặc cũ. Chạy: py tools/build_tailwind.py")
        return 1

    cli = find_cli(root)
    if cli is None:
        _say(
            "LỖI: không tìm thấy Tailwind CLI. Đặt biến môi trường TAILWIND_BIN, hoặc tải "
            "tailwindcss-windows-x64.exe (v3.4.17) từ " + DOWNLOAD_URL +
            " rồi lưu thành tools/bin/tailwindcss.exe (Linux/Mac: tools/bin/tailwindcss)."
        )
        return 2

    tmpdir = tempfile.mkdtemp(prefix="tailwind_")
    try:
        tmp_out = Path(tmpdir) / "out.css"
        cmd = [str(cli), "-c", CONFIG, "-i", INPUT, "-o", str(tmp_out), "--minify"]
        try:
            r = subprocess.run(cmd, cwd=str(root), capture_output=True, timeout=120)
        except subprocess.TimeoutExpired:
            _say("LỖI: Tailwind CLI chạy quá 120 giây nên đã dừng. css/tailwind.css không bị thay đổi.")
            return 4
        if r.returncode != 0 or not tmp_out.is_file():
            _say("LỖI: Tailwind CLI thất bại.\n" + r.stderr.decode("utf-8", "replace"))
            return 3
        css = tmp_out.read_bytes().decode("utf-8").replace("\r\n", "\n").replace("\r", "\n")
    finally:
        shutil.rmtree(tmpdir, ignore_errors=True)

    data = (header_line(digest) + "\n" + css).encode("utf-8")
    tmp = target.with_name(target.name + ".tmp")
    tmp.write_bytes(data)
    os.replace(tmp, target)
    _say(f"Đã ghi {OUTPUT}: {len(data)} byte.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
