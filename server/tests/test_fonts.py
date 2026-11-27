"""Đồng bộ phông: FONT_OPTIONS/THEME_PRESETS <-> GOOGLE_FONT_SPECS <-> link Google Fonts."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent


def _read(rel):
    return (ROOT / rel).read_text(encoding="utf-8")


def _block(src, start_pat):
    """Lấy đoạn từ `start_pat` tới dòng '];' hoặc '};' đầu tiên ở cột 0."""
    m = re.search(start_pat, src)
    assert m, start_pat
    end = re.search(r"^[\]}];", src[m.end():], re.M)
    assert end
    return src[m.end():m.end() + end.start()]


def _specs():
    body = _block(_read("js/state.js"), r"const GOOGLE_FONT_SPECS = \{")
    pairs = re.findall(r"'([^']+)':\s*'([^']+)'", body)
    assert len(pairs) >= 20
    return dict(pairs)


def test_phong_dung_trong_state_co_spec():
    src = _read("js/state.js")
    specs = _specs()
    used = set()
    for pat in (r"const FONT_OPTIONS = \[", r"const THEME_PRESETS = \{"):
        used |= set(re.findall(r"\"'([^'\"]+)'", _block(src, pat)))
    assert "Philosopher" in used and "Montserrat" in used
    thieu = sorted(used - set(specs))
    assert not thieu, f"Thiếu spec Google Fonts cho: {thieu}"


def _check_link(text, label):
    thieu = []
    for name, spec in _specs().items():
        if not re.search(r"family=" + re.escape(spec) + r"(?=[&\"'`\s])", text):
            thieu.append(name)
    assert not thieu, f"{label} thiếu spec của: {thieu}"


def test_link_index_html_du_spec():
    _check_link(_read("index.html"), "index.html")


def test_chuoi_export_editor_js_du_spec():
    _check_link(_read("js/editor.js"), "js/editor.js")
