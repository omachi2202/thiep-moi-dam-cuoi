"""App FastAPI cho thiệp cưới online. Logic openpyxl nằm trong excel_store.py."""
import hashlib
import ipaddress
import json
import os
import re
import secrets
import tempfile
import threading
import time
import uuid
from collections import defaultdict, deque
from pathlib import Path
from typing import Literal

from fastapi import FastAPI, File, HTTPException, Request, UploadFile
from fastapi.exceptions import RequestValidationError
from fastapi.responses import FileResponse, JSONResponse, Response
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, ConfigDict, Field

from . import excel_store

REPO_ROOT = Path(__file__).resolve().parent.parent
SLUG_RE = re.compile(r"^[a-z0-9-]{3,50}$")
MAX_STATE_BYTES = 2 * 1024 * 1024
MAX_UPLOAD_BYTES = 10 * 1024 * 1024

# Loại tệp upload: content-type -> phần mở rộng hợp lệ
UPLOAD_TYPES = {
    "image/jpeg": {".jpg", ".jpeg"},
    "image/png": {".png"},
    "image/webp": {".webp"},
    "image/gif": {".gif"},
    "audio/mpeg": {".mp3"},
    "audio/mp4": {".m4a", ".mp4"},
    "audio/ogg": {".ogg"},
    "audio/wav": {".wav"},
    "audio/x-wav": {".wav"},
    "audio/wave": {".wav"},
}


def _magic_ok(ext: str, head: bytes) -> bool:
    """Kiểm chữ ký đầu tệp theo phần mở rộng."""
    if ext in (".jpg", ".jpeg"):
        return head.startswith(b"\xff\xd8\xff")
    if ext == ".png":
        return head.startswith(b"\x89PNG\r\n\x1a\n")
    if ext == ".gif":
        return head.startswith((b"GIF87a", b"GIF89a"))
    if ext == ".webp":
        return head[:4] == b"RIFF" and head[8:12] == b"WEBP"
    if ext == ".wav":
        return head[:4] == b"RIFF" and head[8:12] == b"WAVE"
    if ext == ".mp3":
        return head.startswith(b"ID3") or (len(head) > 1 and head[0] == 0xFF and (head[1] & 0xE0) == 0xE0)
    if ext in (".m4a", ".mp4"):
        return head[4:8] == b"ftyp"
    if ext == ".ogg":
        return head.startswith(b"OggS")
    return False


# ---- Mô hình body ----
class CardState(BaseModel):
    model_config = ConfigDict(extra="allow")


class RsvpBody(BaseModel):
    ten: str = Field(min_length=1, max_length=80)
    sdt: str = Field(default="", max_length=20)
    so_nguoi: int = Field(default=1, ge=1, le=20)
    tham_du: bool = True
    ben: Literal["nha_trai", "nha_gai", ""] = ""
    loi_nhan: str = Field(default="", max_length=500)


class WishBody(BaseModel):
    ten: str = Field(min_length=1, max_length=80)
    loi_chuc: str = Field(min_length=1, max_length=500)


class _NoSniffStatic(StaticFiles):
    async def get_response(self, path, scope):
        resp = await super().get_response(path, scope)
        resp.headers["X-Content-Type-Options"] = "nosniff"
        return resp


def _err(code: int, msg: str):
    return HTTPException(status_code=code, detail=msg)


CREATE_WINDOW = 3600.0
DEFAULT_QUOTA_MB = 2048


def _parse_codes(value) -> list[str]:
    if value is None:
        value = os.environ.get("THIEP_CREATE_CODES", "")
    if isinstance(value, str):
        value = value.split(",")
    return [c.strip() for c in value if c and c.strip()]


def _parse_quota_mb(value) -> int:
    if value is None:
        value = os.environ.get("THIEP_UPLOAD_QUOTA_MB")
    try:
        n = int(value) if value not in (None, "") else DEFAULT_QUOTA_MB
    except (TypeError, ValueError):
        n = DEFAULT_QUOTA_MB
    return n if n > 0 else DEFAULT_QUOTA_MB


