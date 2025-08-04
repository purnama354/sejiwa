package utils

import (
	"regexp"
	"strings"
)

var (
	// A regex to match any character that is not a letter, number, or hyphen.
	nonSlugChars = regexp.MustCompile(`[^a-z0-9-]+`)
	// A regex to match multiple hyphens.
	multiHyphen = regexp.MustCompile(`-{2,}`)
)

// GenerateSlug creates a URL-friendly slug from a given string.
// It converts the string to lowercase, replaces spaces with hyphens,
// removes special characters, and ensures no duplicate hyphens.
func GenerateSlug(s string) string {
	slug := strings.ToLower(s)
	slug = strings.ReplaceAll(slug, " ", "-")
	slug = nonSlugChars.ReplaceAllString(slug, "")
	slug = multiHyphen.ReplaceAllString(slug, "-")
	slug = strings.Trim(slug, "-")
	return slug
}
