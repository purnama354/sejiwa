package handlers

import (
	"errors"
	"net/http"
	"sejiwa-api/internal/dto"
	"sejiwa-api/internal/middleware"
	"sejiwa-api/internal/models"
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
	userRoleInterface, _ := c.Get(middleware.ContextUserRoleKey)

	// Convert the role to string for comparison
	var userRole string
	if role, ok := userRoleInterface.(models.UserRole); ok {
		userRole = string(role)
	} else if roleStr, ok := userRoleInterface.(string); ok {
		userRole = roleStr
	} else {
		errorResponse := dto.NewErrorResponse(
			"Invalid role type in context",
			"CONTEXT_ERROR",
			nil,
		)
		c.JSON(http.StatusInternalServerError, errorResponse)
		return
	}

	// Define permissions based on role
	var permissions []string
	switch userRole {
	case string(models.RoleAdmin):
		permissions = []string{
			"manage_users",
			"manage_moderators",
			"manage_reports",
			"ban_users",
			"delete_content",
			"manage_categories",
			"view_audit_logs",
		}
	case string(models.RoleModerator):
		permissions = []string{
			"manage_reports",
			"ban_users",
			"delete_content",
			"hide_content",
			"warn_users",
		}
	case string(models.RoleUser):
		permissions = []string{
			"create_threads",
			"reply_to_threads",
			"report_content",
		}
	default:
		permissions = []string{}
	}

	roleInfo := gin.H{
		"user_id":      userID,
		"role":         userRole,
		"permissions":  permissions,
		"is_admin":     userRole == string(models.RoleAdmin),
		"is_moderator": userRole == string(models.RoleModerator) || userRole == string(models.RoleAdmin),
		"can_moderate": userRole == string(models.RoleModerator) || userRole == string(models.RoleAdmin),
		"timestamp":    time.Now().Format(time.RFC3339),
	}

	c.JSON(http.StatusOK, roleInfo)
}
