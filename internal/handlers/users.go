package handlers

import (
	"errors"
	"net/http"
	"sejiwa-api/internal/dto"
	"sejiwa-api/internal/middleware"
	"sejiwa-api/internal/services"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UserHandler struct {
	userService services.UserService
}

func NewUserHandler(userService services.UserService) *UserHandler {
	return &UserHandler{userService: userService}
}

// GetProfile retrieves the user profile based on the user ID from the context.
func (h *UserHandler) GetProfile(c *gin.Context) {
	userID, exists := c.Get(middleware.ContextUserIDKey)
	if !exists {
		errorResponse := dto.NewErrorResponse(
			"User ID not found in context",
			"CONTEXT_ERROR",
			nil,
		)
		c.JSON(http.StatusUnauthorized, errorResponse)
		return
	}

	profile, err := h.userService.GetUserProfile(userID.(uuid.UUID))
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			errorResponse := dto.NewErrorResponse(
				"User not found",
				"USER_NOT_FOUND",
				nil,
			)
			c.JSON(http.StatusNotFound, errorResponse)
			return
		}
		errorResponse := dto.NewErrorResponse(
			"Failed to get user profile",
			"INTERNAL_SERVER_ERROR",
			nil,
		)
		c.JSON(http.StatusInternalServerError, errorResponse)
		return
	}

	c.JSON(http.StatusOK, profile)
}

func (h *UserHandler) GetRoleInfo(c *gin.Context) {
	userID, _ := c.Get(middleware.ContextUserIDKey)
	userRole, _ := c.Get(middleware.ContextUserRoleKey)

	// Define permissions based on role
	var permissions []string
	switch userRole {
	case "admin":
		permissions = []string{
			"manage_users",
			"manage_moderators",
			"manage_reports",
			"ban_users",
			"delete_content",
			"manage_categories",
			"view_audit_logs",
		}
	case "moderator":
		permissions = []string{
			"manage_reports",
			"ban_users",
			"delete_content",
			"hide_content",
			"warn_users",
		}
	case "user":
		permissions = []string{
			"create_threads",
			"reply_to_threads",
			"report_content",
		}
	}

	roleInfo := gin.H{
		"user_id":      userID,
		"role":         userRole,
		"permissions":  permissions,
		"is_admin":     userRole == "admin",
		"is_moderator": userRole == "moderator" || userRole == "admin",
		"can_moderate": userRole == "moderator" || userRole == "admin",
		"timestamp":    time.Now().Format(time.RFC3339),
	}

	c.JSON(http.StatusOK, roleInfo)
}
