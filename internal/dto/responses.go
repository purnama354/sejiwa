package dto

import "time"

type CreateCategoryRequest struct {
	Name        string `json:"name" binding:"required,min=3,max=50"`
	Description string `json:"description,omitempty" binding:"max=255"`
}

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
