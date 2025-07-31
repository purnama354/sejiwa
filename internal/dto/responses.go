package dto

import "time"

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

// SuccessResponse defines the standard success response structure
type SuccessResponse struct {
	Message   string `json:"message"`
	Success   bool   `json:"success"`
	Timestamp string `json:"timestamp"`
}
