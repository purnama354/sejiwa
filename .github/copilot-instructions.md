# Sejiwa API - AI Assistant Instructions

## Project Overview

Sejiwa is a **mental health discussion platform** providing anonymous, moderated discussions. Built as a Go REST API with Gin framework, PostgreSQL database, and JWT authentication.

## Architecture Patterns

### Repository-Service-Handler Pattern

- **Models** (`internal/models/`): Domain entities (User, Thread, Reply, Report, Category)
- **Repository** (`internal/repository/`): Data access layer with interface patterns
- **Services** (`internal/services/`): Business logic layer (auth_service, thread_service, moderation_service, user_service, search_service)
- **Handlers** (`internal/handlers/`): HTTP request handlers (auth.go, users.go)
- **DTOs** (`internal/dto/`): Request/response structures with validation

### Key Domain Concepts

- **Anonymity-First**: Users identified only by anonymous usernames, no PII
- **Moderation-Heavy**: Comprehensive reporting system with multiple moderation actions
- **Soft Deletes**: Content marked as hidden rather than physically deleted
- **Role-Based Access**: user/moderator/admin roles with different capabilities

## API Structure (from swagger.yaml)

### Core Endpoints

- **Auth**: `/auth/{register,login,logout,refresh}` - JWT-based authentication
- **Threads**: `/threads` - Main discussion content with categories
- **Replies**: `/threads/{id}/replies` - Nested discussions
- **Reports**: `/reports` - Content reporting for moderation
- **Moderation**: `/moderation/reports` - Admin/moderator actions
- **Search**: `/search` - Full-text search across threads/replies

### Authentication & Security

- **JWT tokens** with refresh mechanism
- **Rate limiting** on auth endpoints (423 status for account locks)
- **Role-based permissions** (user/moderator/admin)
- **Content validation** with specific error codes

### Moderation System

Critical feature with sophisticated workflow:

- Users report content with reason categories
- Priority auto-assignment (low/medium/high/critical)
- Multiple moderation actions: dismiss, warn, hide, delete, ban (temp/permanent)
- Audit trail with internal moderator notes
- User history tracking for repeat offenders

## Development Patterns

### Error Handling

Uses structured error responses with specific codes:

```
USERNAME_ALREADY_EXISTS, AUTH_INVALID_CREDENTIALS, THREAD_LOCKED, CONTENT_NOT_FOUND
```

### Validation

- Username pattern: `^[a-zA-Z0-9_-]+$` (3-30 chars)
- Password minimum 8 characters
- Content validation through DTOs in `internal/dto/`

### Database Design

- **PostgreSQL** with migration system (empty `migrations/` suggests planned)
- **UUIDs** for all entity IDs
- **Soft deletes** with `deleted_at` timestamps
- **Audit fields**: created_at, updated_at on all entities

## Technical Stack & Dependencies

### Authentication & Security

```go
// JWT handling
"github.com/golang-jwt/jwt/v5"

// Password hashing
"golang.org/x/crypto/bcrypt"

// Rate limiting
"github.com/ulule/limiter/v3"
"github.com/ulule/limiter/v3/drivers/store/redis"

// CORS handling
"github.com/gin-contrib/cors"

// Secure headers
"github.com/gin-contrib/secure"
```

### Validation & Serialization

```go
// Enhanced validation (built into Gin but extensible)
"github.com/go-playground/validator/v10"

// Custom validation tags
"github.com/go-playground/validator/v10/non-standard/validators"

// UUID handling
"github.com/google/uuid"
```

### Configuration & Environment

```go
// Environment configuration
"github.com/joho/godotenv"
"github.com/kelseyhightower/envconfig"

// Or use Viper for more complex config
"github.com/spf13/viper"
```

### Database & Caching

```go
// Redis for caching and sessions
"github.com/go-redis/redis/v8"

// Database migrations
"gorm.io/driver/postgres"
"gorm.io/gorm"

// Connection pooling (built into GORM v2)
// Database health checks
"github.com/lib/pq" // for PostgreSQL specific features
```

### Logging & Monitoring (for now we dont care about this)

```go
// Structured logging
"github.com/sirupsen/logrus"
// Or
"go.uber.org/zap"

// Request logging middleware
"github.com/gin-contrib/logger"

// Metrics
"github.com/prometheus/client_golang/prometheus"
"github.com/gin-contrib/prom"
```

### Testing

```go
// Testing framework
"github.com/stretchr/testify"

// HTTP testing
"github.com/gavv/httpexpect/v2"

// Database testing
"github.com/DATA-DOG/go-sqlmock"

// Test containers
"github.com/testcontainers/testcontainers-go"
```

### Documentation

```go
// Swagger generation
"github.com/swaggo/swag"
"github.com/swaggo/gin-swagger"
"github.com/swaggo/files"
```

## Key Files & Structure

### Entry Point

- `cmd/server/main.go` - Application bootstrap

### Core Logic

- `internal/config/config.go` - Environment configuration
- `internal/database/connection.go` - DB connection setup
- `internal/middleware/` - HTTP middleware (auth, cors, logging, ratelimit, recovery)
- `internal/utils/` - Common utilities (errors, jwt, pagination, password)

### Support Packages

- `pkg/logger/` - Structured logging
- `pkg/cache/` - Caching layer
- `pkg/validators/` - Custom validation rules

## Development Commands

- Migration scripts in `scripts/migrate.sh` and `scripts/seed.sh`
- Health check endpoint: `/health` with database status
- API documentation in `docs/swagger.yaml` (comprehensive 1800+ lines)

## Mental Health Context

Remember this is a **sensitive domain** platform:

- Content moderation is critical for user safety
- Anonymous usernames protect vulnerable users
- Categories focus on mental health topics (anxiety, depression, relationships)
- Professional resource links are planned features
- Privacy and safety are paramount

## When Working on This Codebase

1. **Check swagger.yaml first** for API contracts and validation rules
2. **Follow the repository pattern** - keep data access in repository layer
3. **Use structured error codes** from the established patterns
4. **Consider moderation impact** for any content-related features
5. **Maintain anonymity** - never expose user PII
6. **Test with mental health sensitivity** in mind
7. **Do it step by step** - this is a complex system, break down tasks
8. **As possible, work on features that can be tested independently** - this helps with iterative development and testing
9. **Work from the easiest to the hardest** - start with simple features, build confidence
10. **The test should be written first** - follow TDD principles where applicable
11. **When installing dependencies, use the latest stable versions also provide the install command eg `go get github.com/gin-gonic/gin@latest`**
