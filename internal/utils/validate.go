package utils

import (
	"regexp"
	"sync"

	"github.com/go-playground/validator/v10"
)

var (
	usernameRegex = regexp.MustCompile(`^[a-zA-Z0-9_-]+$`)
	validateOnce  sync.Once
	validate      *validator.Validate
)

func ValidateUsername(fl validator.FieldLevel) bool {
	username := fl.Field().String()
	return usernameRegex.MatchString(username)
}

func RegisterCustomValidators(v *validator.Validate) {
	v.RegisterValidation("alphanum_underscore_hyphen", ValidateUsername)
}

// ValidateStruct validates a struct using the shared validator instance and custom rules.
func ValidateStruct(s interface{}) error {
	validateOnce.Do(func() {
		validate = validator.New()
		RegisterCustomValidators(validate)
	})
	return validate.Struct(s)
}
