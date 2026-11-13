"""Kiểm bundle export (AD-003): js/export_bundle.js phải khớp nguồn."""
import importlib.util
import json
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent.parent
_spec = importlib.util.spec_from_file_location(
    "build_export_bundle", REPO / "tools" / "build_export_bundle.py"
)
bundle_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(bundle_mod)
build_bundle = bundle_mod.build_bundle

HINT = "Chạy: py tools/build_export_bundle.py"


def _fake_tree(tmp_path, js_text="var a=1;\r\n"):
    for rel in bundle_mod.FIXED_FILES:
        p = tmp_path / rel
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_bytes(js_text.encode("utf-8"))
    sec = tmp_path / "js" / "sections"
    sec.mkdir(parents=True, exist_ok=True)
    (sec / "b.js").write_bytes(b"b")
    (sec / "a.js").write_bytes(b"a")
    return tmp_path


def test_export_bundle_fresh():
    target = REPO / "js" / "export_bundle.js"
    assert target.is_file(), f"Thiếu js/export_bundle.js. {HINT}"
    assert bundle_mod.bundle_matches(target, build_bundle(REPO)), (
        f"js/export_bundle.js đã cũ so với nguồn. {HINT}"
    )


def test_bundle_matches_ignores_crlf(tmp_path):
    root = _fake_tree(tmp_path / "src")
    expected = build_bundle(root)
    crlf = tmp_path / "crlf.js"
    crlf.write_bytes(expected.replace("\n", "\r\n").encode("utf-8"))
    assert bundle_mod.bundle_matches(crlf, expected)
    crlf.write_bytes((expected + "x").replace("\n", "\r\n").encode("utf-8"))
    assert not bundle_mod.bundle_matches(crlf, expected)
    assert not bundle_mod.bundle_matches(tmp_path / "missing.js", expected)


def test_export_bundle_check_cli():
    import os
    import subprocess
    import sys

    env = {k: v for k, v in os.environ.items() if k not in ("PYTHONIOENCODING", "PYTHONUTF8")}
    r = subprocess.run(
        [sys.executable, str(REPO / "tools" / "build_export_bundle.py"), "--check"],
        env=env, capture_output=True,
    )
    assert r.returncode == 0, f"--check lệch hoặc lỗi. {HINT}\n{r.stderr.decode('utf-8', 'replace')}"
    assert b"Traceback" not in r.stderr


def test_export_bundle_deterministic(tmp_path):
    root = _fake_tree(tmp_path)
    first = build_bundle(root)
    assert first == build_bundle(root)
    assert first.startswith("/* TỆP SINH TỰ ĐỘNG")
    assert first.count("\r") == 0
    keys = bundle_mod.source_paths(root)
    assert keys.index("js/sections/a.js") < keys.index("js/sections/b.js")


def test_export_bundle_escapes(tmp_path):
    root = _fake_tree(tmp_path, 'x="</script>"; y="  ";\n')
    out = build_bundle(root)
    assert "</" not in out
    assert " " not in out and " " not in out
    body = out.split("window.__EXPORT_SOURCES = ", 1)[1].rstrip().rstrip(";")
    data = json.loads(body)
    assert data["js/state.js"] == 'x="</script>"; y="  ";\n'
