"""Toàn bộ đọc/ghi guests.xlsx. Mọi chu trình load -> sửa -> save nằm trong một Lock.

LƯU Ý: khoá chỉ có hiệu lực trong một tiến trình, nên chỉ chạy 1 worker uvicorn
(không dùng --workers > 1).
"""
import io
import logging
import os
import secrets
import tempfile
import zipfile
import threading
from datetime import datetime, timedelta, timezone
from pathlib import Path

from openpyxl import Workbook, load_workbook
from openpyxl.cell.cell import ILLEGAL_CHARACTERS_RE
from openpyxl.utils.exceptions import InvalidFileException

log = logging.getLogger("thiep.excel_store")

_CORRUPT_ERRORS = (zipfile.BadZipFile, InvalidFileException, KeyError, ValueError, EOFError)


class StoreBusyError(Exception):
    """Tệp xlsx đang bị khoá (vd Excel đang mở) nên không ghi được."""

# Khoá cấp module: bọc trọn mỗi chu trình đọc/ghi
_LOCK = threading.Lock()
_XLSX_PATH: Path | None = None

HEADERS = {
    "RSVP": ["thoi_gian", "slug", "ten", "sdt", "so_nguoi", "tham_du", "ben", "loi_nhan"],
    "LoiChuc": ["thoi_gian", "slug", "ten", "loi_chuc", "hien_thi"],
    "KhachMoi": ["slug", "ten", "sdt", "ben", "ghi_chu", "link"],
}

_DANGEROUS = ("=", "+", "-", "@", "\t", "\r")


def configure(data_dir) -> Path:
    """Đặt thư mục dữ liệu; tạo guests.xlsx kèm header nếu chưa có."""
    global _XLSX_PATH
    d = Path(data_dir)
    d.mkdir(parents=True, exist_ok=True)
    with _LOCK:
        _XLSX_PATH = d / "guests.xlsx"
        try:
            wb = _load()
            _save(wb)
        except Exception as e:  # không để sập lúc import; lần ghi sau sẽ thử lại
            log.warning("Không khởi tạo được guests.xlsx: %s", type(e).__name__)
    return _XLSX_PATH


def _now_iso() -> str:
    try:
        from zoneinfo import ZoneInfo
        tz = ZoneInfo("Asia/Ho_Chi_Minh")
    except Exception:  # máy thiếu tzdata
        tz = timezone(timedelta(hours=7))
    return datetime.now(tz).isoformat(timespec="seconds")


def _safe_cell(v):
    """Chống công thức độc: ô chuỗi bắt đầu bằng = + - @ được thêm tiền tố '."""
    if isinstance(v, str):
        v = ILLEGAL_CHARACTERS_RE.sub("", v)
    if isinstance(v, str) and v.startswith(_DANGEROUS):
        return "'" + v
    return v


def _unsafe_cell(v):
    if isinstance(v, str) and len(v) > 1 and v[0] == "'" and v[1] in _DANGEROUS:
        return v[1:]
    return v


def _ensure_sheets(wb: Workbook) -> None:
    for name, cols in HEADERS.items():
        if name not in wb.sheetnames:
            ws = wb.create_sheet(name)
            ws.append(cols)
    if "Sheet" in wb.sheetnames and wb["Sheet"].max_row <= 1 and wb["Sheet"].max_column <= 1 \
            and wb["Sheet"]["A1"].value is None:
        del wb["Sheet"]


def _load() -> Workbook:
    assert _XLSX_PATH is not None, "excel_store chưa được configure()"
    wb = None
    if _XLSX_PATH.exists():
        try:
            wb = load_workbook(_XLSX_PATH)
            _ensure_sheets(wb)
        except _CORRUPT_ERRORS as e:  # chỉ các lỗi hỏng tệp thật sự mới cách ly
            stamp = datetime.now().strftime("%Y%m%d%H%M%S")
            bad = _XLSX_PATH.with_name(f"guests.corrupt-{stamp}-{secrets.token_hex(2)}.xlsx")
            try:
                os.replace(_XLSX_PATH, bad)
            except OSError:
                raise StoreBusyError()
            log.warning("guests.xlsx hỏng (%s), đã đổi tên thành %s", type(e).__name__, bad.name)
            wb = None
        except OSError:
            # lỗi I/O thoáng qua (khoá tệp, v.v.): không đụng tới tệp gốc, app trả 503
            raise StoreBusyError()
    if wb is None:
        wb = Workbook()
        _ensure_sheets(wb)
    return wb


def _save(wb: Workbook) -> None:
    """Ghi tệp tạm cùng thư mục rồi os.replace."""
    assert _XLSX_PATH is not None
    fd, tmp = tempfile.mkstemp(suffix=".tmp", dir=str(_XLSX_PATH.parent))
    os.close(fd)
    try:
        wb.save(tmp)
        try:
            os.replace(tmp, _XLSX_PATH)
        except PermissionError:
            raise StoreBusyError()
    finally:
        if os.path.exists(tmp):
            os.remove(tmp)


def _append(sheet: str, values: list) -> None:
    with _LOCK:
        wb = _load()
        wb[sheet].append([_safe_cell(v) for v in values])
        _save(wb)


def append_rsvp(slug: str, row: dict) -> None:
    _append("RSVP", [
        _now_iso(), slug,
        row.get("ten", ""), row.get("sdt", ""), row.get("so_nguoi", 1),
        bool(row.get("tham_du", True)), row.get("ben", ""), row.get("loi_nhan", ""),
    ])


def append_wish(slug: str, row: dict) -> None:
    _append("LoiChuc", [
        _now_iso(), slug, row.get("ten", ""), row.get("loi_chuc", ""),
        bool(row.get("hien_thi", True)),
    ])


def _is_true(v) -> bool:
    return v is True or (isinstance(v, str) and v.strip().upper() == "TRUE")


def list_wishes(slug: str, limit: int = 200) -> list[dict]:
    """Lời chúc hiện thị của slug, mới nhất trước."""
    with _LOCK:
        wb = _load()
        rows = list(wb["LoiChuc"].iter_rows(min_row=2, values_only=True))
    out = []
    for r in reversed(rows):
        r = list(r) + [None] * (5 - len(r))
        if r[1] != slug or not _is_true(r[4]):
            continue
        out.append({
            "ten": _unsafe_cell(r[2]) or "",
            "loi_chuc": _unsafe_cell(r[3]) or "",
            "thoi_gian": r[0] or "",
        })
        if len(out) >= limit:
            break
    return out


def export_slug(slug: str) -> bytes:
    """Xuất xlsx chỉ gồm RSVP và LoiChuc của đúng slug."""
    with _LOCK:
        src = _load()
        data = {n: list(src[n].iter_rows(min_row=2, values_only=True)) for n in ("RSVP", "LoiChuc")}
    wb = Workbook()
    wb.remove(wb.active)
    for name in ("RSVP", "LoiChuc"):
        ws = wb.create_sheet(name)
        ws.append(HEADERS[name])
        for r in data[name]:
            if len(r) > 1 and r[1] == slug:
                ws.append(list(r))
    buf = io.BytesIO()
    wb.save(buf)
    return buf.getvalue()
