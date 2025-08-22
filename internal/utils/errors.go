package utils

import "errors"

// Error codes for structured responses
const (
	ErrCodeUserNotFound   = "USER_NOT_FOUND"
	ErrCodeNotFound       = "NOT_FOUND"
	ErrCodeForbidden      = "FORBIDDEN"
	ErrCodeInternalServer = "INTERNAL_SERVER_ERROR"
	ErrCodeValidation     = "VALIDATION_ERROR"
	ErrCodeUnauthorized   = "UNAUTHORIZED"
	ErrCodeInvalidRequest = "INVALID_REQUEST"
)

// Error variables for internal use
var (
	ErrUserNotFound          = errors.New("user not found")
	ErrModeratorNoteNotFound = errors.New("moderator note not found")
	ErrForbidden             = errors.New("forbidden")
)

// ErrorResponse is the standard error response struct
type ErrorResponse struct {
	Code    string `json:"error"`
	Message string `json:"message"`
}
