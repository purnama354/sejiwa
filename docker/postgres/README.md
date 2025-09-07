# Postgres on Railway (Docker)

This directory provides a Docker image for running Postgres 16 on Railway as a standalone service for the Sejiwa API.

## Image Contents

- Base: `postgres:16-alpine`
- Healthcheck: `pg_isready`
- Init scripts: `initdb/01_init.sql` enabling `uuid-ossp` and `pgcrypto`

## Building locally

```bash
# From repo root
cd docker/postgres
# Build image
docker build -t sejiwa-postgres:16 .
# Run locally
docker run --rm -p 5432:5432 \
  -e POSTGRES_DB=sejiwa \
  -e POSTGRES_USER=sejiwa \
  -e POSTGRES_PASSWORD=sejiwa \
  sejiwa-postgres:16
```

Connection string example for the backend:

```
DATABASE_URL=postgres://sejiwa:sejiwa@localhost:5432/sejiwa?sslmode=disable
```

## Deploying to Railway

1. Create a new service in Railway and choose "Deploy from Dockerfile" pointing to `docker/postgres`.
2. Set service variables (Settings → Variables):
   - `POSTGRES_DB` = your_db_name
   - `POSTGRES_USER` = your_user
   - `POSTGRES_PASSWORD` = a strong password
3. After deploy, Railway will expose a host and port. Compose the `DATABASE_URL` for the API:
   - `postgres://<USER>:<PASSWORD>@<HOST>:<PORT>/<DB>?sslmode=require`
4. Set that `DATABASE_URL` in the API service Settings → Variables along with:
   - `APP_PORT` (e.g., `8080`)
   - `JWT_SECRET` (strong random string)
   - `INITIAL_ADMIN_PASSWORD` (secure string)
   - (optional) `INITIAL_ADMIN_USERNAME` (default `admin`)

The API auto-runs GORM migrations at startup. No external migration step is required.

## Notes

- The defaults in the Dockerfile are for local dev only; Railway variables will override them.
- If Railway offers a managed Postgres plugin in your project, you can use that instead and skip this Docker service. Just copy its `DATABASE_URL` into the API service.
