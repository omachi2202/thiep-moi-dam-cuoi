FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    THIEP_DATA_DIR=/app/data

WORKDIR /app

COPY server/requirements.txt server/requirements.txt
RUN pip install --no-cache-dir -r server/requirements.txt

# Chỉ chép mã chạy; data/, docs/, tools/, server/tests/ bị loại bởi .dockerignore
COPY server/ server/
COPY js/ js/
COPY css/ css/
COPY index.html invite.html ./

# User không phải root; /app/data ghi được bởi user này
RUN useradd --system --uid 10001 --no-create-home thiep \
    && mkdir -p /app/data \
    && chown -R thiep:thiep /app/data

USER thiep

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD ["python", "-c", "import urllib.request; urllib.request.urlopen('http://localhost:8000/api/health', timeout=5)"]

# Chỉ 1 worker: khoá luồng (threading.Lock) chỉ có hiệu lực trong một tiến trình
CMD ["uvicorn", "server.app:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
