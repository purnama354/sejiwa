package dto

import "time"

type UpdateCategoryRequest struct {
	Name        *string `json:"name,omitempty" binding:"omitempty,min=3,max=50"`
	Description *string `json:"description,omitempty" binding:"omitempty,max=255"`
	IsLocked    *bool   `json:"is_locked,omitempty"`
}

// AuthResponse defines the structure for successful authentication responses.
type AuthResponse struct {
	AccessToken  string      `json:"access_token"`
	RefreshToken string      `json:"refresh_token"`
	TokenType    string      `json:"token_type"`
	ExpiresIn    int         `json:"expires_in"`
	User         UserProfile `json:"user"`
}

// ErrorResponse defines the standard error response structure
type ErrorResponse struct {
	Error     string            `json:"error"`
	Message   string            `json:"message,omitempty"`
	Success   bool              `json:"success"`
	Code      string            `json:"code"`
	Details   []ValidationError `json:"details,omitempty"`
	Timestamp string            `json:"timestamp"`
}

// SuccessResponse defines the standard success response structure
type SuccessResponse struct {
	Message   string `json:"message"`
	Success   bool   `json:"success"`
	Timestamp string `json:"timestamp"`
}

type CategoryResponse struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Slug        string    `json:"slug"`
	Description string    `json:"description"`
	ThreadCount int       `json:"thread_count"`
	IsLocked    bool      `json:"is_locked"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// ReplyResponse defines the structure for reply responses
type ReplyResponse struct {
	ID               string          `json:"id"`
	Content          string          `json:"content"`
	AuthorUsername   string          `json:"author_username"`
	ThreadID         string          `json:"thread_id"`
	ParentReplyID    *string         `json:"parent_reply_id,omitempty"`
	ModerationStatus string          `json:"moderation_status"`
	IsEdited         bool            `json:"is_edited"`
	CreatedAt        time.Time       `json:"created_at"`
	UpdatedAt        time.Time       `json:"updated_at"`
	ChildReplies     []ReplyResponse `json:"child_replies,omitempty"`
}

// ReplyListResponse for paginated reply lists
type ReplyListResponse struct {
	Replies    []ReplyResponse `json:"replies"`
	Total      int64           `json:"total"`
	Page       int             `json:"page"`
	PageSize   int             `json:"page_size"`
	TotalPages int             `json:"total_pages"`
}

// NewErrorResponse creates a new error response
func NewErrorResponse(error, code string, details []ValidationError) ErrorResponse {
	return ErrorResponse{
		Error:     error,
		Success:   false,
		Code:      code,
		Details:   details,
		Timestamp: time.Now().Format(time.RFC3339),
	}
}

func NewSuccessResponse(message string) SuccessResponse {
	return SuccessResponse{
		Message:   message,
		Success:   true,
		Timestamp: time.Now().Format(time.RFC3339),
	}
}
