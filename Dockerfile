# syntax=docker/dockerfile:1

# ---------- Build stage ----------
FROM golang:1.24-alpine AS builder
WORKDIR /app

# Enable modules and download deps first (leverages Docker layer cache)
COPY go.mod go.sum ./
# Install git for private/indirect modules and download deps
RUN apk add --no-cache git && \
	go mod download

# Copy the rest of the source
COPY . .

# Build a static binary for Linux
ENV CGO_ENABLED=0
RUN go build -o /app/bin/server ./cmd/server

# ---------- Runtime stage ----------
# Distroless for minimal, secure runtime
FROM gcr.io/distroless/static-debian12:nonroot
WORKDIR /app

# Default port (can be overridden with APP_PORT)
ENV APP_PORT=8080
ENV GIN_MODE=release

# Copy binary from builder
COPY --from=builder /app/bin/server /app/server

# Expose the HTTP port
EXPOSE 8080

# Use non-root user for security
USER nonroot:nonroot

# Start the API server
ENTRYPOINT ["/app/server"]
