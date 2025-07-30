package utils

import (
	"regexp"

	"github.com/go-playground/validator/v10"
)

var (
	usernameRegex = regexp.MustCompile(`^[a-zA-Z0-9_-]+$`)
)

func ValidateUsername(fl validator.FieldLevel) bool {
	username := fl.Field().String()
	return usernameRegex.MatchString(username)
}

func RegisterCustomValidators(v *validator.Validate) {
	v.RegisterValidation("alphanum_underscore_hyphen", ValidateUsername)
}
