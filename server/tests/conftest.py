"""Fixture test: mọi app dùng thư mục dữ liệu tạm, không đụng data/ thật."""
import os
import tempfile

# Phải đặt TRƯỚC khi import server.app (import đó tạo app mặc định).
_IMPORT_DIR = tempfile.mkdtemp(prefix="thiep_import_")
os.environ["THIEP_DATA_DIR"] = _IMPORT_DIR
os.environ.pop("THIEP_DEBUG", None)
for _n in ("THIEP_CREATE_CODES", "THIEP_TRUST_CF", "THIEP_UPLOAD_QUOTA_MB"):
    os.environ.pop(_n, None)

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from server.app import create_app  # noqa: E402


@pytest.fixture
def data_dir(tmp_path, monkeypatch):
    monkeypatch.setenv("THIEP_DATA_DIR", str(tmp_path))
    monkeypatch.delenv("THIEP_DEBUG", raising=False)
    for name in ("THIEP_CREATE_CODES", "THIEP_TRUST_CF", "THIEP_UPLOAD_QUOTA_MB"):
        monkeypatch.delenv(name, raising=False)
    return tmp_path


@pytest.fixture
def make_client(data_dir):
    """Tạo TestClient mới (app mới) với tham số rate limit tuỳ chọn."""
    clients = []

    def _make(**kwargs):
        kwargs.setdefault("rate_limit", 1000)
        c = TestClient(create_app(data_dir, **kwargs))
        clients.append(c)
        return c

    yield _make
    for c in clients:
        c.close()


@pytest.fixture
def client(make_client):
    return make_client()
