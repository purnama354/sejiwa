erDiagram
users ||--o{ threads : creates
users ||--o{ replies : creates
users ||--o{ reports : submits
users ||--o{ moderation_actions : performs
users ||--o{ user_bans : receives
users ||--o{ refresh_tokens : has

    categories ||--o{ threads : contains

    threads ||--o{ replies : has
    threads ||--o{ reports : reported_as

    replies ||--o{ reports : reported_as

    reports ||--o{ moderation_actions : generates
    moderation_actions ||--o{ user_bans : creates

    users {
        uuid id PK
        varchar username UK
        varchar password_hash
        enum role
        enum status
        int thread_count
        int reply_count
        timestamp last_active_at
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    categories {
        uuid id PK
        varchar name UK
        text description
        varchar slug UK
        varchar color
        boolean is_active
        int thread_count
        timestamp created_at
        timestamp updated_at
    }

    threads {
        uuid id PK
        varchar title
        text content
        uuid author_id FK
        uuid category_id FK
        int reply_count
        int view_count
        boolean is_pinned
        boolean is_locked
        enum moderation_status
        boolean is_edited
        timestamp last_reply_at
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    replies {
        uuid id PK
        text content
        uuid author_id FK
        uuid thread_id FK
        enum moderation_status
        boolean is_edited
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    reports {
        uuid id PK
        enum content_type
        uuid content_id
        uuid reporter_id FK
        uuid reported_user_id FK
        enum reason
        text description
        enum status
        enum priority
        timestamp created_at
        timestamp updated_at
    }

    moderation_actions {
        uuid id PK
        uuid report_id FK
        uuid moderator_id FK
        uuid content_id
        enum content_type
        uuid reported_user_id FK
        enum action
        text reason
        text internal_notes
        timestamp ban_expires_at
        timestamp created_at
    }

    user_bans {
        uuid id PK
        uuid user_id FK
        uuid moderator_id FK
        uuid moderation_action_id FK
        enum ban_type
        text reason
        timestamp expires_at
        boolean is_active
        timestamp created_at
    }

    refresh_tokens {
        uuid id PK
        uuid user_id FK
        varchar token_hash UK
        timestamp expires_at
        boolean is_revoked
        timestamp created_at
    }