def create_app(data_dir=None, rate_limit: int = 10, rate_window: float = 60.0,
               create_codes=None, upload_quota_mb=None, trust_cf=None) -> FastAPI:
    data = Path(data_dir or os.environ.get("THIEP_DATA_DIR") or (REPO_ROOT / "data")).resolve()
    codes = _parse_codes(create_codes)
    quota_bytes = _parse_quota_mb(upload_quota_mb) * 1024 * 1024
    if trust_cf is None:
        trust_cf = os.environ.get("THIEP_TRUST_CF") == "1"
    cards_dir = data / "cards"
    uploads_dir = data / "uploads"
    cards_dir.mkdir(parents=True, exist_ok=True)
    uploads_dir.mkdir(parents=True, exist_ok=True)
    excel_store.configure(data)

    card_lock = threading.Lock()
    hits: dict = defaultdict(deque)
    hits_lock = threading.Lock()

    debug = os.environ.get("THIEP_DEBUG") == "1"
    app = FastAPI(
        title="Thiệp cưới online",
        docs_url="/docs" if debug else None,
        redoc_url="/redoc" if debug else None,
        openapi_url="/openapi.json" if debug else None,
    )

    @app.exception_handler(RequestValidationError)
    async def _validation_handler(request: Request, exc: RequestValidationError):
        return JSONResponse(status_code=422, content={"detail": "Dữ liệu gửi lên không hợp lệ."})

    # ---- Tiện ích ----
    def card_paths(slug: str) -> tuple[Path, Path]:
        if not SLUG_RE.fullmatch(slug):
            raise _err(400, "Mã thiệp (slug) không hợp lệ: chỉ gồm a-z, 0-9, dấu gạch ngang, dài 3–50 ký tự.")
        jp = cards_dir / f"{slug}.json"
        kp = cards_dir / f"{slug}.key"
        root = data.resolve()
        for p in (jp, kp):
            if root not in p.resolve().parents:
                raise _err(400, "Mã thiệp (slug) không hợp lệ.")
        return jp, kp

    def atomic_write(path: Path, content: bytes) -> None:
        fd, tmp = tempfile.mkstemp(suffix=".tmp", dir=str(path.parent))
        try:
            with os.fdopen(fd, "wb") as f:
                f.write(content)
            os.replace(tmp, path)
        finally:
            if os.path.exists(tmp):
                os.remove(tmp)

    def hash_key(k: str) -> str:
        return hashlib.sha256(k.encode("utf-8")).hexdigest()

    def check_key(kp: Path, given: str | None) -> None:
        if not given:
            raise _err(403, "Thiếu khoá chỉnh sửa (X-Edit-Key).")
        try:
            stored = kp.read_text(encoding="utf-8").strip().encode("utf-8")
            digest = hash_key(given).encode("utf-8")
            good = secrets.compare_digest(stored, digest)
        except (OSError, ValueError):  # gồm UnicodeError
            raise _err(403, "Khoá chỉnh sửa không đúng.")
        if not good:
            raise _err(403, "Khoá chỉnh sửa không đúng.")

    last_sweep = [time.monotonic()]
    wins: dict = {}  # cửa sổ riêng của từng khoá bộ đếm

    def client_ip(request: Request) -> str:
        if trust_cf:
            h = (request.headers.get("CF-Connecting-IP") or "").strip()[:64]
            if h:
                try:
                    return str(ipaddress.ip_address(h))
                except ValueError:
                    pass
        return request.client.host if request.client else "?"

    def code_ok(given: str | None) -> bool:
        """So mã tạo thiệp với từng mã (không dừng sớm)."""
        if not codes or not given:
            return False
        g = given.encode("utf-8")
        ok = False
        for c in codes:
            if secrets.compare_digest(c.encode("utf-8"), g):
                ok = True
        return ok

    def rate_check(request: Request, slug: str, kind: str, limit: int | None = None,
                   window: float | None = None) -> None:
        ip = client_ip(request)
        key = (ip, slug, kind)
        limit = rate_limit if limit is None else limit
        win = rate_window if window is None else window
        now = time.monotonic()
        with hits_lock:
            # quét định kỳ các khoá cũ để bộ nhớ không phình
            if now - last_sweep[0] > rate_window:
                last_sweep[0] = now
                for k in [k for k, d in hits.items() if not d or now - d[-1] > wins.get(k, rate_window)]:
                    del hits[k]
                    wins.pop(k, None)
            q = hits[key]
            wins[key] = win
            while q and now - q[0] > win:
                q.popleft()
            if len(q) >= limit:
                if not q:
                    del hits[key]
                raise _err(429, "Bạn gửi quá nhanh, vui lòng thử lại sau ít phút.")
            q.append(now)

    def require_card(slug: str) -> tuple[Path, Path]:
        jp, kp = card_paths(slug)
        if not jp.exists():
            raise _err(404, "Không tìm thấy thiệp.")
        return jp, kp

    @app.exception_handler(excel_store.StoreBusyError)
    async def _busy_handler(request: Request, exc: excel_store.StoreBusyError):
        return JSONResponse(status_code=503, content={
            "detail": "Tệp dữ liệu khách đang được mở ở nơi khác, vui lòng thử lại sau"})

    @app.middleware("http")
    async def _limit_upload_size(request: Request, call_next):
        if request.url.path == "/api/upload":
            cl = request.headers.get("content-length")
            if cl and cl.isdigit() and int(cl) > MAX_UPLOAD_BYTES + 64 * 1024:
                return JSONResponse(status_code=413, content={"detail": "Tệp quá lớn (tối đa 10MB)."})
        return await call_next(request)

    # ---- API ----
    @app.get("/api/health")
    def health():
        return {"ok": True, "needCreateCode": bool(codes)}

    @app.get("/api/cards/{slug}")
    def get_card(slug: str):
        jp, _ = card_paths(slug)
        if not jp.exists():
            raise _err(404, "Không tìm thấy thiệp.")
        return Response(content=jp.read_bytes(), media_type="application/json")

    @app.put("/api/cards/{slug}")
    async def put_card(slug: str, request: Request):
        jp, kp = card_paths(slug)
        too_big = _err(413, "Dữ liệu thiệp quá lớn (tối đa 2MB).")
        cl = request.headers.get("content-length")
        if cl and cl.isdigit() and int(cl) > MAX_STATE_BYTES:
            raise too_big
        buf = bytearray()
        async for chunk in request.stream():
            buf += chunk
            if len(buf) > MAX_STATE_BYTES:
                raise too_big
        def _bad_const(name):
            raise ValueError("NaN/Infinity không hợp lệ")
        try:
            raw = json.loads(bytes(buf), parse_constant=_bad_const)
        except RecursionError:
            raise _err(422, "Dữ liệu thiệp lồng quá sâu.")
        except (ValueError, UnicodeDecodeError):
            raise _err(422, "Dữ liệu thiệp không phải JSON hợp lệ.")
        if not isinstance(raw, dict):
            raise _err(422, "Dữ liệu thiệp phải là một đối tượng JSON.")
        try:
            state = CardState.model_validate(raw).model_dump()
            content = json.dumps(state, ensure_ascii=False, allow_nan=False).encode("utf-8")
        except (RecursionError, ValueError):
            raise _err(422, "Dữ liệu thiệp không hợp lệ.")
        given = request.headers.get("X-Edit-Key")
        with card_lock:
            if jp.exists():
                rate_check(request, slug, "edit", 30)
                check_key(kp, given)
                atomic_write(jp, content)
                return {"ok": True}
            if codes:
                # giới hạn dò mã trước khi so mã
                rate_check(request, "-", "create_code", 10, window=300)
            if codes and not code_ok(request.headers.get("X-Create-Code")):
                raise _err(403, "Cần mã tạo thiệp hợp lệ.")
            rate_check(request, "-", "create", 5, CREATE_WINDOW)
            new_key = secrets.token_urlsafe(24)
            atomic_write(kp, hash_key(new_key).encode("ascii"))
            atomic_write(jp, content)
        return {"editKey": new_key}

    @app.post("/api/upload")
    async def upload(request: Request, file: UploadFile = File(...)):
        rate_check(request, "-", "upload", 20)
        if codes and not code_ok(request.headers.get("X-Create-Code")):
            denied = _err(403, "Cần mã tạo thiệp hoặc khoá chỉnh sửa để tải tệp lên.")
            slug_h = (request.headers.get("X-Card-Slug") or "").strip()
            if not SLUG_RE.fullmatch(slug_h):
                raise denied
            jp_u, kp_u = card_paths(slug_h)
            if not jp_u.exists():
                raise denied
            try:
                check_key(kp_u, request.headers.get("X-Edit-Key"))
            except HTTPException:
                raise denied
        ctype = (file.content_type or "").lower().split(";")[0].strip()
        ext = Path(file.filename or "").suffix.lower()
        if ctype not in UPLOAD_TYPES or ext not in UPLOAD_TYPES[ctype]:
            raise _err(400, "Loại tệp không được hỗ trợ (chỉ ảnh JPEG/PNG/WebP/GIF hoặc âm thanh MP3/M4A/OGG/WAV).")
        chunks, size = [], 0
        while True:
            chunk = await file.read(1024 * 1024)
            if not chunk:
                break
            size += len(chunk)
            if size > MAX_UPLOAD_BYTES:
                raise _err(413, "Tệp quá lớn (tối đa 10MB).")
            chunks.append(chunk)
        blob = b"".join(chunks)
        if not _magic_ok(ext, blob[:16]):
            raise _err(400, "Nội dung tệp không khớp định dạng khai báo.")
        # Đúng nhờ không có `await` giữa lúc quét dung lượng và lúc ghi tệp
        # (+ chạy 1 worker): các upload không chen nhau vượt hạn mức.
        used = 0
        with os.scandir(uploads_dir) as it:
            for e in it:
                try:
                    if e.is_file(follow_symlinks=False):
                        used += e.stat(follow_symlinks=False).st_size
                except OSError:
                    continue
        if used + len(blob) > quota_bytes:
            raise _err(507, "Máy chủ đã hết dung lượng lưu tệp, vui lòng liên hệ quản trị.")
        name = f"{uuid.uuid4().hex}{ext}"
        atomic_write(uploads_dir / name, blob)
        return {"url": f"/uploads/{name}"}

    @app.post("/api/cards/{slug}/verify-key")
    def verify_key(slug: str, request: Request):
        jp, kp = card_paths(slug)
        rate_check(request, "-", "verify", 10)
        if not jp.exists():
            raise _err(404, "Không tìm thấy thiệp.")
        check_key(kp, request.headers.get("X-Edit-Key"))
        return {"ok": True}

    @app.post("/api/cards/{slug}/rsvp")
    def post_rsvp(slug: str, body: RsvpBody, request: Request):
        require_card(slug)
        rate_check(request, slug, "rsvp")
        excel_store.append_rsvp(slug, body.model_dump())
        return {"ok": True}

    @app.post("/api/cards/{slug}/wishes")
    def post_wish(slug: str, body: WishBody, request: Request):
        require_card(slug)
        rate_check(request, slug, "wishes")
        excel_store.append_wish(slug, {**body.model_dump(), "hien_thi": True})
        return {"ok": True}

    @app.get("/api/cards/{slug}/wishes")
    def get_wishes(slug: str, request: Request):
        require_card(slug)
        rate_check(request, slug, "wishes_get", 60)
        return excel_store.list_wishes(slug, limit=200)

    @app.get("/api/cards/{slug}/export.xlsx")
    def export_xlsx(slug: str, request: Request, key: str | None = None):
        jp, kp = card_paths(slug)
        if not jp.exists():
            raise _err(404, "Không tìm thấy thiệp.")
        check_key(kp, request.headers.get("X-Edit-Key") or key)
        return Response(
            content=excel_store.export_slug(slug),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f'attachment; filename="{slug}.xlsx"'},
        )

    # ---- Trang & tệp tĩnh ----
    def serve_page(name: str):
        p = REPO_ROOT / name
        if not p.is_file():
            raise _err(404, f"Chưa có tệp {name}.")
        return FileResponse(p, media_type="text/html")

    @app.get("/")
    def index():
        return serve_page("index.html")

    @app.get("/c/{slug}")
    def invite_page(slug: str):
        card_paths(slug)
        return serve_page("invite.html")

    app.mount("/css", StaticFiles(directory=str(REPO_ROOT / "css"), check_dir=False), name="css")
    app.mount("/js", StaticFiles(directory=str(REPO_ROOT / "js"), check_dir=False), name="js")
    app.mount("/uploads", _NoSniffStatic(directory=str(uploads_dir)), name="uploads")
    return app


app = create_app()
