package utils

import (
	"sejiwa-api/internal/dto"
	"strings"

	"github.com/go-playground/validator/v10"
)

// ParseValidationErrors converts Gin validation errors to our standard format
func ParseValidationErrors(err error) []dto.ValidationError {
	var validationErrors []dto.ValidationError

	if validationErr, ok := err.(validator.ValidationErrors); ok {
		for _, fieldErr := range validationErr {
			validationError := dto.ValidationError{
				Field:   strings.ToLower(fieldErr.Field()),
				Code:    getValidationErrorCode(fieldErr.Tag()),
				Message: getValidationErrorMessage(fieldErr),
			}
			validationErrors = append(validationErrors, validationError)
		}
	}

	return validationErrors
}

// getValidationErrorCode maps validation tags to error codes
func getValidationErrorCode(tag string) string {
	switch tag {
	case "required":
		return "FIELD_REQUIRED"
	case "min":
		return "FIELD_TOO_SHORT"
	case "max":
		return "FIELD_TOO_LONG"
	case "alphanum_underscore_hyphen":
		return "FIELD_INVALID_FORMAT"
	default:
		return "FIELD_INVALID"
	}
}

// getValidationErrorMessage creates human-readable error messages
func getValidationErrorMessage(fieldErr validator.FieldError) string {
	fieldName := strings.ToLower(fieldErr.Field())

	switch fieldErr.Tag() {
	case "required":
		return fieldName + " is required"
	case "min":
		return fieldName + " must be at least " + fieldErr.Param() + " characters long"
	case "max":
		return fieldName + " must be at most " + fieldErr.Param() + " characters long"
	case "alphanum_underscore_hyphen":
		return fieldName + " can only contain letters, numbers, underscores, and hyphens"
	default:
		return fieldName + " is invalid"
	}
}
