# Sejiwa - Mental Health Discussion Platform

## 🌱 Project Overview

**Sejiwa** is a comprehensive mental health discussion platform designed to provide anonymous, moderated, and safe spaces for individuals to share their experiences, seek support, and engage in meaningful conversations about mental wellness. The platform prioritizes user safety, anonymity, and community support through sophisticated moderation tools and privacy-first design.

## 🎯 Mission & Aims

### Core Mission

- **Anonymous Support**: Enable users to share vulnerabilities without fear of judgment through anonymous usernames
- **Safe Space**: Maintain a healthy community environment through active moderation and reporting systems
- **Mental Health Focus**: Provide specialized categories for anxiety, depression, relationships, and other mental health topics
- **Community Building**: Foster genuine human connections while protecting user privacy

### Key Objectives

- Reduce stigma around mental health discussions
- Provide accessible peer support for mental wellness
- Create moderated spaces that prioritize user safety
- Enable anonymous sharing for vulnerable populations
- Build community resilience through shared experiences

## 🏗️ Architecture & How It Works

### System Architecture

Sejiwa follows a **Repository-Service-Handler pattern** with clear separation of concerns:

```
Frontend (React/TypeScript) ↔ REST API (Go/Gin) ↔ PostgreSQL Database
                                     ↓
                              Redis (Rate Limiting & Caching)
```

### Core Workflow

1. **User Registration**: Anonymous usernames only (no PII collected)
2. **Category Browsing**: Users discover mental health discussion topics
3. **Thread Creation**: Users create discussion threads in specific categories
4. **Community Interaction**: Reply to threads, save content, engage in discussions
5. **Content Moderation**: Comprehensive reporting and moderation system
6. **Privacy Protection**: All interactions remain anonymous with soft-delete policies

### Key Features

#### 🔐 Privacy & Anonymity

- **Anonymous Usernames**: No real names or personal information required
- **Privacy-First Design**: Users identified only by chosen usernames
- **Soft Deletes**: Content hidden rather than permanently deleted
- **Secure Authentication**: JWT-based auth with refresh tokens

#### 🛡️ Advanced Moderation System

- **Multi-Level Reporting**: Users can report harmful content with categorized reasons
- **Priority-Based Queue**: Automatic priority assignment (Low/Medium/High/Critical)
- **Comprehensive Actions**: Warn, hide, delete, temporary/permanent bans
- **Moderator Tools**: Internal notes, audit trails, user history tracking
- **Role-Based Access**: User/Moderator/Admin with granular permissions

#### 💬 Discussion Features

- **Categorized Threads**: Organized by mental health topics
- **Nested Replies**: Full conversation threading
- **Content Saving**: Users can bookmark important discussions
- **View Tracking**: Thread popularity and engagement metrics
- **Rich Content**: Support for formatted text discussions

#### 📊 User Wellness Tracking

- **Activity Stats**: Thread creation, replies, engagement metrics
- **Wellness Dashboard**: Daily streaks, karma points, active days
- **Category Subscriptions**: Follow preferred discussion topics
- **Personal Analytics**: Track user's community engagement

## 🛠️ Technology Stack

### Backend (API Server)

- **Language**: Go 1.24.1
- **Framework**: Gin (HTTP router and middleware)
- **Database**: PostgreSQL with GORM ORM
- **Authentication**: JWT tokens with refresh mechanism
- **Security**: bcrypt password hashing, CORS, rate limiting
- **Validation**: go-playground/validator with custom rules

### Database & Storage

- **Primary Database**: PostgreSQL
- **ORM**: GORM with migrations
- **Cache/Sessions**: Redis (via ulule/limiter)
- **Database Design**: UUID primary keys, soft deletes, audit fields

### Security & Infrastructure

- **Rate Limiting**: ulule/limiter with Redis backend
- **Password Security**: bcrypt hashing
- **CORS**: gin-contrib/cors for cross-origin requests
- **Environment Config**: godotenv + envconfig for configuration management
- **Input Validation**: Comprehensive request validation with custom validators

### Frontend (Web Application)

