# Lightweight Postgres image suitable for Railway
FROM postgres:16-alpine

# Defaults for local dev; override in Railway with service variables
ENV POSTGRES_DB=sejiwa \
    POSTGRES_USER=sejiwa \
    POSTGRES_PASSWORD=sejiwa \
    TZ=UTC

# Optional: set timezone (keeps logs consistent)
RUN apk add --no-cache tzdata && \
    cp /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Initialize database (extensions, etc.) on first run
COPY initdb/ /docker-entrypoint-initdb.d/

EXPOSE 5432

HEALTHCHECK --interval=10s --timeout=3s --retries=10 CMD pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB" || exit 1
