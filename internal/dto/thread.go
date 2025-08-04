package dto

import "time"

// UpdateThreadRequest defines the structure for updating a thread
type UpdateThreadRequest struct {
	Title   *string `json:"title,omitempty" binding:"omitempty,min=5,max=255"`
	Content *string `json:"content,omitempty" binding:"omitempty,min=10,max=10000"`
}

// ThreadResponse defines the structure for thread responses
type ThreadResponse struct {
	ID               string     `json:"id"`
	Title            string     `json:"title"`
	Content          string     `json:"content"`
	AuthorUsername   string     `json:"author_username"`
	CategoryID       string     `json:"category_id"`
	CategoryName     string     `json:"category_name"`
	CategorySlug     string     `json:"category_slug"`
	ReplyCount       int        `json:"reply_count"`
	ViewCount        int        `json:"view_count"`
	IsPinned         bool       `json:"is_pinned"`
	IsLocked         bool       `json:"is_locked"`
	ModerationStatus string     `json:"moderation_status"`
	IsEdited         bool       `json:"is_edited"`
	CreatedAt        time.Time  `json:"created_at"`
	UpdatedAt        time.Time  `json:"updated_at"`
	LastReplyAt      *time.Time `json:"last_reply_at,omitempty"`
}

// ThreadListResponse for paginated thread lists
type ThreadListResponse struct {
	Threads    []ThreadResponse `json:"threads"`
	Total      int64            `json:"total"`
	Page       int              `json:"page"`
	PageSize   int              `json:"page_size"`
	TotalPages int              `json:"total_pages"`
}

// ThreadModerationRequest for moderation actions
type ThreadModerationRequest struct {
	Action string `json:"action" binding:"required,oneof=pin unpin lock unlock hide unhide delete"`
	Reason string `json:"reason,omitempty" binding:"max=500"`
}
