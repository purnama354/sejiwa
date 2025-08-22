package utils

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/purnama354/sejiwa-api/internal/dto"
)

// GetPaginationParams extracts "page" and "limit" query parameters with defaults and bounds.
func GetPaginationParams(c *gin.Context) (page int, limit int) {
	const (
		defaultPage  = 1
		defaultLimit = 20
		maxLimit     = 100
	)

	pageStr := c.Query("page")
	limitStr := c.Query("limit")

	page = defaultPage
	limit = defaultLimit

	if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
		page = p
	}
	if l, err := strconv.Atoi(limitStr); err == nil && l > 0 && l <= maxLimit {
		limit = l
	} else if l > maxLimit {
		limit = maxLimit
	}

	return
}

func CalculatePagination(total int64, page int64, limit int64) dto.PaginationResponse {
	totalPages := int((total + limit - 1) / limit)
	return dto.PaginationResponse{
		Page:       int(page),
		Limit:      int(limit),
		Total:      total,
		TotalPages: totalPages,
	}
}
