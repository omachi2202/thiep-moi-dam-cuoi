"""Kiểm css/tailwind.css (AD-005): dòng đầu mang hash nguồn, phải khớp nguồn hiện tại. Không cần CLI."""
import importlib.util
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent.parent
_spec = importlib.util.spec_from_file_location("build_tailwind", REPO / "tools" / "build_tailwind.py")
tw = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(tw)

HINT = "Chạy: py tools/build_tailwind.py"


def test_tailwind_css_exists_and_header():
    target = REPO / "css" / "tailwind.css"
    assert target.is_file(), f"Thiếu css/tailwind.css. {HINT}"
    assert tw.read_header_hash(target) is not None, f"Dòng đầu css/tailwind.css sai mẫu. {HINT}"


def test_tailwind_css_fresh():
    target = REPO / "css" / "tailwind.css"
    assert tw.read_header_hash(target) == tw.source_hash(REPO), f"css/tailwind.css đã cũ so với nguồn. {HINT}"


def test_source_hash_rules(tmp_path):
    for rel in (tw.CONFIG, tw.INPUT, "index.html", "invite.html", "js/a.js", "js/sections/b.js"):
        p = tmp_path / rel
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_bytes(b"x\r\n")
    (tmp_path / "js" / "export_bundle.js").write_bytes(b"bundle1")
    h1 = tw.source_hash(tmp_path)
    # export_bundle.js bị loại, CRLF/LF không ảnh hưởng
    (tmp_path / "js" / "export_bundle.js").write_bytes(b"bundle2")
    (tmp_path / "js" / "a.js").write_bytes(b"x\n")
    assert tw.source_hash(tmp_path) == h1
    (tmp_path / "js" / "a.js").write_bytes(b"y\n")
    assert tw.source_hash(tmp_path) != h1
    assert "js/export_bundle.js" not in tw.source_paths(tmp_path)