- **Framework**: React 19.1.1 with TypeScript
- **Build Tool**: Vite 7.1.2
- **Routing**: React Router DOM 7.8.2
- **State Management**: Zustand 5.0.8 for global state
- **Data Fetching**: TanStack React Query 5.85.5
- **HTTP Client**: Axios 1.11.0

### UI/UX Framework

- **Styling**: Tailwind CSS 4.1.12 with custom design system
- **Components**: Radix UI primitives (@radix-ui/react-\*)
- **Icons**: Lucide React 0.542.0
- **Forms**: React Hook Form 7.62.0 with Zod validation
- **Notifications**: Sonner 2.0.7 for toast messages
- **Animations**: Custom Tailwind animations (tw-animate-css)

### Development & Quality

- **Package Manager**: Bun (frontend)
- **Linting**: ESLint 9.33.0 with TypeScript support
- **Testing**: Testify (Go), DATA-DOG/go-sqlmock for database testing
- **Type Safety**: Full TypeScript coverage with strict configuration

### API & Documentation

- **API Standard**: RESTful API with OpenAPI/Swagger documentation
- **Documentation**: Comprehensive Swagger 2.0 specification (2900+ lines)
- **Validation**: Request/response DTOs with validation tags
- **Error Handling**: Structured error responses with specific error codes

## 📁 Project Structure

### Backend Structure

```
cmd/server/          # Application entry point
internal/
├── config/          # Environment configuration
├── database/        # DB connection, migrations, seeds
├── dto/             # Request/response data structures
├── handlers/        # HTTP request handlers
├── middleware/      # HTTP middleware (auth, CORS, rate limiting)
├── models/          # Domain entities
├── repository/      # Data access layer
├── routes/          # Route definitions
├── services/        # Business logic layer
└── utils/           # Common utilities
```

### Frontend Structure

```
src/
├── components/      # Reusable UI components
├── pages/           # Application pages/routes
├── services/        # API service functions
├── store/           # Global state management
├── types/           # TypeScript type definitions
├── lib/             # Utility libraries
└── hooks/           # Custom React hooks
```

## 🚀 Getting Started

### Prerequisites

- Go 1.24.1+
- Node.js 18+ (for frontend)
- PostgreSQL 13+
- Redis (for rate limiting)

### Backend Setup

```bash
# Install dependencies
go mod download

# Setup environment
cp .env.example .env
# Configure database URL and other settings

# Run migrations and seed data
./scripts/migrate.sh
./scripts/seed.sh

# Start server
go run cmd/server/main.go
```

### Frontend Setup

```bash
cd frontend
bun install
bun run dev
```

## 🔒 Security Features

- **Rate Limiting**: 5 requests/minute on auth endpoints
- **Account Lockout**: Protection against brute force attacks
- **JWT Security**: Secure token handling with refresh mechanism
- **Input Validation**: Comprehensive validation on all endpoints
- **Content Moderation**: Multi-layer content safety system
- **Privacy Protection**: No PII collection, anonymous by design

## 📈 Moderation & Content Safety

The platform includes a sophisticated moderation system designed specifically for mental health communities:

- **Automated Priority Assignment**: Self-harm reports get critical priority
- **Comprehensive Reporting**: Spam, harassment, hate speech, inappropriate content, misinformation
- **Moderation Actions**: Dismiss, warn, hide content, delete, temporary/permanent bans
- **Audit Trail**: Complete history of moderation actions with internal notes
- **Escalation System**: Priority-based queue for efficient moderation

## 🌟 Unique Mental Health Focus

Sejiwa is specifically designed for mental health discussions with:

- **Anonymity Protection**: Safe space for vulnerable sharing
- **Category Focus**: Anxiety, depression, relationships, and wellness topics
- **Wellness Tracking**: Personal progress and engagement metrics
- **Crisis-Aware Moderation**: Special handling for self-harm content
- **Community Guidelines**: Mental health-specific rules and protections

---

_Sejiwa represents a commitment to creating safe, anonymous, and supportive spaces for mental health discussions, built with modern technology and a deep understanding of community needs._
